import { FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPortalArticles } from "../../lib/api/portal";
import { userMessage } from "../../lib/error-messages";
import type { ArticleSummary } from "../../types/api";
import { EmptyState } from "../common/EmptyState";
import { ErrorState } from "../common/ErrorState";
import { LoadingState } from "../common/LoadingState";

export function ArticleList({ folderId }: { folderId: number | null }) {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!folderId) return;
    setLoading(true);
    fetchPortalArticles(folderId)
      .then(setArticles)
      .catch((err) => setError(userMessage(err)))
      .finally(() => setLoading(false));
  }, [folderId]);

  if (!folderId) return <EmptyState message="폴더를 선택해 주세요." />;
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (articles.length === 0) return <EmptyState message="게시 문서가 없습니다." />;

  return (
    <div className="grid gap-2">
      {articles.map((article) => (
        <Link
          key={article.id}
          className="flex items-center gap-3 rounded-md border border-[var(--border)] bg-white p-4 hover:border-[var(--primary)]"
          to={`/portal/articles/${article.id}`}
        >
          <FileText className="shrink-0 text-[var(--primary)]" size={20} />
          <div className="min-w-0">
            <div className="truncate font-bold">{article.title}</div>
            <div className="text-xs text-slate-500">{article.publishedAt ? article.publishedAt.slice(0, 10) : "게시일 없음"}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
