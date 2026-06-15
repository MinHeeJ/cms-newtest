import { describe, expect, it, beforeEach } from "vitest";
import { GET } from "@/app/api/v1/site-creation/options/route";
import { useIsolatedSiteCreationStore } from "../../helpers/site-creation-test-utils";

describe("GET /api/v1/site-creation/options", () => {
  beforeEach(async () => {
    await useIsolatedSiteCreationStore();
  });

  it("returns the default CMS domain catalog", async () => {
    const response = await GET(new Request("http://localhost/api/v1/site-creation/options"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.domains).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          domain_code: "cms-core",
          selectable: false,
          requires: []
        }),
        expect.objectContaining({
          domain_code: "content-model",
          selectable: true,
          requires: ["cms-core"]
        })
      ])
    );
  });
});
