import { FileInput } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { adminApi } from "../../lib/api/admin";
import { errorMessage } from "../../lib/error-messages";
import { Button } from "../../ui-components/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../../ui-components/dialog";
import { ErrorState } from "../common/ErrorState";

export function PdfImportDialog({ onImport }: { onImport: (title: string, markdown: string) => void }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const result = await adminApi.importPdf(file);
      onImport(result.title, result.markdown);
      setOpen(false);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="secondary">
          <FileInput size={16} />
          PDF
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="mb-4 text-lg font-semibold">PDF 임포트</DialogTitle>
        <input accept="application/pdf,.pdf" type="file" onChange={onFileChange} />
        {error ? <div className="mt-3"><ErrorState message={error} /></div> : null}
      </DialogContent>
    </Dialog>
  );
}
