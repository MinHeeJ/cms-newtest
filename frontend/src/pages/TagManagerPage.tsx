import { Plus, Save, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { apiClient, type Tag } from "../services/api-client";

export function TagManagerPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newName, setNewName] = useState("");
  const [draftNames, setDraftNames] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTags = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.listTags();
      setTags(response.items);
      setDraftNames(Object.fromEntries(response.items.map((tag) => [tag.tagId, tag.name])));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTags()
      .catch((cause) => setError(cause instanceof Error ? cause.message : "태그를 불러오지 못했습니다."))
      .finally(() => setIsLoading(false));
  }, []);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!newName.trim()) {
      return;
    }
    try {
      setError(null);
      await apiClient.createTag({ name: newName });
      setNewName("");
      await loadTags();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "태그를 만들지 못했습니다.");
    }
  };

  const handleSave = async (tag: Tag) => {
    try {
      setError(null);
      await apiClient.updateTag(tag.tagId, { name: draftNames[tag.tagId] ?? tag.name });
      await loadTags();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "태그를 수정하지 못했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    try {
      setError(null);
      await apiClient.deleteTag(deleteTarget.tagId);
      setDeleteTarget(null);
      await loadTags();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "태그를 삭제하지 못했습니다.");
    }
  };

  return (
    <div className="single-page">
      <div className="page-intro">
        <div>
          <p className="eyebrow">Tag Manager</p>
          <h1>태그 관리</h1>
          <p>대소문자만 다른 중복 태그는 만들 수 없습니다.</p>
        </div>
      </div>

      <form className="tag-manager-add" onSubmit={handleCreate}>
        <input className="input" value={newName} maxLength={32} placeholder="새 태그 이름" onChange={(event) => setNewName(event.target.value)} />
        <button className="btn btn-primary" type="submit">
          <Plus size={18} />
          태그 추가
        </button>
      </form>

      {error ? <p className="inline-error">{error}</p> : null}

      <div className="tag-table">
        {isLoading ? (
          Array.from({ length: 4 }, (_, index) => <div key={index} className="tag-row skeleton-line" />)
        ) : tags.length > 0 ? (
          tags.map((tag) => (
            <div key={tag.tagId} className="tag-row">
              <span className="chip">#{tag.name}</span>
              <input
                className="input"
                value={draftNames[tag.tagId] ?? tag.name}
                maxLength={32}
                onChange={(event) => setDraftNames((current) => ({ ...current, [tag.tagId]: event.target.value }))}
                aria-label={`${tag.name} 태그 이름`}
              />
              <button className="btn btn-secondary" type="button" onClick={() => void handleSave(tag)}>
                <Save size={16} />
                저장
              </button>
              <button className="btn btn-danger" type="button" onClick={() => setDeleteTarget(tag)}>
                <Trash2 size={16} />
                삭제
              </button>
            </div>
          ))
        ) : (
          <EmptyState title="태그가 없습니다" description="위 입력창에서 첫 태그를 만들거나, 아이디어를 작성하면서 바로 추가할 수 있습니다." showCreateCta={false} />
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="태그를 삭제할까요?"
        description="태그 연결만 제거되며 아이디어 본문은 유지됩니다."
        confirmLabel="삭제"
        error={error}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
