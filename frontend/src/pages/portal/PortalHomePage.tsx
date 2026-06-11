import { useState } from "react";
import { ArticleList } from "../../components/portal/ArticleList";
import { FolderTree } from "../../components/portal/FolderTree";
import { SearchPanel } from "../../components/portal/SearchPanel";
import type { Folder } from "../../types/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui-components/card";

export function PortalHomePage() {
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>폴더</CardTitle>
        </CardHeader>
        <CardContent>
          <FolderTree selectedFolderId={selectedFolder?.id ?? null} onSelect={setSelectedFolder} />
        </CardContent>
      </Card>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>검색</CardTitle>
          </CardHeader>
          <CardContent>
            <SearchPanel />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{selectedFolder?.title ?? "문서"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ArticleList folderId={selectedFolder?.id ?? null} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
