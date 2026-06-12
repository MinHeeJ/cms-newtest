import { useState } from "react";
import { ArticleList } from "../../components/portal/ArticleList";
import { FolderTree } from "../../components/portal/FolderTree";
import { SearchPanel } from "../../components/portal/SearchPanel";

export function PortalHomePage() {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">지식 포털</h1>
          <p className="text-muted-foreground">폴더를 선택하거나 제목과 본문을 검색해 문서를 찾아보세요.</p>
        </div>
      </div>
      <SearchPanel />
      <div className="cms-grid">
        <FolderTree selectedFolderId={selectedFolderId} onSelect={setSelectedFolderId} />
        <ArticleList folderId={selectedFolderId} />
      </div>
    </div>
  );
}
