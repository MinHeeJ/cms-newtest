import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ProtectedRoute } from "../src/routes/ProtectedRoute";
import { useAuthStore } from "../src/stores/auth-store";

describe("protected routes", () => {
  it("redirects anonymous users to login", () => {
    useAuthStore.setState({ token: null, profile: null });

    render(
      <MemoryRouter initialEntries={["/portal"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/portal" element={<div>portal</div>} />
          </Route>
          <Route path="/login" element={<div>login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("login")).toBeInTheDocument();
  });
});
