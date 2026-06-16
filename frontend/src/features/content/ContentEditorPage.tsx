import { AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";
import { MarkdownEditor } from "../../components/editor/MarkdownEditor";
import { MarkdownPreview } from "../../components/editor/MarkdownPreview";
import { MediaPickerDialog } from "../media/MediaPickerDialog";
import { demoContent, demoTerms } from "../../services/demoData";
import type { ContentItem } from "../../services/cmsTypes";
import { PublishPanel } from "./PublishPanel";

function renderMarkdown(markdown: string, title: string, summary: string) {
  const warnings: string[] = [];
  if (/!\[\]\(/.test(markdown)) {
    warnings.push("이미지 대체 텍스트가 비어 있습니다.");
  }
  const body = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p>");
  return {
    html: `<article class="cms-preview"><h1>${title}</h1><p class="summary">${summary}</p><p>${body}</p></article>`,
    warnings
  };
}

export function ContentEditorPage() {
  const seed = demoContent[0];
  const [content, setContent] = useState<ContentItem>({ ...seed, status: "DRAFT", title: "새 CMS 콘텐츠", slug: "new-cms-content" });
  const [scheduledAt, setScheduledAt] = useState("");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [conflictVisible, setConflictVisible] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);

  const preview = useMemo(() => renderMarkdown(content.markdownBody, content.title, content.summary), [content.markdownBody, content.summary, content.title]);

  const updateField = (field: "title" | "slug" | "summary" | "markdownBody", value: string) => {
    setContent((current) => ({ ...current, [field]: value, updatedAt: new Date().toISOString() }));
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground dark:text-white">새 콘텐츠</h1>
          <p className="text-sm text-muted-foreground">마크다운 초안을 작성하고 검토 또는 게시 상태로 전환합니다.</p>
        </div>
        <div className="flex gap-3">
          <button className="button-base border border-primary bg-transparent text-primary hover:bg-primary hover:text-white" type="button">
            미리보기
          </button>
          <button className="button-base bg-primary text-white hover:bg-primaryemphasis" type="button" onClick={() => setLastSaved(new Date().toLocaleTimeString("ko-KR"))}>
            초안 저장
          </button>
        </div>
      </div>

      {conflictVisible ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md bg-lightwarning p-4">
          <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-white/80">
            <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
            최신 revision이 있습니다. Compare, Reload latest, Save as new draft 중 하나를 선택하세요.
          </div>
          <button className="button-base h-9 border border-warning bg-transparent px-3 text-warning hover:bg-warning hover:text-white" type="button" onClick={() => setConflictVisible(false)}>
            확인
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 lg:col-span-8">
          <div className="card-box">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground dark:text-white" htmlFor="title">
                  제목
                </label>
                <input id="title" className="form-control" value={content.title} onChange={(event) => updateField("title", event.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground dark:text-white" htmlFor="slug">
                  Slug
                </label>
                <input id="slug" className="form-control" value={content.slug} onChange={(event) => updateField("slug", event.target.value)} />
              </div>
            </div>
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-foreground dark:text-white" htmlFor="summary">
                요약
              </label>
              <textarea id="summary" className="form-control h-24" value={content.summary} onChange={(event) => updateField("summary", event.target.value)} />
              <p className="mt-2 text-xs text-muted-foreground">{content.summary.length}/300 · {lastSaved ? `${lastSaved} 저장됨` : "아직 저장되지 않음"}</p>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground dark:text-white" htmlFor="category">카테고리</label>
                <select id="category" className="form-control" defaultValue={content.categories[0]?.id}>
                  {demoTerms.filter((term) => term.type === "CATEGORY").map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground dark:text-white" htmlFor="tag">태그</label>
                <select id="tag" className="form-control" defaultValue={content.tags[0]?.id}>
                  {demoTerms.filter((term) => term.type === "TAG").map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground dark:text-white">대표 이미지</label>
                <button className="button-base w-full border border-primary bg-transparent text-primary hover:bg-primary hover:text-white" type="button" onClick={() => setPickerOpen(true)}>
                  {content.featuredMedia ? content.featuredMedia.fileName : "Media 선택"}
                </button>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
              <MarkdownEditor value={content.markdownBody} onChange={(markdownBody) => updateField("markdownBody", markdownBody)} />
              <MarkdownPreview html={preview.html} warnings={preview.warnings} />
            </div>
          </div>
        </section>
        <section className="col-span-12 lg:col-span-4">
          <PublishPanel
            content={content}
            scheduledAt={scheduledAt}
            onScheduleChange={setScheduledAt}
            onSave={() => setLastSaved(new Date().toLocaleTimeString("ko-KR"))}
            onSubmit={() => setContent((current) => ({ ...current, status: "IN_REVIEW" }))}
            onPublish={() => setContent((current) => ({ ...current, status: "PUBLISHED", publishedAt: new Date().toISOString() }))}
            onPreview={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          />
        </section>
      </div>
      <MediaPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => {
          setContent((current) => ({ ...current, featuredMedia: asset }));
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
