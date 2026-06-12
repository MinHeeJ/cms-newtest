import { Paperclip, Trash2, Upload } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { EmptyState } from "../common/EmptyState";
import { ErrorState } from "../common/ErrorState";
import { LoadingState } from "../common/LoadingState";
import { adminApi, type Attachment } from "../../lib/api/admin";
import { errorMessage } from "../../lib/error-messages";
import { Button } from "../../ui-components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui-components/card";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminApi
      .attachments(refType, refId)
      .then((items) => {
        setAttachments(items);
        setError(null);
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
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
        <CardDescription>문서에 연결된 다운로드 파일을 관리합니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
            <Upload className="size-4" />
            업로드
            <input className="sr-only" multiple type="file" onChange={onFileChange} />
          </label>
          {error ? <ErrorState message={error} /> : null}
          {loading ? <LoadingState /> : null}
          {!loading && !error && attachments.length === 0 ? <EmptyState message="첨부파일이 없습니다." /> : null}
          {!loading && attachments.length > 0 ? (
            <div className="overflow-hidden rounded-md border">
              <div className="divide-y">
                {attachments.map((attachment) => (
                  <div className="flex items-center justify-between gap-2 bg-background p-3 transition-colors hover:bg-muted/50" key={attachment.id}>
                    <a className="flex min-w-0 items-center gap-2 text-sm font-medium" href={`/api/v1/attachments/${attachment.id}/download`}>
                      <Paperclip className="size-4 text-muted-foreground" />
                      <span className="truncate">{attachment.originalName}</span>
                    </a>
                    <Button aria-label="삭제" size="icon" type="button" variant="ghost" onClick={() => void remove(attachment.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
