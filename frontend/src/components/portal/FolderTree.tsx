import { ChevronDown, ChevronRight, Folder } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchPortalFolders } from "../../lib/api/portal";
import { userMessage } from "../../lib/error-messages";
import type { Folder as FolderType } from "../../types/api";
import { Button } from "../../ui-components/button";
import { EmptyState } from "../common/EmptyState";
import { ErrorState } from "../common/ErrorState";
import { LoadingState } from "../common/LoadingState";

type Props = {
  selectedFolderId: number | null;
  onSelect: (folder: FolderType) => void;
};

export function FolderTree({ selectedFolderId, onSelect }: Props) {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [children, setChildren] = useState<Record<number, FolderType[]>>({});
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchPortalFolders(null)
      .then((items) => {
        setFolders(items);
        if (!selectedFolderId && items[0]) onSelect(items[0]);
      })
      .catch((err) => setError(userMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  async function toggle(folder: FolderType) {
    if (expanded.has(folder.id)) {
      setExpanded((current) => {
        const next = new Set(current);
        next.delete(folder.id);
        return next;
      });
      return;
    }
    if (!children[folder.id]) {
      try {
        const loaded = await fetchPortalFolders(folder.id);
        setChildren((current) => ({ ...current, [folder.id]: loaded }));
      } catch (err) {
        setError(userMessage(err));
      }
    }
    setExpanded((current) => new Set(current).add(folder.id));
  }

  if (folders.length === 0) return <EmptyState message="활성 폴더가 없습니다." />;

  return <nav className="grid gap-2">{folders.map((folder) => renderFolder(folder, 0, children, expanded, selectedFolderId, onSelect, toggle))}</nav>;
}

function renderFolder(
  folder: FolderType,
  depth: number,
  children: Record<number, FolderType[]>,
  expanded: Set<number>,
  selectedFolderId: number | null,
  onSelect: (folder: FolderType) => void,
  toggle: (folder: FolderType) => void
) {
  const childItems = children[folder.id] ?? [];
  const isExpanded = expanded.has(folder.id);
  return (
    <div key={folder.id} className="grid gap-1">
      <div className="flex gap-1" style={{ paddingLeft: depth * 12 }}>
        <Button aria-label={isExpanded ? "접기" : "펼치기"} size="icon" variant="ghost" onClick={() => toggle(folder)}>
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </Button>
        <Button
          className="h-10 min-w-0 flex-1 justify-start"
          variant={selectedFolderId === folder.id ? "primary" : "secondary"}
          onClick={() => onSelect(folder)}
        >
          <Folder size={17} />
          <span className="truncate">{folder.title}</span>
        </Button>
      </div>
      {isExpanded ? childItems.map((child) => renderFolder(child, depth + 1, children, expanded, selectedFolderId, onSelect, toggle)) : null}
    </div>
  );
}
