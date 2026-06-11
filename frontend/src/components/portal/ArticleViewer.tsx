import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import type { ArticleDetail } from "../../types/api";
import { Badge } from "../../ui-components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui-components/card";

export function ArticleViewer({ article }: { article: ArticleDetail }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-xl">{article.title}</CardTitle>
          <Badge>{article.status}</Badge>
        </div>
        <div className="mt-2 text-sm text-slate-500">
          {article.authorName ?? "작성자 없음"} · {article.publishedAt ? article.publishedAt.slice(0, 10) : "미게시"}
        </div>
      </CardHeader>
      <CardContent>
        <article className="cms-prose max-w-none">
          <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeHighlight]} remarkPlugins={[remarkGfm]}>
            {article.bodyMarkdown}
          </ReactMarkdown>
        </article>
      </CardContent>
    </Card>
  );
}
