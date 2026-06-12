import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ArticleList } from "../src/components/portal/ArticleList";
import { FolderTree } from "../src/components/portal/FolderTree";
import { portalApi } from "../src/lib/api/portal";

vi.mock("../src/lib/api/portal", () => ({
  portalApi: {
    folders: vi.fn(),
    articles: vi.fn()
  }
}));

describe("portal folder/article flow", () => {
  beforeEach(() => {
    vi.mocked(portalApi.folders).mockResolvedValue([{ id: 1, parentId: null, title: "공지사항", active: true, sortOrder: 0 }]);
    vi.mocked(portalApi.articles).mockResolvedValue([{ id: 10, folderId: 1, title: "CMS 안내", status: "PUBLISHED", sortOrder: 0 }]);
  });

  it("loads root folders", async () => {
    render(<FolderTree selectedFolderId={null} onSelect={() => undefined} />);

    await waitFor(() => expect(screen.getByText("공지사항")).toBeInTheDocument());
  });

  it("loads published articles for selected folder", async () => {
    render(
      <MemoryRouter>
        <ArticleList folderId={1} />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText("CMS 안내")).toBeInTheDocument());
  });
});
