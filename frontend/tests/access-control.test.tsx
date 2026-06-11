import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AdminRoute } from "../src/routes/AdminRoute";
import { useAuthStore } from "../src/stores/auth-store";

describe("admin access control", () => {
  it("denies admin route to regular users", () => {
    useAuthStore.setState({
      token: "token",
      profile: {
        username: "user",
        displayName: "포털 사용자",
        role: "USER",
        adminAccess: false,
        portalAccess: true,
        defaultPath: "/portal"
      }
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<div>admin</div>} />
          </Route>
          <Route path="/forbidden" element={<div>forbidden</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("forbidden")).toBeInTheDocument();
  });
});
