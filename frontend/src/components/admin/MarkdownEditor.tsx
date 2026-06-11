import { Eye, Table2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../../ui-components/button";
import { Textarea } from "../../ui-components/textarea";
import { MarkdownPreview } from "./MarkdownPreview";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function MarkdownEditor({ value, onChange }: Props) {
  const [preview, setPreview] = useState(false);

  function insertTable() {
    onChange(`${value}\n\n| 항목 | 내용 |\n| --- | --- |\n| 예시 | 값 |\n`);
  }

  function insertCode() {
    onChange(`${value}\n\n\`\`\`text\n코드 블록\n\`\`\`\n`);
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" type="button" variant="secondary" onClick={() => setPreview((current) => !current)}>
          <Eye size={16} /> 미리보기
        </Button>
        <Button size="sm" type="button" variant="secondary" onClick={insertTable}>
          <Table2 size={16} /> 표
        </Button>
        <Button size="sm" type="button" variant="secondary" onClick={insertCode}>
          코드
        </Button>
      </div>
      {preview ? (
        <MarkdownPreview markdown={value} />
      ) : (
        <Textarea value={value} onChange={(event) => onChange(event.target.value)} rows={14} />
      )}
    </div>
  );
}
