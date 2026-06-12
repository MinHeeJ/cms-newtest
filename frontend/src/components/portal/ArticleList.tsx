import { FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { portalApi, type ArticleSummary } from "../../lib/api/portal";
import { errorMessage } from "../../lib/error-messages";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui-components/card";
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
      setError(null);
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
        <CardDescription>선택한 폴더의 게시 문서 목록입니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {!folderId ? <EmptyState message="폴더를 선택해 주세요." /> : null}
          {loading ? <LoadingState /> : null}
          {error ? <ErrorState message={error} /> : null}
          {!loading && folderId && !error && articles.length === 0 ? <EmptyState message="게시된 문서가 없습니다." /> : null}
          {!loading && articles.length > 0 ? (
            <div className="overflow-hidden rounded-md border">
              <div className="divide-y">
                {articles.map((article) => (
                  <Link className="flex items-center gap-3 bg-background p-3 transition-colors hover:bg-muted/50" key={article.id} to={`/portal/articles/${article.id}`}>
                    <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <FileText className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{article.title}</span>
                      <span className="text-xs text-muted-foreground">{article.status}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
