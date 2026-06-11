import { Download, Paperclip, Trash2, Upload } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { deleteAttachment, fetchAttachments, uploadAttachment } from "../../lib/api/admin";
import { userMessage } from "../../lib/error-messages";
import type { Attachment } from "../../types/api";
import { Button } from "../../ui-components/button";
import { ErrorState } from "../common/ErrorState";
import { EmptyState } from "../common/EmptyState";

const maxFileBytes = 10 * 1024 * 1024;
const allowed = new Set(["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "xls", "xlsx", "md", "zip"]);

export function AttachmentManager() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setAttachments(await fetchAttachments());
    } catch (err) {
      setError(userMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!allowed.has(extension)) {
      setError("허용되지 않는 파일 형식입니다.");
      return;
    }
    if (file.size > maxFileBytes) {
      setError("파일은 10MB 이하만 업로드할 수 있습니다.");
      return;
    }
    try {
      await uploadAttachment(file);
      setError(null);
      await load();
    } catch (err) {
      setError(userMessage(err));
    }
  }

  return (
    <div className="grid gap-3">
      <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
        <Upload size={17} /> 업로드
        <input className="sr-only" type="file" onChange={onFile} />
      </label>
      {error ? <ErrorState message={error} /> : null}
      {attachments.length === 0 ? <EmptyState message="첨부파일이 없습니다." /> : null}
      <div className="grid gap-2">
        {attachments.map((attachment) => (
          <div key={attachment.id} className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-white p-3">
            <div className="flex min-w-0 items-center gap-2">
              <Paperclip className="shrink-0 text-[var(--primary)]" size={17} />
              <span className="truncate text-sm font-semibold">{attachment.originalName}</span>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button asChild aria-label="다운로드" size="icon" variant="ghost">
                <a href={`/api/v1/attachments/${attachment.id}/download`}>
                  <Download size={17} />
                </a>
              </Button>
              <Button
                aria-label="삭제"
                size="icon"
                variant="ghost"
                onClick={async () => {
                  await deleteAttachment(attachment.id);
                  await load();
                }}
              >
                <Trash2 size={17} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
