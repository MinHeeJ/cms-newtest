import { Paperclip, Trash2, Upload } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { adminApi, type Attachment } from "../../lib/api/admin";
import { errorMessage } from "../../lib/error-messages";
import { Button } from "../../ui-components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui-components/card";
import { ErrorState } from "../common/ErrorState";

const allowed = new Set(["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "xls", "xlsx", "md", "zip"]);
const maxFileSize = 10 * 1024 * 1024;

export function validateAttachmentFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !allowed.has(extension)) {
    return "허용되지 않는 파일 확장자입니다.";
  }
  if (file.size > maxFileSize) {
    return "파일당 업로드 크기는 10MB를 초과할 수 없습니다.";
  }
  return null;
}

export function AttachmentManager({ refType, refId }: { refType: string; refId: number }) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    adminApi.attachments(refType, refId).then(setAttachments).catch((err) => setError(errorMessage(err)));
  };

  useEffect(load, [refType, refId]);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) {
      return;
    }
    for (const file of Array.from(files)) {
      const validation = validateAttachmentFile(file);
      if (validation) {
        setError(validation);
        return;
      }
    }
    try {
      await adminApi.uploadAttachments(refType, refId, files);
      setError(null);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function remove(id: number) {
    await adminApi.deleteAttachment(id);
    load();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>첨부파일</CardTitle>
      </CardHeader>
      <CardContent>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--panel-muted)]">
          <Upload size={16} />
          업로드
          <input className="sr-only" multiple type="file" onChange={onFileChange} />
        </label>
        {error ? <div className="mt-3"><ErrorState message={error} /></div> : null}
        <div className="mt-3 grid gap-2">
          {attachments.map((attachment) => (
            <div className="flex items-center justify-between gap-2 rounded-md border border-[var(--border)] p-2" key={attachment.id}>
              <a className="flex min-w-0 items-center gap-2 text-sm" href={`/api/v1/attachments/${attachment.id}/download`}>
                <Paperclip size={16} />
                <span className="truncate">{attachment.originalName}</span>
              </a>
              <Button aria-label="삭제" size="icon" type="button" variant="ghost" onClick={() => void remove(attachment.id)}>
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
