import { Edit, FilePlus, Pause, Play, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { adminApi } from "../../lib/api/admin";
import type { ArticleSummary } from "../../lib/api/portal";
import { errorMessage } from "../../lib/error-messages";
import { Badge } from "../../ui-components/badge";
import { Button } from "../../ui-components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui-components/card";

export function ArticleManagePage() {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    return adminApi
      .articles()
      .then((items) => {
        setArticles(items);
        setError(null);
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void load();
  }, []);

  async function action(fn: () => Promise<unknown>) {
    try {
      await fn();
      void load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">문서 관리</h1>
          <p className="text-muted-foreground">문서 작성, 발행 상태 변경, 삭제 작업을 수행합니다.</p>
        </div>
        <Button asChild>
          <Link to="/admin/articles/new">
            <FilePlus className="size-4" />
            신규
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>문서 목록</CardTitle>
          <CardDescription>최근 등록된 문서를 카드형 목록으로 확인합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {error ? <ErrorState message={error} /> : null}
            {loading ? <LoadingState /> : null}
            {!loading && !error && articles.length === 0 ? <EmptyState message="등록된 문서가 없습니다." /> : null}
            {!loading && articles.length > 0 ? (
              <div className="overflow-hidden rounded-md border">
                <div className="divide-y">
                  {articles.map((article) => (
                    <div className="group/row flex flex-wrap items-center justify-between gap-3 bg-background p-3 transition-colors hover:bg-muted/50" key={article.id}>
                      <div className="min-w-0 space-y-1">
                        <div className="truncate font-medium">{article.title}</div>
                        <Badge>{article.status}</Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button aria-label="수정" asChild size="icon" variant="ghost">
                          <Link to={`/admin/articles/${article.id}/edit`}>
                            <Edit className="size-4" />
                          </Link>
                        </Button>
                        <Button aria-label="발행" size="icon" type="button" variant="ghost" onClick={() => void action(() => adminApi.publish(article.id))}>
                          <Play className="size-4" />
                        </Button>
                        <Button aria-label="게시중단" size="icon" type="button" variant="ghost" onClick={() => void action(() => adminApi.unpublish(article.id))}>
                          <Pause className="size-4" />
                        </Button>
                        <Button aria-label="삭제" size="icon" type="button" variant="ghost" onClick={() => void action(() => adminApi.deleteArticle(article.id))}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
