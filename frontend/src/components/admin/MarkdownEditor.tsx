import { Code2, Eye, Table2 } from "lucide-react";
import { Button } from "../../ui-components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui-components/tabs";
import { Textarea } from "../../ui-components/textarea";
import { MarkdownPreview } from "./MarkdownPreview";

type Props = {
  title: string;
  body: string;
  onChange: (body: string) => void;
};

export function MarkdownEditor({ title, body, onChange }: Props) {
  const insert = (snippet: string) => {
    onChange(`${body}${body.endsWith("\n") || body.length === 0 ? "" : "\n"}${snippet}`);
  };

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" type="button" variant="secondary" onClick={() => insert("\n| 항목 | 내용 |\n| --- | --- |\n|  |  |\n")}>
          <Table2 size={16} />
          표
        </Button>
        <Button size="sm" type="button" variant="secondary" onClick={() => insert("\n```text\n\n```\n")}>
          <Code2 size={16} />
          코드
        </Button>
      </div>
      <Tabs defaultValue="edit">
        <TabsList>
          <TabsTrigger value="edit">편집</TabsTrigger>
          <TabsTrigger value="preview">
            <Eye size={16} />
            미리보기
          </TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <Textarea aria-label="본문" className="min-h-[420px] font-mono" value={body} onChange={(event) => onChange(event.target.value)} />
        </TabsContent>
        <TabsContent value="preview">
          <MarkdownPreview body={body} title={title} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
