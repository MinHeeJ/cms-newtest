import { describe, expect, it } from "vitest";

const requiredRoutes = [
  "/",
  "/search",
  "/documents/:documentId",
  "/admin",
  "/admin/folders",
  "/admin/documents",
  "/admin/documents/:documentId/edit",
  "/admin/documents/:documentId/attachments",
  "/admin/operations",
  "/admin/backups",
  "/admin/migrations",
  "/admin/project",
  "/admin/project/scope",
  "/admin/project/staff",
  "/admin/project/risks",
  "/admin/project/deliverables",
  "/admin/project/changes",
];

describe("UI route contract", () => {
  it("keeps every ui-design route represented in the application source", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile(new URL("./AppRouter.tsx", import.meta.url), "utf8"),
    );
    for (const route of requiredRoutes) {
      expect(source).toContain(route);
    }
  });
});
