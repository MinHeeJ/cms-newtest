import { beforeEach, describe, expect, it } from "vitest";
import { createSiteDraft } from "@/server/site-creation/create-site-draft";
import { generateDocuments } from "@/server/site-creation/generate-documents";
import { requireSiteDraft } from "@/server/site-creation/site-draft-repository";
import { useIsolatedSiteCreationStore } from "../../helpers/site-creation-test-utils";

describe("generateDocuments", () => {
  beforeEach(async () => {
    await useIsolatedSiteCreationStore();
  });

  it("creates spec.md, plan.md, and tasks.md for every effective domain", async () => {
    const draft = await createSiteDraft({
      site_name: "example",
      target_audience: "Editors",
      selected_domains: ["content-model"]
    });

    const job = await generateDocuments(draft.id);
    const generated = await requireSiteDraft(draft.id);

    expect(job.status).toBe("succeeded");
    expect(generated.document_bundles).toHaveLength(generated.effective_domains.length);
    for (const bundle of generated.document_bundles) {
      expect(bundle.artifacts.map((artifact) => artifact.filename).sort()).toEqual([
        "plan.md",
        "spec.md",
        "tasks.md"
      ]);
      expect(bundle.artifacts.map((artifact) => artifact.content).join("\n")).toContain("Generated prose must remain English");
    }
  });
});
