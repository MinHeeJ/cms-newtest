import type { ArticleDetail } from "../../lib/api/portal";
import { ArticleViewer } from "../portal/ArticleViewer";

export function MarkdownPreview({ title, body }: { title: string; body: string }) {
  const article: ArticleDetail = {
    id: 0,
    folderId: 0,
    title: title || "제목 없음",
    body,
    status: "PREVIEW",
    sortOrder: 0
  };

  return <ArticleViewer article={article} />;
}
