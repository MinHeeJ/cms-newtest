import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { useAuthStore } from "../src/stores/auth-store";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  useAuthStore.getState().setAuthForTests(null, null);
});
