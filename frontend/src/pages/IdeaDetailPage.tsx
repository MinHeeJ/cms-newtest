import { Archive, ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ActionItemPanel } from "../features/ideas/ActionItemPanel";
import { IdeaEditor } from "../features/ideas/IdeaEditor";
import { draftToPayload, ideaToDraft, useIdeaEditor, type IdeaDraft } from "../features/ideas/useIdeaEditor";
import { apiClient, type Idea, type IdeaActionItem, type IdeaStatus, type Tag } from "../services/api-client";

export function IdeaDetailPage() {
  const { ideaId } = useParams<{ ideaId: string }>();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [items, setItems] = useState<IdeaActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isItemsLoading, setIsItemsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const refreshIdea = useCallback(async () => {
    if (!ideaId) {
      return;
    }
    const next = await apiClient.getIdea(ideaId);
    setIdea(next);
  }, [ideaId]);

  const refreshItems = useCallback(async () => {
    if (!ideaId) {
      return;
    }
    setIsItemsLoading(true);
    try {
      const response = await apiClient.listActionItems(ideaId);
      setItems(response.items);
    } finally {
      setIsItemsLoading(false);
    }
  }, [ideaId]);

  useEffect(() => {
    if (!ideaId) {
      return;
    }

    let ignore = false;
    setIsLoading(true);
    Promise.all([apiClient.getIdea(ideaId), apiClient.listTags(), apiClient.listActionItems(ideaId)])
      .then(([ideaResponse, tagResponse, itemResponse]) => {
        if (!ignore) {
          setIdea(ideaResponse);
          setTags(tagResponse.items);
          setItems(itemResponse.items);
          setLoadError(null);
        }
      })
      .catch((cause) => {
        if (!ignore) {
          setLoadError(cause instanceof Error ? cause.message : "아이디어를 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
          setIsItemsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [ideaId]);

  const createTag = async (name: string) => {
    const tag = await apiClient.createTag({ name });
    setTags((current) => [...current, tag].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)));
    return tag;
  };

  const handleDelete = async () => {
    if (!ideaId) {
      return;
    }
    try {
      setDeleteError(null);
      await apiClient.deleteIdea(ideaId);
      navigate("/ideas", { replace: true });
    } catch (cause) {
      setDeleteError(cause instanceof Error ? cause.message : "삭제하지 못했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="editor-page">
        <div className="editor-surface skeleton-editor" />
      </div>
    );
  }

  if (loadError || !idea || !ideaId) {
    return (
      <div className="editor-page">
        <div className="inline-error">{loadError ?? "아이디어를 찾을 수 없습니다."}</div>
        <Link className="btn btn-secondary" to="/ideas">
          목록으로
        </Link>
      </div>
    );
  }

  return (
    <IdeaDetailBody
      ideaId={ideaId}
      idea={idea}
      tags={tags}
      items={items}
      isItemsLoading={isItemsLoading}
      onCreateTag={createTag}
      onIdeaUpdated={setIdea}
      onRefreshIdea={refreshIdea}
      onRefreshItems={refreshItems}
      onDeleteClick={() => setConfirmOpen(true)}
    >
      <ConfirmDialog
        open={confirmOpen}
        title="아이디어를 삭제할까요?"
        description="삭제하면 본문, 태그 연결, 실행 항목을 되돌릴 수 없습니다."
        confirmLabel="삭제"
        error={deleteError}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void handleDelete()}
      />
    </IdeaDetailBody>
  );
}

interface IdeaDetailBodyProps {
  ideaId: string;
  idea: Idea;
  tags: Tag[];
  items: IdeaActionItem[];
  isItemsLoading: boolean;
  children: ReactNode;
  onCreateTag: (name: string) => Promise<Tag>;
  onIdeaUpdated: (idea: Idea) => void;
  onRefreshIdea: () => Promise<void>;
  onRefreshItems: () => Promise<void>;
  onDeleteClick: () => void;
}

function IdeaDetailBody({
  ideaId,
  idea,
  tags,
  items,
  isItemsLoading,
  children,
  onCreateTag,
  onIdeaUpdated,
  onRefreshIdea,
  onRefreshItems,
  onDeleteClick
}: IdeaDetailBodyProps) {
  const navigate = useNavigate();
  const saveDraft = useCallback(
    async (draft: IdeaDraft) => {
      const updated = await apiClient.updateIdea(ideaId, draftToPayload(draft));
      onIdeaUpdated(updated);
      return updated;
    },
    [ideaId, onIdeaUpdated]
  );
  const editor = useIdeaEditor({
    initialDraft: ideaToDraft(idea),
    initialLastSavedAt: idea.lastSavedAt,
    saveDraft
  });

  const saveWithoutThrow = () => {
    void editor.save().catch(() => undefined);
  };

  const applyStatus = async (status: IdeaStatus) => {
    const updated = await apiClient.updateIdea(ideaId, { status });
    onIdeaUpdated(updated);
    editor.setDraft(ideaToDraft(updated));
    if (status === "archived") {
      navigate("/archive");
    }
  };

  const addActionItem = async (text: string) => {
    await apiClient.createActionItem(ideaId, { text });
    await onRefreshItems();
    await onRefreshIdea();
  };

  const toggleActionItem = async (item: IdeaActionItem) => {
    await apiClient.updateActionItem(ideaId, item.actionItemId, { isCompleted: !item.isCompleted });
    await onRefreshItems();
    await onRefreshIdea();
  };

  const deleteActionItem = async (item: IdeaActionItem) => {
    await apiClient.deleteActionItem(ideaId, item.actionItemId);
    await onRefreshItems();
    await onRefreshIdea();
  };

  const moveActionItem = async (item: IdeaActionItem, direction: "up" | "down") => {
    const currentIndex = items.findIndex((candidate) => candidate.actionItemId === item.actionItemId);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const target = items[targetIndex];
    if (currentIndex < 0 || !target) {
      return;
    }

    await Promise.all([
      apiClient.updateActionItem(ideaId, item.actionItemId, { sortOrder: target.sortOrder }),
      apiClient.updateActionItem(ideaId, target.actionItemId, { sortOrder: item.sortOrder })
    ]);
    await onRefreshItems();
  };

  return (
    <div className="editor-page">
      <div className="subnav">
        <Link className="btn btn-secondary" to={idea.status === "archived" ? "/archive" : "/ideas"}>
          <ArrowLeft size={16} />
          {idea.status === "archived" ? "보관함" : "목록으로"}
        </Link>
        <div className="detail-actions">
          {idea.status === "archived" ? (
            <button className="btn btn-sky" type="button" onClick={() => void applyStatus("captured")}>
              <RotateCcw size={16} />
              복원
            </button>
          ) : (
            <button className="btn btn-secondary" type="button" onClick={() => void applyStatus("archived")}>
              <Archive size={16} />
              보관
            </button>
          )}
          <button className="btn btn-danger" type="button" onClick={onDeleteClick}>
            <Trash2 size={16} />
            삭제
          </button>
        </div>
      </div>

      <IdeaEditor
        draft={editor.draft}
        allTags={tags}
        saveStatus={editor.saveStatus}
        lastSavedAt={editor.lastSavedAt}
        error={editor.error}
        saveLabel="저장"
        onChange={editor.updateDraft}
        onSave={saveWithoutThrow}
        onRetry={saveWithoutThrow}
        onCreateTag={onCreateTag}
      />

      <ActionItemPanel
        items={items}
        isLoading={isItemsLoading}
        onAdd={addActionItem}
        onToggle={toggleActionItem}
        onDelete={deleteActionItem}
        onMove={moveActionItem}
      />
      {children}
    </div>
  );
}
