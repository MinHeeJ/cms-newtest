import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AttachmentManager } from "../src/components/admin/AttachmentManager";
import { MarkdownPreview } from "../src/components/admin/MarkdownPreview";

vi.mock("../src/lib/api/admin", () => ({
  fetchAttachments: vi.fn().mockResolvedValue([]),
  uploadAttachment: vi.fn(),
  deleteAttachment: vi.fn()
}));

describe("editor attachments", () => {
  it("renders markdown preview", () => {
    render(<MarkdownPreview markdown={"# 미리보기"} />);

    expect(screen.getByRole("heading", { name: "미리보기" })).toBeInTheDocument();
  });

  it("validates unsupported attachment extension", async () => {
    render(<AttachmentManager />);

    const input = document.querySelector("input[type='file']") as HTMLInputElement;
    const file = new File(["x"], "bad.exe", { type: "application/octet-stream" });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(screen.getByText("허용되지 않는 파일 형식입니다.")).toBeInTheDocument());
  });
});
