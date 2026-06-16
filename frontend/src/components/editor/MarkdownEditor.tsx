import { ImagePlus, List, Table2 } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const insert = (snippet: string) => onChange(`${value}${value.endsWith("\n") ? "" : "\n"}${snippet}`);

  return (
    <div className="flex h-full flex-col rounded-lg border border-ld dark:border-[#333f55]">
      <div className="flex items-center justify-between border-b border-ld px-4 py-3 dark:border-[#333f55]">
        <h3 className="text-sm font-semibold text-foreground dark:text-white">Markdown 편집기</h3>
        <div className="flex gap-2">
          <button className="h-9 w-9 rounded-full hover:bg-lightprimary hover:text-primary" type="button" title="목록 삽입" onClick={() => insert("- 항목")}>
            <List className="mx-auto h-4 w-4" aria-hidden="true" />
          </button>
          <button className="h-9 w-9 rounded-full hover:bg-lightprimary hover:text-primary" type="button" title="표 삽입" onClick={() => insert("| 항목 | 값 |\n| --- | --- |\n|  |  |")}>
            <Table2 className="mx-auto h-4 w-4" aria-hidden="true" />
          </button>
          <button className="h-9 w-9 rounded-full hover:bg-lightprimary hover:text-primary" type="button" title="이미지 삽입" onClick={() => insert("![대체 텍스트](media-url)")}>
            <ImagePlus className="mx-auto h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <textarea
        className="min-h-[460px] flex-1 resize-y rounded-b-lg bg-transparent p-4 font-mono text-sm leading-7 text-foreground outline-none focus-visible:border-primary dark:text-white"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="마크다운 본문"
      />
    </div>
  );
}
