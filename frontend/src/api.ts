export type ApiError = {
  code: string;
  message: string;
  traceId: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
};

export type Folder = {
  folderId: string;
  name: string;
  active: boolean;
  documents?: DocumentSummary[];
};

export type DocumentSummary = {
  documentId: string;
  folderId?: string;
  title: string;
  status: string;
  summary?: string;
  folderName?: string;
};

export type DocumentDetail = DocumentSummary & {
  markdownBody: string;
  renderedHtml: string;
  attachments: Attachment[];
};

export type Attachment = {
  attachmentId: string;
  documentId: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  status: string;
};

export type PageData<T> = {
  items: T[];
  page: number;
  size: number;
  total?: number;
};

export type ProjectRecord = {
  recordId: string;
  module: string;
  title: string;
  owner: string;
  status: string;
  severity?: string;
  version?: string;
  approvalState?: string;
  detail?: string;
};

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !payload.success) {
    const error = payload.error ?? {
      code: "UNKNOWN",
      message: "요청 처리에 실패했습니다.",
      traceId: "-",
    };
    throw error;
  }
  return payload.data as T;
}
