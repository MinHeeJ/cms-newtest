import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import type { ArticleDetail } from "../../lib/api/portal";
import { Badge } from "../../ui-components/badge";

export function ArticleViewer({ article }: { article: ArticleDetail }) {
  return (
    <article className="cms-panel py-6">
      <header className="px-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge>{article.status}</Badge>
          {article.publishedAt ? <span className="text-xs text-muted-foreground">{new Date(article.publishedAt).toLocaleDateString()}</span> : null}
        </div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{article.title}</h1>
      </header>
      <div className="border-t px-6 pt-6">
        <div className="markdown-body">
          <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeHighlight]} remarkPlugins={[remarkGfm]}>
            {article.body}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
