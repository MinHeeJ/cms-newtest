import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "..");

function readProjectFile(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("search input leading icon spacing", () => {
  it("defines a leading-icon form-control modifier after the base form-control rule", () => {
    const css = readProjectFile("src/styles/global.css");
    const baseIndex = css.indexOf(".form-control {");
    const modifierIndex = css.indexOf(".form-control-with-leading-icon");

    expect(baseIndex).toBeGreaterThanOrEqual(0);
    expect(modifierIndex).toBeGreaterThan(baseIndex);
    expect(css.slice(modifierIndex, modifierIndex + 140)).toContain("pl-10");
  });

  it.each([
    "src/components/layout/AppShell.tsx",
    "src/features/content/ContentListPage.tsx",
    "src/features/media/MediaLibraryPage.tsx",
    "src/features/audit/AuditLogPage.tsx"
  ])("uses the modifier on search inputs with leading icons in %s", (path) => {
    const source = readProjectFile(path);
    const searchIconIndex = source.indexOf("<Search className=\"absolute left-3");
    const followingInput = source.slice(searchIconIndex, searchIconIndex + 360);

    expect(searchIconIndex).toBeGreaterThanOrEqual(0);
    expect(followingInput).toContain("form-control-with-leading-icon");
  });
});
