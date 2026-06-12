import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MarkdownEditor } from "../src/components/admin/MarkdownEditor";

describe("admin content screens", () => {
  it("inserts markdown code block snippet", () => {
    const onChange = vi.fn();
    render(<MarkdownEditor body="# 문서" title="문서" onChange={onChange} />);

    fireEvent.click(screen.getByText("코드"));

    expect(onChange).toHaveBeenCalledWith(expect.stringContaining("```text"));
  });
});
