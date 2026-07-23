export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string; details?: string[] };
  traceId: string;
}

export interface PageResponse<T> {
  items: T[];
  page: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Actor-Id": "operator-ui",
      "X-Actor-Scope": "ORG-001",
      "X-Actor-Role":
        "ADMIN,STAFF,APPROVER,COLLEGE_MANAGER,CANCEL_MANAGER,OPERATOR,REVIEWER",
      ...(init?.headers ?? {}),
    },
  });
  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !payload.success) {
    throw new Error(
      payload.error?.message ?? "요청 처리 중 오류가 발생했습니다.",
    );
  }
  return payload.data;
}

export const operationsApi = {
  verifications: () =>
    request<PageResponse<Record<string, unknown>>>(
      "/api/verifications?status=UNVERIFIED",
    ),
  decideVerification: (
    id: string,
    decisionType: string,
    opinion: string,
    evidence: string,
  ) =>
    request<Record<string, unknown>>(`/api/verifications/${id}/decision`, {
      method: "POST",
      body: JSON.stringify({ decisionType, opinion, evidence }),
    }),
  payments: () =>
    request<PageResponse<Record<string, unknown>>>(
      "/api/payment-approvals?approvalStatus=PENDING",
    ),
  decidePayment: (id: string, decisionType: string, reason: string) =>
    request<Record<string, unknown>>(`/api/payment-approvals/${id}/decision`, {
      method: "POST",
      body: JSON.stringify({ decisionType, reason }),
    }),
  reasons: (businessType = "") =>
    request<PageResponse<Record<string, unknown>>>(
      `/api/rejection-reasons${businessType ? `?businessType=${encodeURIComponent(businessType)}` : ""}`,
    ),
  createReason: (body: Record<string, unknown>) =>
    request<Record<string, unknown>>("/api/rejection-reasons", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  appeals: () =>
    request<PageResponse<Record<string, unknown>>>("/api/appeal-opinions"),
  reviewAppeal: (
    id: string,
    reviewerOpinion: string,
    processingResult: string,
  ) =>
    request<Record<string, unknown>>(`/api/appeal-opinions/${id}/review`, {
      method: "POST",
      body: JSON.stringify({ reviewerOpinion, processingResult }),
    }),
  generate: (body: Record<string, unknown>) =>
    request<Record<string, unknown>>("/api/evaluation-batches/generate", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deletePreview: () =>
    request<PageResponse<Record<string, unknown>>>(
      "/api/evaluation-batches/delete-preview?evaluationYear=2026&evaluationArea=TEACHING&generationBatchId=40000000-0000-4000-8000-000000000001",
    ),
  deleteMaterials: (deleteReason: string) =>
    request<Record<string, unknown>>("/api/evaluation-batches/delete", {
      method: "POST",
      body: JSON.stringify({
        evaluationYear: 2026,
        evaluationArea: "TEACHING",
        generationBatchId: "40000000-0000-4000-8000-000000000001",
        deleteReason,
      }),
    }),
  recalculate: () =>
    request<Record<string, unknown>>("/api/evaluation-batches/recalculate", {
      method: "POST",
      body: JSON.stringify({
        evaluationYear: 2026,
        targetUserIds: ["PROF-001"],
        evaluationArea: "TEACHING",
        formulaVersion: "FORMULA-2026-A",
      }),
    }),
  finalEvaluations: () =>
    request<PageResponse<Record<string, unknown>>>(
      "/api/final-evaluations?evaluationYear=2026",
    ),
  confirmFinal: (id: string) =>
    request<Record<string, unknown>>(`/api/final-evaluations/${id}/confirm`, {
      method: "POST",
    }),
  cancelFinal: (id: string, cancelReason: string) =>
    request<Record<string, unknown>>(`/api/final-evaluations/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ cancelReason }),
    }),
  batchResults: () =>
    request<PageResponse<Record<string, unknown>>>(
      "/api/batch-results?evaluationYear=2026",
    ),
};
