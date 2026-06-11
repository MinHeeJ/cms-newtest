import { describe, expect, it } from "vitest";
import { useAuthStore } from "../src/stores/auth-store";

describe("auth store", () => {
  it("clears token and profile on logout", () => {
    useAuthStore.setState({
      token: "token",
      profile: {
        username: "admin",
        displayName: "관리자",
        role: "ADMIN",
        adminAccess: true,
        portalAccess: true,
        defaultPath: "/admin"
      }
    });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().profile).toBeNull();
  });
});
