import { ArrowDown, ArrowUp, Check, Plus, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import type { IdeaActionItem } from "../../services/api-client";

interface ActionItemPanelProps {
  items: IdeaActionItem[];
  isLoading?: boolean;
  onAdd: (text: string) => Promise<void>;
  onToggle: (item: IdeaActionItem) => Promise<void>;
  onDelete: (item: IdeaActionItem) => Promise<void>;
  onMove?: (item: IdeaActionItem, direction: "up" | "down") => Promise<void>;
}

export function ActionItemPanel({ items, isLoading, onAdd, onToggle, onDelete, onMove }: ActionItemPanelProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const next = text.trim();
    if (!next) {
      return;
    }
    try {
      setError(null);
      await onAdd(next);
      setText("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "실행 항목을 추가하지 못했습니다.");
    }
  };

  return (
    <section className="action-panel">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Development</p>
          <h2>실행 항목</h2>
        </div>
        <span className="summary-badge">
          {items.filter((item) => item.isCompleted).length}/{items.length}
        </span>
      </div>

      <form className="action-add-row" onSubmit={handleSubmit}>
        <input className="input" value={text} placeholder="다음 실행 항목" onChange={(event) => setText(event.target.value)} maxLength={300} />
        <button className="btn btn-primary" type="submit">
          <Plus size={16} />
          실행 항목 추가
        </button>
      </form>
      {error ? <p className="form-error">{error}</p> : null}

      <div className="action-list">
        {isLoading ? (
          <div className="action-item skeleton-line" />
        ) : items.length > 0 ? (
          items.map((item, index) => (
            <div key={item.actionItemId} className={item.isCompleted ? "action-item completed" : "action-item"}>
              <button type="button" className="check-button" aria-label="완료 상태 변경" onClick={() => onToggle(item)}>
                {item.isCompleted ? <Check size={16} /> : null}
              </button>
              <span>{item.text}</span>
              <div className="action-item-controls">
                {onMove ? (
                  <>
                    <button
                      type="button"
                      className="icon-only"
                      aria-label="실행 항목 위로 이동"
                      disabled={index === 0}
                      onClick={() => onMove(item, "up")}
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-only"
                      aria-label="실행 항목 아래로 이동"
                      disabled={index === items.length - 1}
                      onClick={() => onMove(item, "down")}
                    >
                      <ArrowDown size={15} />
                    </button>
                  </>
                ) : null}
                <button type="button" className="icon-only" aria-label="실행 항목 삭제" onClick={() => onDelete(item)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-inline">
            <strong>아직 실행 항목이 없습니다</strong>
            <span>아이디어를 작게 쪼갤 첫 행동을 추가해 보세요.</span>
          </div>
        )}
      </div>
    </section>
  );
}
