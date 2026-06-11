import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarkdownEditor } from "../src/components/admin/MarkdownEditor";

describe("admin content editor", () => {
  it("inserts markdown table helper text", () => {
    let value = "# 문서";
    render(<MarkdownEditor value={value} onChange={(next) => { value = next; }} />);

    fireEvent.click(screen.getByText("표"));

    expect(value).toContain("| 항목 | 내용 |");
  });
});
