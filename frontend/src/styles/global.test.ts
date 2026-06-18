import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = (...segments: string[]) => resolve(__dirname, "..", ...segments);

describe("CMS form controls and brand chrome", () => {
  it("defines one base input padding and a dedicated leading-icon variant", () => {
    const css = readFileSync(src("styles", "global.css"), "utf8");

    expect(css).toMatch(/\.form-control\s*\{[\s\S]*px-4[\s\S]*py-2/s);
    expect(css).toMatch(/\.form-control-with-leading-icon\s*\{[\s\S]*pl-11/s);
  });

  it("uses the leading-icon variant instead of ad-hoc left padding on icon inputs", () => {
    const files = [
      src("components", "layout", "AppShell.tsx"),
      src("features", "content", "ContentListPage.tsx"),
      src("features", "content", "PublishPanel.tsx"),
      src("features", "media", "MediaLibraryPage.tsx")
    ];

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toMatch(/form-control[^\"]*\bpl-10\b/);
    }

    expect(readFileSync(files[0], "utf8")).toContain("form-control-with-leading-icon");
    expect(readFileSync(files[1], "utf8")).toContain("form-control-with-leading-icon");
    expect(readFileSync(files[2], "utf8")).toContain("form-control-with-leading-icon");
    expect(readFileSync(files[3], "utf8")).toContain("form-control-with-leading-icon");
  });

  it("renders the CMS brand as an image logo from the app shell", () => {
    const shell = readFileSync(src("components", "layout", "AppShell.tsx"), "utf8");
    const logo = readFileSync(src("assets", "cms-logo.svg"), "utf8");

    expect(shell).toContain("cms-logo.svg");
    expect(shell).toMatch(/<img[^>]+alt=\"CMS\"/);
    expect(logo).toContain("<svg");
  });
});
