import { create } from "zustand";
import { apiClient, TOKEN_KEY, unwrap } from "../lib/axios";

export type UserRoleProfile = {
  username: string;
  displayName: string;
  role: "ADMIN" | "USER";
  adminAccess: boolean;
  portalAccess: boolean;
  defaultRoute: string;
};

type LoginResponse = {
  accessToken: string;
  profile: UserRoleProfile;
};

type AuthState = {
  token: string | null;
  profile: UserRoleProfile | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loadScreenContext: () => Promise<void>;
  setAuthForTests: (token: string | null, profile: UserRoleProfile | null) => void;
};

const initialToken = typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initialToken,
  profile: null,
  loading: false,
  async login(username, password) {
    set({ loading: true });
    try {
      const data = unwrap<LoginResponse>(await apiClient.post("/v1/auth/login", { username, password }));
      window.localStorage.setItem(TOKEN_KEY, data.accessToken);
      set({ token: data.accessToken, profile: data.profile, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  logout() {
    window.localStorage.removeItem(TOKEN_KEY);
    set({ token: null, profile: null });
  },
  async loadScreenContext() {
    if (!get().token) {
      return;
    }
    set({ loading: true });
    try {
      const profile = unwrap<UserRoleProfile>(await apiClient.get("/v1/me/screen-context"));
      set({ profile, loading: false });
    } catch (error) {
      get().logout();
      set({ loading: false });
      throw error;
    }
  },
  setAuthForTests(token, profile) {
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
    }
    set({ token, profile });
  }
}));
