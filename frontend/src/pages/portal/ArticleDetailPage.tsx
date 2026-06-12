import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArticleViewer } from "../../components/portal/ArticleViewer";
import { portalApi, type ArticleDetail } from "../../lib/api/portal";
import { errorMessage } from "../../lib/error-messages";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";

export function ArticleDetailPage() {
  const { articleId } = useParams();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!articleId) {
      return;
    }
    portalApi
      .article(Number(articleId))
      .then(setArticle)
      .catch((err) => setError(errorMessage(err)));
  }, [articleId]);

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!article) {
    return <LoadingState />;
  }

  return <ArticleViewer article={article} />;
}
