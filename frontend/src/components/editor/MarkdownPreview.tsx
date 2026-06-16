interface MarkdownPreviewProps {
  html: string;
  warnings?: string[];
}

export function MarkdownPreview({ html, warnings = [] }: MarkdownPreviewProps) {
  return (
    <div className="rounded-lg border border-ld bg-white p-6 dark:border-[#333f55] dark:bg-dark">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground dark:text-white">미리보기</h3>
        <span className="rounded-full bg-lightprimary px-2.5 py-1 text-xs font-medium text-primary">렌더링됨</span>
      </div>
      {warnings.length > 0 ? (
        <div className="mb-4 rounded-md bg-lightwarning p-3 text-sm text-slate-700 dark:text-white/80">
          {warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}
      <div className="cms-preview" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
