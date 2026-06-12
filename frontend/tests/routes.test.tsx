import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ProtectedRoute } from "../src/routes/ProtectedRoute";

describe("ProtectedRoute", () => {
  it("redirects anonymous users to login", () => {
    render(
      <MemoryRouter initialEntries={["/portal"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<div>Portal</div>} path="/portal" />
          </Route>
          <Route element={<div>Login</div>} path="/login" />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login")).toBeInTheDocument();
  });
});
