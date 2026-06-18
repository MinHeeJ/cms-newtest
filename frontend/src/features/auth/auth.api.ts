import { apiClient } from "../../services/apiClient";
import type { User } from "../../services/cmsTypes";

export interface AuthSession {
  user: User;
  permissions: string[];
}

export function getSession(): Promise<AuthSession> {
  return apiClient<AuthSession>("/api/v1/auth/session");
}

export function login(request: { email: string }): Promise<AuthSession> {
  return apiClient<AuthSession>("/api/v1/auth/session", {
    headers: { "X-CMS-User": request.email }
  });
}

export function logout(): Promise<void> {
  return apiClient<void>("/api/v1/auth/session", { method: "DELETE" });
}
