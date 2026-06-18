import { apiClient } from "../../services/apiClient";
import type { User } from "../../services/cmsTypes";

export interface AuthSession {
  user: User;
  permissions: string[];
}

export interface LoginRequest {
  email: string;
}

export interface CredentialRecoveryRequest {
  email: string;
}

export interface CredentialRecoveryResult {
  loginId: string;
  displayName: string;
  passwordRecoveryMessage: string;
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

export function recoverCredentials(request: CredentialRecoveryRequest): Promise<CredentialRecoveryResult> {
  return apiClient<CredentialRecoveryResult>("/api/v1/auth/recovery", {
    method: "POST",
    body: request
  });
}

export function logout(): Promise<void> {
  return apiClient<void>("/api/v1/auth/session", { method: "DELETE" });
}
