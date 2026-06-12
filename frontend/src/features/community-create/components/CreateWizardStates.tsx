import { AlertTriangle, FilePlus2, Loader2, LockKeyhole, RotateCw } from 'lucide-react';
import { ApiError } from '../api/communityCreationClient';

export function LoadingState() {
  return (
    <div className="state-panel" role="status" aria-live="polite">
      <Loader2 className="spin mt-1" aria-hidden="true" />
      <div className="state-skeleton">
        <strong>개설 초안을 준비하고 있습니다.</strong>
        <p className="text-sm text-muted-foreground">저장된 초안이 있으면 마지막으로 작성하던 단계에서 다시 엽니다.</p>
        <span className="skeleton-line w-3/4" />
        <span className="skeleton-line w-1/2" />
      </div>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: ApiError; onRetry?: () => void }) {
  return (
    <div className="state-panel state-panel-error" role="alert">
      <AlertTriangle className="mt-1" aria-hidden="true" />
      <div className="grid flex-1 gap-2">
        <strong>{error.message}</strong>
        {error.fieldErrors?.length ? (
          <ul className="m-0 grid gap-1 pl-5 text-sm">
            {error.fieldErrors.map((fieldError) => (
              <li key={`${fieldError.field}-${fieldError.code}`}>{fieldError.message}</li>
            ))}
          </ul>
        ) : null}
      </div>
      {onRetry ? (
        <button className="icon-button" type="button" onClick={onRetry} aria-label="다시 시도">
          <RotateCw size={18} />
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="state-panel">
      <FilePlus2 className="mt-1 text-muted-foreground" aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function PermissionDeniedState() {
  return (
    <div className="state-panel state-panel-error">
      <LockKeyhole className="mt-1" aria-hidden="true" />
      <div>
        <strong>접근 권한이 없습니다.</strong>
        <p className="text-sm">커뮤니티 개설 제한 상태이거나 운영자 전용 화면입니다.</p>
      </div>
    </div>
  );
}
