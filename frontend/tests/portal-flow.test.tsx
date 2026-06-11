import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArticleViewer } from "../src/components/portal/ArticleViewer";

describe("portal article flow", () => {
  it("renders markdown article details", () => {
    render(
      <ArticleViewer
        article={{
          id: 1,
          folderId: 1,
          title: "게시 문서",
          bodyMarkdown: "# 제목\n\n| A | B |\n| - | - |\n| 1 | 2 |",
          status: "PUBLISHED",
          sortOrder: 0
        }}
      />
    );

    expect(screen.getByText("게시 문서")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});
