import { AlertTriangle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MarkdownEditor } from "../../components/editor/MarkdownEditor";
import { MarkdownPreview } from "../../components/editor/MarkdownPreview";
import { LoadingPanel } from "../../components/feedback/UIState";
import { MediaPickerDialog } from "../media/MediaPickerDialog";
import { taxonomyApi } from "../../services/taxonomyApi";
import { contentApi } from "./content.api";
import { PublishPanel } from "./PublishPanel";
import type { ContentItem, MediaAsset, TaxonomyTerm } from "../../services/cmsTypes";

function renderMarkdown(markdown: string, title: string, summary: string) {
  const warnings: string[] = [];
  if (/!\[\]\(/.test(markdown)) warnings.push("이미지 대체 텍스트가 비어 있습니다.");
  const body = markdown.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>").replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n\n/g, "</p><p>");
  return { html: `<article class="cms-preview"><h1>${title}</h1><p class="summary">${summary}</p><p>${body}</p></article>`, warnings };
}

const empty: ContentItem = {
  id: "", contentType: "ARTICLE", title: "", slug: "", status: "DRAFT",
  summary: "", markdownBody: "", visibility: "PUBLIC", featuredMedia: null,
  categories: [], tags: [], revisionsCount: 0,
  author: { id: "", email: "", displayName: "" },
  publishedAt: null, scheduledAt: null, updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(), archivedAt: null
};

export function ContentEditorPage() {
  const { contentId } = useParams<{ contentId?: string }>();
  const navigate = useNavigate();
  const isNew = !contentId;

  const [content, setContent] = useState<ContentItem>(empty);
  const [terms, setTerms] = useState<TaxonomyTerm[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    taxonomyApi.list().then(setTerms);
    if (!isNew && contentId) {
      contentApi.get(contentId).then((c) => { setContent(c); }).finally(() => setLoading(false));
    }
  }, [contentId, isNew]);

  const preview = useMemo(() => renderMarkdown(content.markdownBody, content.title, content.summary), [content.markdownBody, content.summary, content.title]);

  const updateField = (field: keyof ContentItem, value: unknown) =>
    setContent((c) => ({ ...c, [field]: value, updatedAt: new Date().toISOString() }));

  async function handleSave() {
    setSaving(true); setError(null);
    try {
      const payload = {
        contentType: content.contentType, title: content.title, slug: content.slug,
        summary: content.summary, markdownBody: content.markdownBody, visibility: content.visibility,
        featuredMediaId: content.featuredMedia?.id ?? null,
        categoryIds: content.categories.map((c) => c.id),
        tagIds: content.tags.map((t) => t.id)
      };
      const saved = isNew ? await contentApi.create(payload) : await contentApi.update(content.id, payload);
      setContent(saved);
      setLastSaved(new Date().toLocaleTimeString("ko-KR"));
      if (isNew) navigate(`/content/${saved.id}/edit`, { replace: true });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "저장 실패");
    } finally { setSaving(false); }
  }

  async function handleSubmit() {
    if (!content.id) { await handleSave(); return; }
    const updated = await contentApi.submit(content.id);
    setContent(updated);
  }

  async function handlePublish() {
    if (!content.id) return;
    const updated = await contentApi.publish(content.id);
    setContent(updated);
  }

  if (loading) return <LoadingPanel label="콘텐츠 로딩 중" />;

  const categories = terms.filter((t) => t.type === "CATEGORY");
  const tags = terms.filter((t) => t.type === "TAG");

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground dark:text-white">{isNew ? "새 콘텐츠" : "콘텐츠 편집"}</h1>
          <p className="text-sm text-muted-foreground">마크다운 초안을 작성하고 검토 또는 게시 상태로 전환합니다.</p>
        </div>
        <button className="button-base bg-primary text-white hover:bg-primaryemphasis" type="button" onClick={handleSave} disabled={saving}>
          {saving ? "저장 중..." : "초안 저장"}
        </button>
      </div>
      {error && <div className="mb-4 rounded-md bg-lighterror p-3 text-sm text-error">{error}</div>}
      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 lg:col-span-8">
          <div className="card-box">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground dark:text-white" htmlFor="title">제목</label>
                <input id="title" className="form-control" value={content.title} onChange={(e) => updateField("title", e.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground dark:text-white" htmlFor="slug">Slug</label>
                <input id="slug" className="form-control" value={content.slug} onChange={(e) => updateField("slug", e.target.value)} />
              </div>
            </div>
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-foreground dark:text-white" htmlFor="summary">요약</label>
              <textarea id="summary" className="form-control h-24" value={content.summary} onChange={(e) => updateField("summary", e.target.value)} />
              <p className="mt-2 text-xs text-muted-foreground">{content.summary.length}/300 · {lastSaved ? `${lastSaved} 저장됨` : "아직 저장되지 않음"}</p>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground dark:text-white">카테고리</label>
                <select className="form-control" value={content.categories[0]?.id ?? ""} onChange={(e) => { const t = categories.find((c) => c.id === e.target.value); updateField("categories", t ? [t] : []); }}>
                  <option value="">선택</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground dark:text-white">태그</label>
                <select className="form-control" value={content.tags[0]?.id ?? ""} onChange={(e) => { const t = tags.find((t) => t.id === e.target.value); updateField("tags", t ? [t] : []); }}>
                  <option value="">선택</option>
                  {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
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
              <MarkdownEditor value={content.markdownBody} onChange={(v) => updateField("markdownBody", v)} />
              <MarkdownPreview html={preview.html} warnings={preview.warnings} />
            </div>
          </div>
        </section>
        <section className="col-span-12 lg:col-span-4">
          <PublishPanel
            content={content}
            scheduledAt={scheduledAt}
            onScheduleChange={setScheduledAt}
            onSave={handleSave}
            onSubmit={handleSubmit}
            onPublish={handlePublish}
            onPreview={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          />
        </section>
      </div>
      <MediaPickerDialog open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(asset) => { updateField("featuredMedia", asset); setPickerOpen(false); }} />
    </div>
  );
}
