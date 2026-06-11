import { Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AttachmentManager } from "../../components/admin/AttachmentManager";
import { MarkdownEditor } from "../../components/admin/MarkdownEditor";
import { PdfImportDialog } from "../../components/admin/PdfImportDialog";
import { ErrorState } from "../../components/common/ErrorState";
import { createArticle, fetchAdminArticle, fetchAdminFolders, updateArticle } from "../../lib/api/admin";
import { userMessage } from "../../lib/error-messages";
import type { Folder } from "../../types/api";
import { Button } from "../../ui-components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui-components/card";
import { Input } from "../../ui-components/input";

export function ArticleEditorPage() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderId, setFolderId] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [bodyMarkdown, setBodyMarkdown] = useState("# 새 문서\n");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminFolders()
      .then((items) => {
        setFolders(items);
        if (items[0]) setFolderId(items[0].id);
      })
      .catch((err) => setError(userMessage(err)));
  }, []);

  useEffect(() => {
    if (!articleId) return;
    fetchAdminArticle(Number(articleId))
      .then((article) => {
        setFolderId(article.folderId);
        setTitle(article.title);
        setBodyMarkdown(article.bodyMarkdown);
      })
      .catch((err) => setError(userMessage(err)));
  }, [articleId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const payload = { folderId, title, bodyMarkdown, sortOrder: 0 };
      if (articleId) await updateArticle(Number(articleId), payload);
      else await createArticle(payload);
      navigate("/admin/articles");
    } catch (err) {
      setError(userMessage(err));
    }
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black">{articleId ? "문서 수정" : "문서 작성"}</h1>
        <div className="flex gap-2">
          <PdfImportDialog
            onImported={(nextTitle, markdown) => {
              setTitle(nextTitle);
              setBodyMarkdown(markdown);
            }}
          />
          <Button type="submit">
            <Save size={17} /> 저장
          </Button>
        </div>
      </div>
      {error ? <ErrorState message={error} /> : null}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[240px_1fr]">
          <select
            className="h-10 rounded-md border border-[var(--border)] bg-white px-3 text-sm"
            value={folderId}
            onChange={(event) => setFolderId(Number(event.target.value))}
          >
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.title}
              </option>
            ))}
          </select>
          <Input placeholder="문서 제목" value={title} onChange={(event) => setTitle(event.target.value)} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>본문</CardTitle>
        </CardHeader>
        <CardContent>
          <MarkdownEditor value={bodyMarkdown} onChange={setBodyMarkdown} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>첨부파일</CardTitle>
        </CardHeader>
        <CardContent>
          <AttachmentManager />
        </CardContent>
      </Card>
    </form>
  );
}
