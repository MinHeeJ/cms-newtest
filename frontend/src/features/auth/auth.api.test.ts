import { afterEach, describe, expect, it, vi } from "vitest";
import { login, register } from "./auth.api";

const sessionPayload = {
  user: {
    id: "11111111-1111-4111-8111-111111111111",
    username: "basic",
    email: "basic@example.com",
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

  it("posts the entered username and password to create a DB-backed session", async () => {
    vi.stubGlobal("window", { location: { origin: "http://localhost" } });
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(sessionPayload), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const session = await login({ username: "basic", password: "basic" });

    expect(session.user.username).toBe("basic");
    expect(fetchMock).toHaveBeenCalledWith("http://localhost/api/v1/auth/session", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "basic", password: "basic" })
    });
  });

  it("posts a registration request with username, password, and confirmation", async () => {
    vi.stubGlobal("window", { location: { origin: "http://localhost" } });
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(sessionPayload), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    const session = await register({ username: "newuser", password: "new-password", passwordConfirm: "new-password" });

    expect(session.user.username).toBe("basic");
    expect(fetchMock).toHaveBeenCalledWith("http://localhost/api/v1/auth/register", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "newuser", password: "new-password", passwordConfirm: "new-password" })
    });
  });
});
