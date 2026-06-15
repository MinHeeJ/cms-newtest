import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  onReset?: () => void;
  showCreateCta?: boolean;
}

export function EmptyState({
  title,
  description,
  ctaLabel = "새 아이디어",
  ctaHref = "/ideas/new",
  onReset,
  showCreateCta = true
}: EmptyStateProps) {
  return (
    <section className="empty-state">
      <div className="paper-stack" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="empty-actions">
        {onReset ? (
          <button className="btn btn-secondary" type="button" onClick={onReset}>
            필터 초기화
          </button>
        ) : null}
        {showCreateCta ? (
          <Link className="btn btn-primary" to={ctaHref}>
            <Plus size={18} />
            {ctaLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
