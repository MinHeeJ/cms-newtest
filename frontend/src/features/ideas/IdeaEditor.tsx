import { Pin, Save, Star } from "lucide-react";
import { FormEvent } from "react";
import { SaveStatusBadge } from "./SaveStatusBadge";
import { StatusSegmentedControl } from "./StatusSegmentedControl";
import type { IdeaDraft } from "./useIdeaEditor";
import { TagChipInput } from "../tags/TagChipInput";
import type { SaveStatus, Tag } from "../../services/api-client";

interface IdeaEditorProps {
  draft: IdeaDraft;
  allTags: Tag[];
  saveStatus: SaveStatus;
  lastSavedAt?: string | null;
  error?: string | null;
  saveLabel?: string;
  onChange: <K extends keyof IdeaDraft>(key: K, value: IdeaDraft[K]) => void;
  onSave: () => void;
  onRetry: () => void;
  onCreateTag: (name: string) => Promise<Tag>;
}

const accentOptions = [
  { value: "yellow", label: "노랑" },
  { value: "mint", label: "민트" },
  { value: "coral", label: "코랄" },
  { value: "sky", label: "하늘" },
  { value: "violet", label: "보라" }
];

export function IdeaEditor({
  draft,
  allTags,
  saveStatus,
  lastSavedAt,
  error,
  saveLabel = "저장",
  onChange,
  onSave,
  onRetry,
  onCreateTag
}: IdeaEditorProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSave();
  };

  return (
    <form className="editor-surface" onSubmit={handleSubmit}>
      <div className="editor-header">
        <div>
          <p className="eyebrow">Idea Editor</p>
          <h1>{draft.title.trim() || "새 아이디어"}</h1>
        </div>
        <SaveStatusBadge status={saveStatus} lastSavedAt={lastSavedAt} error={error} onRetry={onRetry} />
      </div>

      <div className="editor-toolbar">
        <button
          type="button"
          className={draft.isPinned ? "btn btn-sky" : "btn btn-secondary"}
          onClick={() => onChange("isPinned", !draft.isPinned)}
          aria-pressed={draft.isPinned}
        >
          <Pin size={16} />
          {draft.isPinned ? "고정됨" : "고정"}
        </button>
        <StatusSegmentedControl value={draft.status} onChange={(status) => onChange("status", status)} />
      </div>

      <label className="form-field">
        <span>제목</span>
        <input
          className="input input-title"
          type="text"
          value={draft.title}
          maxLength={120}
          placeholder="주말 사이드 프로젝트"
          onChange={(event) => onChange("title", event.target.value)}
        />
      </label>

      <div className="form-grid">
        <div className="form-field">
          <span>태그</span>
          <TagChipInput
            allTags={allTags}
            selectedTagIds={draft.tagIds}
            onChange={(tagIds) => onChange("tagIds", tagIds)}
            onCreateTag={onCreateTag}
          />
        </div>
        <div className="form-field">
          <span>강조 색상</span>
          <div className="accent-picker" role="radiogroup" aria-label="강조 색상">
            {accentOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`accent-swatch accent-${option.value}${draft.accentColor === option.value ? " active" : ""}`}
                aria-pressed={draft.accentColor === option.value}
                onClick={() => onChange("accentColor", option.value)}
              >
                <Star size={14} />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <label className="form-field body-field">
        <span>본문</span>
        <textarea
          className="textarea"
          value={draft.body}
          maxLength={20000}
          placeholder="떠오른 생각을 바로 붙잡아 보세요."
          onChange={(event) => onChange("body", event.target.value)}
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="editor-actions">
        <button className="btn btn-primary" type="submit" disabled={saveStatus === "saving"}>
          <Save size={18} />
          {saveLabel}
        </button>
      </div>
    </form>
  );
}
