import { Archive, ListFilter, Pin, Tags } from "lucide-react";
import type { IdeaStatus, Tag } from "../../services/api-client";

interface FilterRailProps {
  status?: IdeaStatus;
  tag?: string;
  pinned?: boolean;
  tags: Tag[];
  onStatusChange: (status?: IdeaStatus) => void;
  onTagChange: (tag?: string) => void;
  onPinnedChange: (pinned?: boolean) => void;
  onReset: () => void;
}

const statusOptions: Array<{ value?: IdeaStatus; label: string }> = [
  { value: undefined, label: "활성" },
  { value: "captured", label: "수집됨" },
  { value: "developing", label: "발전 중" },
  { value: "archived", label: "보관됨" }
];

export function FilterRail({ status, tag, pinned, tags, onStatusChange, onTagChange, onPinnedChange, onReset }: FilterRailProps) {
  return (
    <aside className="filter-rail" aria-label="아이디어 필터">
      <div className="rail-block">
        <h2>
          <ListFilter size={18} />
          Status
        </h2>
        <div className="rail-options">
          {statusOptions.map((option) => (
            <button
              key={option.value ?? "active"}
              type="button"
              className={option.value === status ? "active" : ""}
              onClick={() => onStatusChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rail-block">
        <h2>
          <Pin size={18} />
          고정
        </h2>
        <button type="button" className={pinned ? "rail-toggle active" : "rail-toggle"} onClick={() => onPinnedChange(pinned ? undefined : true)}>
          고정 아이디어만
        </button>
      </div>

      <div className="rail-block">
        <h2>
          <Tags size={18} />
          Tags
        </h2>
        <div className="rail-options rail-tags">
          {tags.length > 0 ? (
            tags.map((item) => (
              <button
                key={item.tagId}
                type="button"
                className={tag === item.tagId ? "active" : ""}
                title={item.name}
                onClick={() => onTagChange(tag === item.tagId ? undefined : item.tagId)}
              >
                #{item.name}
              </button>
            ))
          ) : (
            <span className="rail-empty">태그 없음</span>
          )}
        </div>
      </div>

      <button type="button" className="btn btn-secondary rail-reset" onClick={onReset}>
        <Archive size={16} />
        필터 초기화
      </button>
    </aside>
  );
}
