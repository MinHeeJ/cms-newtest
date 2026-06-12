import { ChevronDown, ChevronRight, Folder } from "lucide-react";
import { useEffect, useState } from "react";
import { portalApi, type Folder as FolderType } from "../../lib/api/portal";
import { errorMessage } from "../../lib/error-messages";
import { Button } from "../../ui-components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui-components/card";
import { cn } from "../../lib/utils";
import { EmptyState } from "../common/EmptyState";
import { ErrorState } from "../common/ErrorState";
import { LoadingState } from "../common/LoadingState";

type Props = {
  selectedFolderId: number | null;
  onSelect: (folderId: number) => void;
};

export function FolderTree({ selectedFolderId, onSelect }: Props) {
  const [children, setChildren] = useState<Record<string, FolderType[]>>({});
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (parentId: number | null) => {
    const key = parentId ?? "root";
    if (children[key]) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await portalApi.folders(parentId);
      setChildren((current) => ({ ...current, [key]: result }));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(null);
  }, []);

  const toggle = async (folderId: number) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
    await load(folderId);
  };

  const renderNodes = (nodes: FolderType[], depth = 0) => (
    <div className="grid gap-1">
      {nodes.map((folder) => (
        <div key={folder.id}>
          <div className="flex items-center gap-1" style={{ paddingLeft: depth * 14 }}>
            <Button aria-label="펼치기" className="size-8" size="icon" type="button" variant="ghost" onClick={() => void toggle(folder.id)}>
              {expanded.has(folder.id) ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            </Button>
            <button
              className={cn(
                "flex min-h-9 flex-1 items-center gap-2 rounded-md px-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                selectedFolderId === folder.id && "bg-muted font-medium text-foreground"
              )}
              type="button"
              onClick={() => onSelect(folder.id)}
            >
              <Folder className="size-4 text-muted-foreground" />
              <span className="truncate">{folder.title}</span>
            </button>
          </div>
          {expanded.has(folder.id) && children[folder.id] ? renderNodes(children[folder.id], depth + 1) : null}
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>폴더</CardTitle>
        <CardDescription>열람할 문서 폴더를 선택하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {loading && !children.root ? <LoadingState /> : null}
          {error ? <ErrorState message={error} /> : null}
          {children.root && children.root.length > 0 ? renderNodes(children.root) : null}
          {children.root && children.root.length === 0 ? <EmptyState message="표시할 폴더가 없습니다." /> : null}
        </div>
      </CardContent>
    </Card>
  );
}
