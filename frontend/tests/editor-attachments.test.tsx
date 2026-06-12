import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarkdownPreview } from "../src/components/admin/MarkdownPreview";
import { validateAttachmentFile } from "../src/components/admin/AttachmentManager";

describe("editor attachments", () => {
  it("renders markdown preview", () => {
    render(<MarkdownPreview body="# 제목\n\n| A | B |\n| --- | --- |\n| 1 | 2 |" title="제목" />);

    expect(screen.getAllByRole("heading", { name: "제목" }).length).toBeGreaterThan(0);
  });

  it("rejects unsupported attachment extension", () => {
    const file = new File(["x"], "script.exe", { type: "application/octet-stream" });

    expect(validateAttachmentFile(file)).toContain("확장자");
  });
});
