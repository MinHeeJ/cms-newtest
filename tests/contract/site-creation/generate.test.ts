import { beforeEach, describe, expect, it } from "vitest";
import { POST as generateRoute } from "@/app/api/v1/site-creation/drafts/[draftId]/generate/route";
import { createSiteDraft } from "@/server/site-creation/create-site-draft";
import { useIsolatedSiteCreationStore } from "../../helpers/site-creation-test-utils";

describe("POST /api/v1/site-creation/drafts/{draftId}/generate", () => {
  beforeEach(async () => {
    await useIsolatedSiteCreationStore();
  });

  it("accepts generation for a dependency-valid draft", async () => {
    const draft = await createSiteDraft({
      site_name: "example",
      selected_domains: ["content-model"]
    });

    const response = await generateRoute(
      new Request(`http://localhost/api/v1/site-creation/drafts/${draft.id}/generate`, { method: "POST" }),
      { params: Promise.resolve({ draftId: draft.id }) }
    );
    const payload = await response.json();

    expect(response.status).toBe(202);
    expect(payload).toEqual(
      expect.objectContaining({
        draft_id: draft.id,
        status: "succeeded",
        progress: 100
      })
    );
  });
});
