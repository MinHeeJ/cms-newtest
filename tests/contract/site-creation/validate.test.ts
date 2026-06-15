import { beforeEach, describe, expect, it } from "vitest";
import { POST as validateRoute } from "@/app/api/v1/site-creation/drafts/[draftId]/validate/route";
import { createSiteDraft } from "@/server/site-creation/create-site-draft";
import { useIsolatedSiteCreationStore } from "../../helpers/site-creation-test-utils";

describe("POST /api/v1/site-creation/drafts/{draftId}/validate", () => {
  beforeEach(async () => {
    await useIsolatedSiteCreationStore();
  });

  it("returns an OpenAPI-shaped validation report", async () => {
    const draft = await createSiteDraft({
      site_name: "example",
      selected_domains: ["content-model", "page-builder"]
    });

    const response = await validateRoute(
      new Request(`http://localhost/api/v1/site-creation/drafts/${draft.id}/validate`, { method: "POST" }),
      { params: Promise.resolve({ draftId: draft.id }) }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        checked_at: expect.any(String),
        outcome: expect.stringMatching(/passed|passed_with_warnings|blocked/),
        issues: expect.any(Array)
      })
    );
  });
});
