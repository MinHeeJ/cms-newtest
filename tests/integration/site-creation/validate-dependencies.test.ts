import { beforeEach, describe, expect, it } from "vitest";
import { createSiteDraft } from "@/server/site-creation/create-site-draft";
import { updateSiteDraftRecord } from "@/server/site-creation/site-draft-repository";
import { validateSiteDraft } from "@/server/site-creation/validate-site-draft";
import { useIsolatedSiteCreationStore } from "../../helpers/site-creation-test-utils";

describe("validateSiteDraft dependency order", () => {
  beforeEach(async () => {
    await useIsolatedSiteCreationStore();
  });

  it("blocks a domain that appears before its required domain", async () => {
    const draft = await createSiteDraft({
      site_name: "invalid-order",
      selected_domains: ["content-model"]
    });

    await updateSiteDraftRecord(draft.id, (current) => ({
      ...current,
      generation_stages: [
        { stage_number: 1, domain_codes: ["content-model"] },
        { stage_number: 2, domain_codes: ["cms-core"] }
      ]
    }));

    const report = await validateSiteDraft(draft.id);

    expect(report.outcome).toBe("blocked");
    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "INVALID_GENERATION_ORDER",
          domain_code: "content-model"
        })
      ])
    );
  });
});
