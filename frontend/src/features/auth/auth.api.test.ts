import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSession, login, logout } from "./auth.api";

const origin = "http://localhost:5173";

describe("auth api", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("window", { location: { origin } });
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ user: { id: "1", email: "admin@example.com", displayName: "관리자", status: "ACTIVE", roles: ["ADMIN"], lastLoginAt: null, createdAt: "", updatedAt: "" }, permissions: [] })
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("posts the entered email to create a DB-backed session", async () => {
    await login({ email: "admin@example.com" });

    expect(fetchMock).toHaveBeenCalledWith(`${origin}/api/v1/auth/session`, expect.objectContaining({
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ email: "admin@example.com" })
    }));
  });

  it("loads and clears the cookie-backed session", async () => {
    await getSession();
    expect(fetchMock).toHaveBeenLastCalledWith(`${origin}/api/v1/auth/session`, expect.objectContaining({ credentials: "include" }));

    fetchMock.mockResolvedValueOnce({ ok: true, status: 204, json: async () => undefined });
    await logout();
    expect(fetchMock).toHaveBeenLastCalledWith(`${origin}/api/v1/auth/session`, expect.objectContaining({ method: "DELETE", credentials: "include" }));
  });
});
