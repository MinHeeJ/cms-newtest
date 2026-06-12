import type { ApiError, CommunityCreationRequest, ReviewDecision } from '../../community-create/api/communityCreationClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
const OPERATOR_USER_ID = import.meta.env.VITE_OPERATOR_USER_ID ?? '00000000-0000-0000-0000-000000000201';

export interface AuditEventResponse {
  id: string;
  actorUserId: string;
  eventType: string;
  summary: string;
  createdAt: string;
}

export interface ReviewListItem {
  requestId: string;
  displayName?: string;
  slug?: string;
  categoryId?: string;
  creatorUserId: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  status: CommunityCreationRequest['status'];
  submittedAt?: string;
}

export interface ReviewQueuePage {
  items: ReviewListItem[];
  page: number;
  size: number;
  totalElements: number;
}

export interface ReviewDetail {
  request: CommunityCreationRequest;
  auditEvents: AuditEventResponse[];
}

export interface ReviewDecisionPayload {
  decision: ReviewDecision;
  reasonCode: string;
  reasonText: string;
  expectedRequestUpdatedAt: string;
}

export interface ReviewDecisionResponse {
  communityId?: string;
  request: CommunityCreationRequest;
}

async function operatorJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': OPERATOR_USER_ID,
      'X-User-Role': 'OPERATOR',
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    throw ((await response.json().catch(() => ({
      code: 'REQUEST_FAILED',
      message: '요청 처리에 실패했습니다.'
    }))) as ApiError);
  }

  return response.json() as Promise<T>;
}

export function listReviews() {
  return operatorJson<ReviewQueuePage>('/api/v1/admin/community-creation/reviews?status=PENDING_REVIEW&size=50');
}

export function getReviewDetail(requestId: string) {
  return operatorJson<ReviewDetail>(`/api/v1/admin/community-creation/reviews/${requestId}`);
}

export function decideReview(requestId: string, payload: ReviewDecisionPayload) {
  return operatorJson<ReviewDecisionResponse>(`/api/v1/admin/community-creation/reviews/${requestId}/decision`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
