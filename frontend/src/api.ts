import axios from "axios";
import type {
  ApiResponse,
  Comment,
  Notice,
  NotificationItem,
  Page,
  Role,
  User,
} from "./types";

export const api = axios.create();
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (location.pathname !== "/login") location.assign("/login");
    }
    return Promise.reject(error);
  },
);
async function unwrap<T>(
  request: Promise<{ data: ApiResponse<T> }>,
): Promise<T> {
  const response = await request;
  if (!response.data.success)
    throw new Error(
      response.data.message || response.data.error || "요청 실패",
    );
  return response.data.data;
}
export const client = {
  signup: (body: { email: string; password: string; nickname: string }) =>
    unwrap<User>(api.post("/api/auth/signup", body)),
  login: (body: { email: string; password: string }) =>
    unwrap<{ token: string }>(api.post("/api/auth/login", body)),
  me: () => unwrap<User>(api.get("/api/auth/me")),
  updateMe: (nickname: string) =>
    unwrap<User>(api.put("/api/auth/me", { nickname })),
  notices: (params?: Record<string, unknown>) =>
    unwrap<Page<Notice>>(api.get("/api/notices", { params })),
  notice: (id: string) => unwrap<Notice>(api.get(`/api/notices/${id}`)),
  saveNotice: (
    body: Partial<Notice> & { title: string; content: string },
    id?: number,
  ) =>
    unwrap<Notice>(
      id ? api.put(`/api/notices/${id}`, body) : api.post("/api/notices", body),
    ),
  deleteNotice: (id: number) => unwrap<null>(api.delete(`/api/notices/${id}`)),
  comments: (noticeId: string) =>
    unwrap<Page<Comment>>(api.get(`/api/notices/${noticeId}/comments`)),
  createComment: (noticeId: string, content: string) =>
    unwrap<Comment>(api.post(`/api/notices/${noticeId}/comments`, { content })),
  updateComment: (id: number, content: string) =>
    unwrap<Comment>(api.put(`/api/comments/${id}`, { content })),
  deleteComment: (id: number) =>
    unwrap<null>(api.delete(`/api/comments/${id}`)),
  notifications: () =>
    unwrap<Page<NotificationItem>>(api.get("/api/notifications")),
  readNotification: (id: number) =>
    unwrap<NotificationItem>(api.patch(`/api/notifications/${id}/read`)),
  readAllNotifications: () =>
    unwrap<NotificationItem[]>(api.patch("/api/notifications/read-all")),
  users: (keyword = "") =>
    unwrap<Page<User>>(api.get("/api/admin/users", { params: { keyword } })),
  updateRole: (id: number, role: Role) =>
    unwrap<User>(api.patch(`/api/admin/users/${id}/role`, { role })),
};
