import { afterEach, describe, expect, it, vi } from "vitest";
import { login, recoverCredentials } from "./auth.api";

const sessionPayload = {
  user: {
    id: "11111111-1111-4111-8111-111111111111",
    email: "admin@example.com",
    displayName: "관리자",
    status: "ACTIVE",
    roles: ["ADMIN"],
    lastLoginAt: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z"
  },
  permissions: ["content:write"]
};

describe("auth api", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the entered email to create a DB-backed session", async () => {
    vi.stubGlobal("window", { location: { origin: "http://localhost" } });
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(sessionPayload), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const session = await login({ email: "admin@example.com" });

    expect(session.user.email).toBe("admin@example.com");
    expect(fetchMock).toHaveBeenCalledWith("http://localhost/api/v1/auth/session", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com" })
    });
  });

  it("posts an email to recover the stored login id without exposing passwords", async () => {
    vi.stubGlobal("window", { location: { origin: "http://localhost" } });
    const recoveryPayload = {
      loginId: "admin@example.com",
      displayName: "관리자",
      passwordRecoveryMessage: "비밀번호는 보안상 표시할 수 없습니다. 관리자에게 초기화 요청을 보내세요."
    };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(recoveryPayload), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const recovery = await recoverCredentials({ email: "admin@example.com" });

    expect(recovery.loginId).toBe("admin@example.com");
    expect(recovery.passwordRecoveryMessage).not.toContain("password");
    expect(fetchMock).toHaveBeenCalledWith("http://localhost/api/v1/auth/recovery", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com" })
    });
  });
});
