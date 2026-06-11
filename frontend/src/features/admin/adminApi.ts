import { apiRequest, MemberProfile, PageResponse, Role, MemberStatus } from '../../services/apiClient';
import { Board, BoardVisibility, PostingPolicy, PostDetail } from '../posts/postApi';

export interface BoardUpsertRequest {
  slug: string;
  name: string;
  description: string;
  visibility: BoardVisibility;
  postingPolicy: PostingPolicy;
  categoryOptions: string[];
  sortOrder: number;
  isArchived: boolean;
}

export interface AdminMetrics {
  todayMembers: number;
  todayPosts: number;
  todayComments: number;
  pendingReports: number;
  activeBoards: number;
  publishedPosts: number;
}

export function createBoard(request: BoardUpsertRequest) {
  return apiRequest<Board>('/api/v1/boards', {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

export function updateBoard(boardId: string, request: BoardUpsertRequest) {
  return apiRequest<Board>(`/api/v1/boards/${boardId}`, {
    method: 'PATCH',
    body: JSON.stringify(request)
  });
}

export function fetchAdminMetrics() {
  return apiRequest<AdminMetrics>('/api/v1/admin/metrics');
}

export function createNotice(boardId: string, title: string, body: string, category = '공지', pinned = true) {
  return apiRequest<PostDetail>('/api/v1/admin/notices', {
    method: 'POST',
    body: JSON.stringify({ boardId, title, body, category, pinned })
  });
}

export function updateMemberRole(memberId: string, role: Role) {
  return apiRequest<MemberProfile>(`/api/v1/admin/users/${memberId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role })
  });
}

export function updateMemberStatus(memberId: string, status: MemberStatus) {
  return apiRequest<MemberProfile>(`/api/v1/admin/users/${memberId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

export function emptyPage<T>(): PageResponse<T> {
  return { content: [], page: 0, size: 0, totalElements: 0, totalPages: 0 };
}
