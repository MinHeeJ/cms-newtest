import { apiClient } from "../../services/apiClient";
import type { User } from "../../services/cmsTypes";

export interface AuthSession {
  user: User;
  permissions: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  passwordConfirm: string;
}

export function getSession(): Promise<AuthSession> {
  return apiClient<AuthSession>("/api/v1/auth/session");
}

export function login(request: LoginRequest): Promise<AuthSession> {
  return apiClient<AuthSession>("/api/v1/auth/session", {
    method: "POST",
    body: request
  });
}

export function register(request: RegisterRequest): Promise<AuthSession> {
  return apiClient<AuthSession>("/api/v1/auth/register", {
    method: "POST",
    body: request
  });
}

export function logout(): Promise<void> {
  return apiClient<void>("/api/v1/auth/session", { method: "DELETE" });
}
