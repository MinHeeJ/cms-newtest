import { Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AttachmentManager } from "../../components/admin/AttachmentManager";
import { MarkdownEditor } from "../../components/admin/MarkdownEditor";
import { PdfImportDialog } from "../../components/admin/PdfImportDialog";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { adminApi } from "../../lib/api/admin";
import type { Folder } from "../../lib/api/portal";
import { errorMessage } from "../../lib/error-messages";
import { Button } from "../../ui-components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui-components/card";
import { Input } from "../../ui-components/input";

export function ArticleEditorPage() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const editingId = articleId && articleId !== "new" ? Number(articleId) : null;
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderId, setFolderId] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("# 새 문서\n");
  const [savedId, setSavedId] = useState<number | null>(editingId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const folderRequest = adminApi.folders().then((items) => {
      setFolders(items);
      setFolderId((current) => current || items[0]?.id || 0);
    });
    const articleRequest = editingId
      ? adminApi.article(editingId).then((article) => {
          setFolderId(article.folderId);
          setTitle(article.title);
          setBody(article.body);
        })
      : Promise.resolve();

    Promise.all([folderRequest, articleRequest])
      .then(() => setError(null))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [editingId]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      const input = { folderId, title, body };
      const article = savedId ? await adminApi.updateArticle(savedId, input) : await adminApi.createArticle(input);
      setSavedId(article.id);
      setError(null);
      navigate(`/admin/articles/${article.id}/edit`, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">문서 편집</h1>
          <p className="text-muted-foreground">마크다운 기반 문서를 작성하고 PDF를 임포트할 수 있습니다.</p>
        </div>
        <PdfImportDialog onImport={(nextTitle, markdown) => {
          setTitle(nextTitle);
          setBody(markdown);
        }} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "문서 수정" : "새 문서"}</CardTitle>
          <CardDescription>제목, 폴더, 본문을 입력한 뒤 저장하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <LoadingState /> : null}
          {!loading && folders.length === 0 && !error ? <EmptyState message="문서를 저장할 폴더가 없습니다." /> : null}
          {!loading ? (
            <form className="grid gap-4" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="article-title">제목</label>
                <Input id="article-title" aria-label="제목" placeholder="제목" value={title} onChange={(event) => setTitle(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="article-folder">폴더</label>
                <select id="article-folder" className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none" value={folderId} onChange={(event) => setFolderId(Number(event.target.value))}>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>{folder.title}</option>
                  ))}
                </select>
              </div>
              <MarkdownEditor body={body} title={title} onChange={setBody} />
              {error ? <ErrorState message={error} /> : null}
              <Button className="w-fit" disabled={!folderId || !title.trim()} type="submit">
                <Save className="size-4" />
                저장
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
      {savedId ? <AttachmentManager refId={savedId} refType="ARTICLE" /> : null}
    </div>
  );
}
