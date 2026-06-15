import { describe, expect, it } from "vitest";
import { SiteCreationError, toApiError } from "@/server/api/response";

describe("toApiError", () => {
  it("maps known site creation errors to stable API codes", () => {
    expect(toApiError(new SiteCreationError(409, "HANDOFF_BLOCKED", "Blocked"))).toEqual({
      status: 409,
      code: "HANDOFF_BLOCKED",
      message: "Blocked"
    });
  });

  it("hides unknown error details behind INTERNAL_ERROR", () => {
    expect(toApiError(new Error("database password leaked"))).toEqual({
      status: 500,
      code: "INTERNAL_ERROR",
      message: "The site creation request could not be completed."
    });
  });
});
