import { create } from "zustand";
import { apiClient, registerAuthAccessors, unwrap } from "../lib/axios";
import type { LoginResponse, UserRoleProfile } from "../types/api";

type AuthState = {
  token: string | null;
  profile: UserRoleProfile | null;
  hydrated: boolean;
  login: (username: string, password: string) => Promise<UserRoleProfile>;
  logout: () => void;
  loadScreenContext: () => Promise<UserRoleProfile | null>;
};

const storageKey = "cms-auth";

function readInitialState(): Pick<AuthState, "token" | "profile"> {
  if (typeof window === "undefined") {
    return { token: null, profile: null };
  }
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? "{}");
    return {
      token: parsed.token ?? null,
      profile: parsed.profile ?? null
    };
  } catch {
    return { token: null, profile: null };
  }
}

function persist(token: string | null, profile: UserRoleProfile | null) {
  if (typeof window === "undefined") {
    return;
  }
  if (!token) {
    window.localStorage.removeItem(storageKey);
    return;
  }
  window.localStorage.setItem(storageKey, JSON.stringify({ token, profile }));
}

const initial = readInitialState();

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initial.token,
  profile: initial.profile,
  hydrated: true,
  async login(username, password) {
    const data = unwrap<LoginResponse>(await apiClient.post("/v1/auth/login", { username, password }));
    persist(data.token, data.profile);
    set({ token: data.token, profile: data.profile });
    return data.profile;
  },
  logout() {
    persist(null, null);
    set({ token: null, profile: null });
  },
  async loadScreenContext() {
    if (!get().token) {
      return null;
    }
    const profile = unwrap<UserRoleProfile>(await apiClient.get("/v1/me/screen-context"));
    persist(get().token, profile);
    set({ profile });
    return profile;
  }
}));

registerAuthAccessors(
  () => useAuthStore.getState().token,
  () => useAuthStore.getState().logout()
);
