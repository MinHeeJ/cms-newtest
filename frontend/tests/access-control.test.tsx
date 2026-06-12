import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AdminRoute } from "../src/routes/AdminRoute";
import { useAuthStore, type UserRoleProfile } from "../src/stores/auth-store";

const regularUser: UserRoleProfile = {
  username: "user",
  displayName: "포털 사용자",
  role: "USER",
  adminAccess: false,
  portalAccess: true,
  defaultRoute: "/portal"
};

describe("AdminRoute", () => {
  it("denies admin screen to regular users", () => {
    useAuthStore.getState().setAuthForTests("token", regularUser);

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route element={<div>Admin</div>} path="/admin" />
          </Route>
          <Route element={<div>Forbidden</div>} path="/forbidden" />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Forbidden")).toBeInTheDocument();
  });
});
