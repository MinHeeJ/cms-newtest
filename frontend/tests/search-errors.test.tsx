import { describe, expect, it } from "vitest";
import { userMessage } from "../src/lib/error-messages";

describe("search and error messages", () => {
  it("maps 413 responses to user-facing upload message", () => {
    const error = { isAxiosError: true, response: { status: 413, data: {} } };

    expect(userMessage(error)).toContain("업로드 크기");
  });
});
