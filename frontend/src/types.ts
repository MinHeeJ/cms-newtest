export type Role = "USER" | "ADMIN";
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: string | null;
  message: string | null;
};
export type User = {
  id: number;
  email: string;
  nickname: string;
  role: Role;
  created_at: string;
  updated_at: string;
};
export type Notice = {
  id: number;
  title: string;
  content: string;
  author_id: number;
  author_nickname?: string;
  published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
};
export type Comment = {
  id: number;
  notice_id: number;
  author_id: number;
  author_nickname?: string;
  content: string;
  created_at: string;
  updated_at: string;
};
export type NotificationItem = {
  id: number;
  user_id: number;
  type: "NEW_COMMENT";
  message: string;
  reference_id: number | null;
  is_read: boolean;
  created_at: string;
};
export type Page<T> = {
  items: T[];
  page: {
    page: number;
    size: number;
    total_elements: number;
    total_pages: number;
  };
  unread_count?: number;
};
