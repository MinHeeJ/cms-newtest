import { apiRequest, PageResponse } from '../../services/apiClient';

export type BoardVisibility = 'PUBLIC' | 'MEMBERS_ONLY' | 'CLOSED';
export type PostingPolicy = 'MEMBERS' | 'MODERATORS' | 'ADMINS';
export type PostStatus = 'PUBLISHED' | 'HIDDEN' | 'DELETED' | 'LOCKED';
export type ReactionType = 'LIKE' | 'FUN' | 'INSIGHTFUL';
export type CommentStatus = 'PUBLISHED' | 'HIDDEN' | 'DELETED';

export interface Board {
  id: string;
  slug: string;
  name: string;
  description: string;
  visibility: BoardVisibility;
  postingPolicy: PostingPolicy;
  categoryOptions: string[];
  sortOrder: number;
  isArchived: boolean;
}

export interface PostSummary {
  id: string;
  boardId: string;
  boardName: string;
  title: string;
  category?: string | null;
  authorNickname: string;
  status: PostStatus;
  viewCount: number;
  commentCount: number;
  reactionCount: number;
  isNotice: boolean;
  isPinned: boolean;
  createdAt: string;
}

export interface PostDetail extends PostSummary {
  body: string;
  attachments: Array<{ id: string; fileName: string; contentType: string; sizeBytes: number; url: string }>;
  currentMemberReaction?: ReactionType | null;
}

export interface Comment {
  id: string;
  postId: string;
  parentCommentId?: string | null;
  authorNickname: string;
  body: string;
  status: CommentStatus;
  depth: number;
  createdAt: string;
}

export interface ReactionSummary {
  postId: string;
  counts: Partial<Record<ReactionType, number>>;
  currentMemberReaction?: ReactionType | null;
}

export interface PostCreateRequest {
  title: string;
  body: string;
  category?: string;
  attachmentIds?: string[];
}

export function listBoards(page = 0, size = 30) {
  return apiRequest<PageResponse<Board>>(`/api/v1/boards?page=${page}&size=${size}`);
}

export function getBoard(boardId: string) {
  return apiRequest<Board>(`/api/v1/boards/${boardId}`);
}

export function listBoardPosts(boardId: string, sort = 'latest', category?: string) {
  const params = new URLSearchParams({ sort, page: '0', size: '50' });
  if (category) {
    params.set('category', category);
  }
  return apiRequest<PageResponse<PostSummary>>(`/api/v1/boards/${boardId}/posts?${params}`);
}

export function getPost(postId: string) {
  return apiRequest<PostDetail>(`/api/v1/posts/${postId}`);
}

export function createPost(boardId: string, request: PostCreateRequest) {
  return apiRequest<PostDetail>(`/api/v1/boards/${boardId}/posts`, {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

export function listComments(postId: string) {
  return apiRequest<PageResponse<Comment>>(`/api/v1/posts/${postId}/comments?page=0&size=100`);
}

export function createComment(postId: string, body: string, parentCommentId?: string | null) {
  return apiRequest<Comment>(`/api/v1/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body, parentCommentId })
  });
}

export function reactToPost(postId: string, type: ReactionType) {
  return apiRequest<ReactionSummary>(`/api/v1/posts/${postId}/reactions`, {
    method: 'PUT',
    body: JSON.stringify({ type })
  });
}

export function removeReaction(postId: string) {
  return apiRequest<ReactionSummary>(`/api/v1/posts/${postId}/reactions`, {
    method: 'DELETE'
  });
}

export function bookmarkPost(postId: string) {
  return apiRequest<void>(`/api/v1/posts/${postId}/bookmark`, { method: 'PUT' });
}

export function removeBookmark(postId: string) {
  return apiRequest<void>(`/api/v1/posts/${postId}/bookmark`, { method: 'DELETE' });
}

export function subscribeBoard(boardId: string) {
  return apiRequest<void>(`/api/v1/boards/${boardId}/subscription`, { method: 'PUT' });
}

export function unsubscribeBoard(boardId: string) {
  return apiRequest<void>(`/api/v1/boards/${boardId}/subscription`, { method: 'DELETE' });
}
