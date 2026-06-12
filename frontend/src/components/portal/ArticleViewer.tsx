import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import type { ArticleDetail } from "../../lib/api/portal";
import { Badge } from "../../ui-components/badge";

export function ArticleViewer({ article }: { article: ArticleDetail }) {
  return (
    <article className="cms-panel">
      <header className="border-b border-[var(--border)] p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge>{article.status}</Badge>
          {article.publishedAt ? <span className="text-xs text-[var(--muted)]">{new Date(article.publishedAt).toLocaleDateString()}</span> : null}
        </div>
        <h1 className="text-2xl font-semibold">{article.title}</h1>
      </header>
      <div className="markdown-body p-4">
        <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeHighlight]} remarkPlugins={[remarkGfm]}>
          {article.body}
        </ReactMarkdown>
      </div>
    </article>
  );
}
