import { FileUp } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { Button } from "../../ui-components/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../../ui-components/dialog";
import { ErrorState } from "../common/ErrorState";

type Props = {
  onImported: (title: string, markdown: string) => void;
};

export function PdfImportDialog({ onImported }: Props) {
  const [error, setError] = useState<string | null>(null);

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("PDF 파일만 임포트할 수 있습니다.");
      return;
    }
    const title = file.name.replace(/\.pdf$/i, "");
    onImported(title, `# ${title}\n\nPDF 임포트 후 본문을 검수해 주세요.`);
    setError(null);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="secondary">
          <FileUp size={17} /> PDF 임포트
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>PDF 임포트</DialogTitle>
        <DialogDescription>PDF 파일을 마크다운 초안으로 가져옵니다.</DialogDescription>
        <div className="mt-4 grid gap-3">
          <input accept="application/pdf,.pdf" type="file" onChange={onFile} />
          {error ? <ErrorState message={error} /> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
