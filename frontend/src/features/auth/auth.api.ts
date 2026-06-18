import { apiClient } from "../../services/apiClient";
import type { User } from "../../services/cmsTypes";

export interface RegisterPayload {
  email: string;
  displayName: string;
}

export const authApi = {
  register(payload: RegisterPayload) {
    return apiClient<User>("/api/v1/auth/register", { method: "POST", body: payload });
  }
};
