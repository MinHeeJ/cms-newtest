import { beforeEach, describe, expect, it } from "vitest";
import { createSiteDraft } from "@/server/site-creation/create-site-draft";
import { useIsolatedSiteCreationStore } from "../../helpers/site-creation-test-utils";

describe("createSiteDraft", () => {
  beforeEach(async () => {
    await useIsolatedSiteCreationStore();
  });

  it("auto-adds cms-core and creates dependency-aligned stages", async () => {
    const draft = await createSiteDraft({
      site_name: "example",
      description: "Editorial CMS",
      selected_domains: ["content-model"]
    });

    expect(draft.selected_domains).toEqual(["content-model"]);
    expect(draft.auto_added_domains).toContain("cms-core");
    expect(draft.effective_domains).toEqual(["cms-core", "content-model"]);
    expect(draft.generation_stages[0]).toEqual(
      expect.objectContaining({
        stage_number: 1,
        domain_codes: ["cms-core"]
      })
    );
  });
});
