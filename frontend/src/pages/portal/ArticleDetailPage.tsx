import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { ArticleViewer } from "../../components/portal/ArticleViewer";
import { fetchPortalArticle } from "../../lib/api/portal";
import { userMessage } from "../../lib/error-messages";
import type { ArticleDetail } from "../../types/api";
import { Button } from "../../ui-components/button";

export function ArticleDetailPage() {
  const { articleId } = useParams();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!articleId) return;
    fetchPortalArticle(Number(articleId))
      .then(setArticle)
      .catch((err) => setError(userMessage(err)));
  }, [articleId]);

  return (
    <div className="grid gap-4">
      <Button asChild className="w-fit" variant="secondary">
        <Link to="/portal">
          <ArrowLeft size={18} /> 목록
        </Link>
      </Button>
      {error ? <ErrorState message={error} /> : null}
      {!error && !article ? <LoadingState /> : null}
      {article ? <ArticleViewer article={article} /> : null}
    </div>
  );
}
