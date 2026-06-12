const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
const MEMBER_USER_ID = import.meta.env.VITE_MEMBER_USER_ID ?? '00000000-0000-0000-0000-000000000101';

export type Visibility = 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
export type JoinPolicy = 'OPEN' | 'APPROVAL_REQUIRED' | 'INVITE_ONLY';
export type CreationRequestStatus =
  | 'DRAFT'
  | 'VALIDATION_FAILED'
  | 'READY_TO_SUBMIT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CHANGE_REQUESTED'
  | 'LAUNCHED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type BoardType = 'GENERAL' | 'NOTICE' | 'QNA' | 'MEDIA';
export type Role = 'OWNER' | 'MODERATOR' | 'MEMBER';
export type ReviewDecision = 'APPROVED' | 'REJECTED' | 'CHANGE_REQUESTED';

export interface CategoryResponse {
  id: string;
  name: string;
  active: boolean;
  creatable: boolean;
  requiresReview: boolean;
}

export interface FieldErrorResponse {
  field: string;
  code: string;
  message: string;
}

export interface RiskSignalResponse {
  code: string;
  severity: 'INFO' | 'WARNING' | 'BLOCKING';
  message: string;
}

export interface BoardInput {
  name: string;
  description?: string;
  type: BoardType;
  postPermission: Role;
  commentPermission: Role;
  displayOrder?: number;
}

export interface BoardResponse extends BoardInput {
  id: string;
  isDefault: boolean;
}

export interface RuleInput {
  title: string;
  body: string;
  displayOrder?: number;
  required?: boolean;
}

export interface RuleResponse extends RuleInput {
  id: string;
  required: boolean;
}

export interface ModeratorInvitationInput {
  userIdentifier: string;
  message?: string;
}

export interface ModeratorInvitationResponse extends ModeratorInvitationInput {
  id: string;
  status: 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
}

export interface CommunityCreationRequest {
  id: string;
  creatorUserId: string;
  displayName?: string;
  slug?: string;
  categoryId?: string;
  description?: string;
  visibility?: Visibility;
  joinPolicy?: JoinPolicy;
  status: CreationRequestStatus;
  riskLevel: RiskLevel;
  representativeImageId?: string;
  launchedCommunityId?: string;
  boards: BoardResponse[];
  rules: RuleResponse[];
  moderatorInvitations: ModeratorInvitationResponse[];
  validationErrors: FieldErrorResponse[];
  riskSignals: RiskSignalResponse[];
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SlugCheckResponse {
  slug: string;
  normalizedSlug: string;
  available: boolean;
  reasonCode?: string;
  message?: string;
}

export interface SubmitCommunityCreationResponse {
  result: 'LAUNCHED' | 'PENDING_REVIEW' | 'VALIDATION_FAILED';
  communityId?: string;
  request: CommunityCreationRequest;
}

export interface MediaAssetResponse {
  id: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
  width: number;
  height: number;
  status: 'TEMPORARY' | 'ATTACHED' | 'REJECTED' | 'DELETED';
}

export interface CommunityResponse {
  id: string;
  displayName: string;
  slug: string;
  categoryId: string;
  description: string;
  visibility: Visibility;
  joinPolicy: JoinPolicy;
  status: 'ACTIVE' | 'SUSPENDED';
  ownerUserId: string;
  representativeImageId?: string;
  launchedAt: string;
}

export interface ApiError {
  code: string;
  message: string;
  fieldErrors?: FieldErrorResponse[];
}

async function requestJson<T>(path: string, options: RequestInit = {}, role = 'MEMBER'): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': MEMBER_USER_ID,
      'X-User-Role': role,
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({
      code: 'REQUEST_FAILED',
      message: '요청 처리에 실패했습니다.'
    }))) as ApiError;
    throw error;
  }

  return response.json() as Promise<T>;
}

export function listCategories() {
  return requestJson<CategoryResponse[]>('/api/v1/community-creation/categories');
}

export function createDraft() {
  return requestJson<CommunityCreationRequest>('/api/v1/community-creation/requests', {
    method: 'POST',
    body: JSON.stringify({ source: 'HEADER_BUTTON' })
  });
}

export function checkSlug(slug: string) {
  return requestJson<SlugCheckResponse>('/api/v1/community-creation/slug-check', {
    method: 'POST',
    body: JSON.stringify({ slug })
  });
}

export function getCreationRequest(requestId: string) {
  return requestJson<CommunityCreationRequest>(`/api/v1/community-creation/requests/${requestId}`);
}

export function updateCreationRequest(requestId: string, payload: Partial<CommunityCreationRequest>) {
  return requestJson<CommunityCreationRequest>(`/api/v1/community-creation/requests/${requestId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export function replaceBoards(requestId: string, boards: BoardInput[]) {
  return requestJson<CommunityCreationRequest>(`/api/v1/community-creation/requests/${requestId}/boards`, {
    method: 'PUT',
    body: JSON.stringify({ boards })
  });
}

export function replaceRules(requestId: string, rules: RuleInput[]) {
  return requestJson<CommunityCreationRequest>(`/api/v1/community-creation/requests/${requestId}/rules`, {
    method: 'PUT',
    body: JSON.stringify({ rules })
  });
}

export function replaceModeratorInvitations(requestId: string, invitations: ModeratorInvitationInput[]) {
  return requestJson<CommunityCreationRequest>(`/api/v1/community-creation/requests/${requestId}/moderator-invitations`, {
    method: 'PUT',
    body: JSON.stringify({ invitations })
  });
}

export function attachMedia(
  requestId: string,
  payload: Pick<MediaAssetResponse, 'fileName' | 'mimeType' | 'byteSize' | 'width' | 'height'>
) {
  return requestJson<MediaAssetResponse>(`/api/v1/community-creation/requests/${requestId}/media`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function submitCreationRequest(requestId: string, idempotencyKey: string) {
  return requestJson<SubmitCommunityCreationResponse>(`/api/v1/community-creation/requests/${requestId}/submit`, {
    method: 'POST',
    headers: {
      'Idempotency-Key': idempotencyKey
    }
  });
}

export function getCommunity(communityId: string) {
  return requestJson<CommunityResponse>(`/api/v1/communities/${communityId}`);
}

export function newIdempotencyKey() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}-community`;
}
