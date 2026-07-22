import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import App from "./App";

vi.mock("./api", () => ({
  client: {
    me: vi.fn(async () => ({
      id: 1,
      email: "admin@example.com",
      nickname: "관리자",
      role: "ADMIN",
      created_at: "",
      updated_at: "",
    })),
    notifications: vi.fn(async () => ({
      items: [],
      unread_count: 0,
      page: { page: 0, size: 10, total_elements: 0, total_pages: 0 },
    })),
    notices: vi.fn(async () => ({
      items: [],
      page: { page: 0, size: 10, total_elements: 0, total_pages: 0 },
    })),
    notice: vi.fn(async () => ({
      id: 1,
      title: "공지 상세",
      content: "본문",
      author_id: 1,
      author_nickname: "관리자",
      published: true,
      view_count: 1,
      created_at: "",
      updated_at: "",
    })),
    comments: vi.fn(async () => ({
      items: [],
      page: { page: 0, size: 10, total_elements: 0, total_pages: 0 },
    })),
    users: vi.fn(async () => ({
      items: [],
      page: { page: 0, size: 10, total_elements: 0, total_pages: 0 },
    })),
    login: vi.fn(async () => ({ token: "token" })),
    signup: vi.fn(async () => ({
      id: 2,
      email: "user@example.com",
      nickname: "사용자",
      role: "USER",
      created_at: "",
      updated_at: "",
    })),
    updateMe: vi.fn(),
    saveNotice: vi.fn(),
    deleteNotice: vi.fn(),
    createComment: vi.fn(),
    readNotification: vi.fn(),
    readAllNotifications: vi.fn(),
    updateRole: vi.fn(),
  },
}));

describe("route smoke contract", () => {
  beforeEach(() => {
    localStorage.setItem("token", "token");
  });

  afterEach(() => {
    cleanup();
  });

  it.each([
    ["/", "커뮤니티 공지사항"],
    ["/login", "로그인"],
    ["/signup", "회원가입"],
    ["/notices", "공지사항 목록"],
    ["/notices/1", "공지 상세"],
    ["/notifications", "알림 목록"],
    ["/mypage", "내 정보"],
    ["/admin/notices", "공지 관리"],
    ["/admin/users", "사용자 관리"],
    ["/403", "권한이 없습니다"],
    ["/404", "페이지를 찾을 수 없습니다"],
    ["/500", "서버 오류가 발생했습니다"],
  ])("renders %s", async (path, text) => {
    history.pushState({}, "", path);
    render(<App />);
    expect(
      (await screen.findAllByText(new RegExp(text))).length,
    ).toBeGreaterThan(0);
  });
});
