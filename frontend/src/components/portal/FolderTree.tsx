import { ChevronDown, ChevronRight, Folder } from "lucide-react";
import { useEffect, useState } from "react";
import { portalApi, type Folder as FolderType } from "../../lib/api/portal";
import { errorMessage } from "../../lib/error-messages";
import { Button } from "../../ui-components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui-components/card";
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
            <Button aria-label="펼치기" size="icon" type="button" variant="ghost" onClick={() => void toggle(folder.id)}>
              {expanded.has(folder.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Button>
            <button
              className={`flex min-h-9 flex-1 items-center gap-2 rounded-md px-2 text-left text-sm ${selectedFolderId === folder.id ? "bg-[var(--accent-soft)] font-semibold" : "hover:bg-[var(--panel-muted)]"}`}
              type="button"
              onClick={() => onSelect(folder.id)}
            >
              <Folder size={16} />
              <span>{folder.title}</span>
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
      </CardHeader>
      <CardContent>
        {loading && !children.root ? <LoadingState /> : null}
        {error ? <ErrorState message={error} /> : null}
        {children.root ? renderNodes(children.root) : null}
      </CardContent>
    </Card>
  );
}
