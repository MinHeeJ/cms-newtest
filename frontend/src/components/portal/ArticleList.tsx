import { FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { portalApi, type ArticleSummary } from "../../lib/api/portal";
import { errorMessage } from "../../lib/error-messages";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui-components/card";
import { EmptyState } from "../common/EmptyState";
import { ErrorState } from "../common/ErrorState";
import { LoadingState } from "../common/LoadingState";

export function ArticleList({ folderId }: { folderId: number | null }) {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!folderId) {
      setArticles([]);
      return;
    }
    setLoading(true);
    setError(null);
    portalApi
      .articles(folderId)
      .then(setArticles)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [folderId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>문서</CardTitle>
      </CardHeader>
      <CardContent>
        {!folderId ? <EmptyState message="폴더를 선택해 주세요." /> : null}
        {loading ? <LoadingState /> : null}
        {error ? <ErrorState message={error} /> : null}
        {!loading && folderId && articles.length === 0 ? <EmptyState message="게시된 문서가 없습니다." /> : null}
        <div className="grid gap-2">
          {articles.map((article) => (
            <Link className="flex items-center gap-2 rounded-md border border-[var(--border)] p-3 hover:bg-[var(--panel-muted)]" key={article.id} to={`/portal/articles/${article.id}`}>
              <FileText size={18} />
              <span className="font-medium">{article.title}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
