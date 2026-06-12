import { Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AttachmentManager } from "../../components/admin/AttachmentManager";
import { MarkdownEditor } from "../../components/admin/MarkdownEditor";
import { PdfImportDialog } from "../../components/admin/PdfImportDialog";
import { ErrorState } from "../../components/common/ErrorState";
import { adminApi } from "../../lib/api/admin";
import type { Folder } from "../../lib/api/portal";
import { errorMessage } from "../../lib/error-messages";
import { Button } from "../../ui-components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui-components/card";
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.folders().then((items) => {
      setFolders(items);
      setFolderId((current) => current || items[0]?.id || 0);
    });
    if (editingId) {
      adminApi.article(editingId).then((article) => {
        setFolderId(article.folderId);
        setTitle(article.title);
        setBody(article.body);
      }).catch((err) => setError(errorMessage(err)));
    }
  }, [editingId]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      const input = { folderId, title, body };
      const article = savedId ? await adminApi.updateArticle(savedId, input) : await adminApi.createArticle(input);
      setSavedId(article.id);
      navigate(`/admin/articles/${article.id}/edit`, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>문서 편집</CardTitle>
            <PdfImportDialog onImport={(nextTitle, markdown) => {
              setTitle(nextTitle);
              setBody(markdown);
            }} />
          </div>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={onSubmit}>
            <Input aria-label="제목" placeholder="제목" value={title} onChange={(event) => setTitle(event.target.value)} />
            <select className="h-10 rounded-md border border-[var(--border)] px-3" value={folderId} onChange={(event) => setFolderId(Number(event.target.value))}>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>{folder.title}</option>
              ))}
            </select>
            <MarkdownEditor body={body} title={title} onChange={setBody} />
            {error ? <ErrorState message={error} /> : null}
            <Button className="w-fit" disabled={!folderId || !title.trim()} type="submit">
              <Save size={18} />
              저장
            </Button>
          </form>
        </CardContent>
      </Card>
      {savedId ? <AttachmentManager refId={savedId} refType="ARTICLE" /> : null}
    </div>
  );
}
