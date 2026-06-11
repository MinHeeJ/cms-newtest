export type Role = 'MEMBER' | 'MODERATOR' | 'ADMIN';
export type MemberStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'WITHDRAWN';

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface MemberProfile {
  id: string;
  email: string;
  nickname: string;
  role: Role;
  status: MemberStatus;
  profileImageUrl?: string | null;
  bio?: string | null;
  unreadNotificationCount: number;
}

export interface AuthSession {
  accessToken: string;
  member: MemberProfile;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  fieldErrors?: Array<{ field: string; message: string }>;
}

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.status = status;
    this.body = body;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
const TOKEN_KEY = 'cms-community-token';
const MEMBER_KEY = 'cms-community-member';

export function getToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredMember(): MemberProfile | null {
  const raw = window.localStorage.getItem(MEMBER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as MemberProfile;
  } catch {
    return null;
  }
}

export function storeSession(session: AuthSession): void {
  window.localStorage.setItem(TOKEN_KEY, session.accessToken);
  window.localStorage.setItem(MEMBER_KEY, JSON.stringify(session.member));
  window.dispatchEvent(new Event('cms-session-change'));
}

export function clearSession(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(MEMBER_KEY);
  window.dispatchEvent(new Event('cms-session-change'));
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json') ? await response.json() : undefined;
  if (!response.ok) {
    throw new ApiError(response.status, body ?? { code: 'HTTP_ERROR', message: '요청을 처리하지 못했습니다.' });
  }
  return body as T;
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const field = error.body.fieldErrors?.[0]?.message;
    return field ?? error.body.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return '요청을 처리하지 못했습니다.';
}
