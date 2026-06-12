import { useState } from "react";
import { ArticleList } from "../../components/portal/ArticleList";
import { FolderTree } from "../../components/portal/FolderTree";
import { SearchPanel } from "../../components/portal/SearchPanel";

export function PortalHomePage() {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  return (
    <div className="grid gap-4">
      <SearchPanel />
      <div className="cms-grid">
        <FolderTree selectedFolderId={selectedFolderId} onSelect={setSelectedFolderId} />
        <ArticleList folderId={selectedFolderId} />
      </div>
    </div>
  );
}
