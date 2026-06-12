import { Edit, FilePlus, Pause, Play, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../lib/api/admin";
import type { ArticleSummary } from "../../lib/api/portal";
import { errorMessage } from "../../lib/error-messages";
import { Badge } from "../../ui-components/badge";
import { Button } from "../../ui-components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui-components/card";
import { ErrorState } from "../../components/common/ErrorState";

export function ArticleManagePage() {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = () => adminApi.articles().then(setArticles).catch((err) => setError(errorMessage(err)));

  useEffect(load, []);

  async function action(fn: () => Promise<unknown>) {
    try {
      await fn();
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>문서 관리</CardTitle>
          <Button asChild>
            <Link to="/admin/articles/new">
              <FilePlus size={18} />
              신규
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? <ErrorState message={error} /> : null}
        <div className="mt-3 grid gap-2">
          {articles.map((article) => (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--border)] p-3" key={article.id}>
              <div className="min-w-0">
                <div className="truncate font-medium">{article.title}</div>
                <Badge>{article.status}</Badge>
              </div>
              <div className="flex gap-1">
                <Button aria-label="수정" asChild size="icon" variant="ghost">
                  <Link to={`/admin/articles/${article.id}/edit`}>
                    <Edit size={16} />
                  </Link>
                </Button>
                <Button aria-label="발행" size="icon" type="button" variant="ghost" onClick={() => void action(() => adminApi.publish(article.id))}>
                  <Play size={16} />
                </Button>
                <Button aria-label="게시중단" size="icon" type="button" variant="ghost" onClick={() => void action(() => adminApi.unpublish(article.id))}>
                  <Pause size={16} />
                </Button>
                <Button aria-label="삭제" size="icon" type="button" variant="ghost" onClick={() => void action(() => adminApi.deleteArticle(article.id))}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
