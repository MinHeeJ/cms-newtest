import { Plus, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type { Tag } from "../../services/api-client";

interface TagChipInputProps {
  allTags: Tag[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  onCreateTag?: (name: string) => Promise<Tag>;
}

export function TagChipInput({ allTags, selectedTagIds, onChange, onCreateTag }: TagChipInputProps) {
  const [tagName, setTagName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTags = useMemo(
    () => selectedTagIds.map((id) => allTags.find((tag) => tag.tagId === id)).filter(Boolean) as Tag[],
    [allTags, selectedTagIds]
  );
  const unselectedTags = allTags.filter((tag) => !selectedTagIds.includes(tag.tagId));

  const addTag = (tag: Tag) => {
    if (!selectedTagIds.includes(tag.tagId)) {
      onChange([...selectedTagIds, tag.tagId]);
    }
  };

  const removeTag = (tagId: string) => {
    onChange(selectedTagIds.filter((id) => id !== tagId));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const name = tagName.trim();
    if (!name) {
      return;
    }

    setError(null);
    const existing = allTags.find((tag) => tag.name.toLocaleLowerCase() === name.toLocaleLowerCase());
    if (existing) {
      addTag(existing);
      setTagName("");
      return;
    }

    if (!onCreateTag) {
      setError("태그를 먼저 태그 관리에서 만들어 주세요.");
      return;
    }

    try {
      setIsCreating(true);
      const created = await onCreateTag(name);
      onChange([...selectedTagIds, created.tagId]);
      setTagName("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "태그를 만들지 못했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="tag-chip-input">
      <div className="chip-row" aria-label="선택된 태그">
        {selectedTags.length > 0 ? (
          selectedTags.map((tag) => (
            <span key={tag.tagId} className="chip">
              #{tag.name}
              <button type="button" aria-label={`${tag.name} 태그 제거`} onClick={() => removeTag(tag.tagId)}>
                <X size={14} />
              </button>
            </span>
          ))
        ) : (
          <span className="chip chip-muted">태그 없음</span>
        )}
      </div>

      <form className="tag-add-row" onSubmit={handleSubmit}>
        <input
          className="input"
          type="text"
          value={tagName}
          maxLength={32}
          placeholder="태그 입력"
          onChange={(event) => setTagName(event.target.value)}
          list="tag-options"
        />
        <datalist id="tag-options">
          {unselectedTags.map((tag) => (
            <option key={tag.tagId} value={tag.name} />
          ))}
        </datalist>
        <button className="btn btn-secondary" type="submit" disabled={isCreating}>
          <Plus size={16} />
          추가
        </button>
      </form>
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}
