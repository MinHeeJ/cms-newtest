import { Edit, FilePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAdminArticles, changeArticleStatus } from "../../lib/api/admin";
import { userMessage } from "../../lib/error-messages";
import type { ArticleSummary } from "../../types/api";
import { Badge } from "../../ui-components/badge";
import { Button } from "../../ui-components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui-components/card";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";

export function ArticleManagePage() {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setArticles(await fetchAdminArticles());
  }

  useEffect(() => {
    load().catch((err) => setError(userMessage(err)));
  }, []);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black">문서 관리</h1>
        <Button asChild>
          <Link to="/admin/articles/new">
            <FilePlus size={17} /> 새 문서
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>문서 목록</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {error ? <ErrorState message={error} /> : null}
          {articles.length === 0 ? <EmptyState message="문서가 없습니다." /> : null}
          {articles.map((article) => (
            <div key={article.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-white p-3">
              <div className="min-w-0">
                <div className="truncate font-semibold">{article.title}</div>
                <Badge className="mt-1">{article.status}</Badge>
              </div>
              <div className="flex gap-2">
                {article.status !== "PUBLISHED" ? (
                  <Button size="sm" variant="secondary" onClick={async () => { await changeArticleStatus(article.id, "PUBLISHED"); await load(); }}>
                    발행
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" onClick={async () => { await changeArticleStatus(article.id, "UNPUBLISHED"); await load(); }}>
                    중단
                  </Button>
                )}
                <Button asChild aria-label="수정" size="icon" variant="ghost">
                  <Link to={`/admin/articles/${article.id}/edit`}>
                    <Edit size={17} />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
