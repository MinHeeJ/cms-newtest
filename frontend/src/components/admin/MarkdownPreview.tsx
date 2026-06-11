import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

export function MarkdownPreview({ markdown }: { markdown: string }) {
  return (
    <article className="cms-prose min-h-40 rounded-md border border-[var(--border)] bg-white p-4">
      <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeHighlight]} remarkPlugins={[remarkGfm]}>
        {markdown || "미리보기 내용이 없습니다."}
      </ReactMarkdown>
    </article>
  );
}
