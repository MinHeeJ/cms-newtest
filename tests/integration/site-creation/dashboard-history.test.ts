import { beforeEach, describe, expect, it } from "vitest";
import { createSiteDraft } from "@/server/site-creation/create-site-draft";
import { getDashboardSummary } from "@/server/site-creation/dashboard-summary";
import { generateDocuments } from "@/server/site-creation/generate-documents";
import { updateSiteDraftRecord } from "@/server/site-creation/site-draft-repository";
import { validateSiteDraft } from "@/server/site-creation/validate-site-draft";
import { useIsolatedSiteCreationStore } from "../../helpers/site-creation-test-utils";

describe("dashboard history", () => {
  beforeEach(async () => {
    await useIsolatedSiteCreationStore();
  });

  it("sorts recent drafts and highlights blockers", async () => {
    const generated = await createSiteDraft({
      site_name: "generated",
      selected_domains: ["content-model"]
    });
    await generateDocuments(generated.id);

    const blocked = await createSiteDraft({
      site_name: "blocked",
      selected_domains: ["content-model"]
    });
    await updateSiteDraftRecord(blocked.id, (current) => ({
      ...current,
      generation_stages: [
        { stage_number: 1, domain_codes: ["content-model"] },
        { stage_number: 2, domain_codes: ["cms-core"] }
      ],
      updated_at: new Date(Date.now() + 1000).toISOString()
    }));
    await validateSiteDraft(blocked.id);

    const summary = await getDashboardSummary();

    expect(summary.total_drafts).toBe(2);
    expect(summary.generated_drafts).toBe(1);
    expect(summary.blocked_drafts).toBe(1);
    expect(summary.recent_drafts[0].site_name).toBe("blocked");
    expect(summary.blockers[0].issue.code).toBe("INVALID_GENERATION_ORDER");
  });
});
