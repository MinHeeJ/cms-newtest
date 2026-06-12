import { describe, expect, it } from "vitest";
import { TOKEN_KEY } from "../src/lib/axios";
import { useAuthStore, type UserRoleProfile } from "../src/stores/auth-store";

const profile: UserRoleProfile = {
  username: "admin",
  displayName: "CMS 관리자",
  role: "ADMIN",
  adminAccess: true,
  portalAccess: true,
  defaultRoute: "/admin"
};

describe("auth-store", () => {
  it("stores and clears token/profile", () => {
    useAuthStore.getState().setAuthForTests("token", profile);

    expect(window.localStorage.getItem(TOKEN_KEY)).toBe("token");
    expect(useAuthStore.getState().profile?.adminAccess).toBe(true);

    useAuthStore.getState().logout();

    expect(window.localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(useAuthStore.getState().profile).toBeNull();
  });
});
