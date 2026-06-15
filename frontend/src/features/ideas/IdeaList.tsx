import { ArrowRight, CheckSquare, Pin } from "lucide-react";
import { Link } from "react-router-dom";
import type { Idea } from "../../services/api-client";
import { EmptyState } from "../../components/EmptyState";

interface IdeaListProps {
  ideas: Idea[];
  isLoading?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  onReset?: () => void;
  emptyCtaLabel?: string;
  emptyCtaHref?: string;
  showCreateCta?: boolean;
}

const statusLabel = {
  captured: "수집됨",
  developing: "발전 중",
  archived: "보관됨"
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));

const displayTitle = (idea: Idea) => {
  const title = idea.title.trim();
  if (title) {
    return title;
  }
  const body = idea.body.trim().replace(/\s+/g, " ");
  return body ? body.slice(0, 72) : "제목 없는 아이디어";
};

export function IdeaList({
  ideas,
  isLoading,
  emptyTitle,
  emptyDescription,
  onReset,
  emptyCtaLabel,
  emptyCtaHref,
  showCreateCta
}: IdeaListProps) {
  if (isLoading) {
    return (
      <div className="idea-list" aria-label="아이디어 로딩 중">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="idea-card skeleton-card" />
        ))}
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        ctaLabel={emptyCtaLabel}
        ctaHref={emptyCtaHref}
        onReset={onReset}
        showCreateCta={showCreateCta}
      />
    );
  }

  return (
    <div className="idea-list">
      {ideas.map((idea) => (
        <Link key={idea.ideaId} to={`/ideas/${idea.ideaId}`} className={`idea-card accent-border-${idea.accentColor}`}>
          <div className="card-topline">
            <span className={`status-badge status-${idea.status}`}>{statusLabel[idea.status]}</span>
            {idea.isPinned ? (
              <span className="pin-badge">
                <Pin size={14} />
                고정
              </span>
            ) : null}
          </div>
          <h3>{displayTitle(idea)}</h3>
          <p>{idea.body || "본문 없이 제목만 저장된 아이디어입니다."}</p>
          <div className="chip-row">
            {idea.tags.length > 0 ? (
              idea.tags.map((tag) => (
                <span key={tag.tagId} className="chip">
                  #{tag.name}
                </span>
              ))
            ) : (
              <span className="chip chip-muted">태그 없음</span>
            )}
          </div>
          <div className="card-footer">
            <span>
              <CheckSquare size={15} />
              {idea.actionItemSummary.completed}/{idea.actionItemSummary.total}
            </span>
            <span>{formatDate(idea.updatedAt)}</span>
            <span className="open-link">
              열기 <ArrowRight size={16} />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
