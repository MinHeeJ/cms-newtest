import { CalendarClock, Eye, Save, Send, UploadCloud } from "lucide-react";
import { StatusBadge } from "../../components/feedback/StatusBadge";
import type { ContentItem } from "../../services/cmsTypes";

interface PublishPanelProps {
  content: ContentItem;
  scheduledAt: string;
  onScheduleChange: (value: string) => void;
  onSave: () => void;
  onSubmit: () => void;
  onPublish: () => void;
  onPreview: () => void;
}

export function PublishPanel({ content, scheduledAt, onScheduleChange, onSave, onSubmit, onPublish, onPreview }: PublishPanelProps) {
  return (
    <aside className="card-box lg:sticky lg:top-24">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="card-title">게시 패널</h2>
        <StatusBadge status={content.status} />
      </div>
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground dark:text-white" htmlFor="visibility">
            공개 범위
          </label>
          <select id="visibility" className="form-control">
            <option>PUBLIC</option>
            <option>UNLISTED</option>
            <option>PRIVATE</option>
          </select>
          <p className="mt-2 text-xs text-muted-foreground">게시 전 공개 범위와 대표 이미지 altText가 검증됩니다.</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground dark:text-white" htmlFor="schedule">
            예약 게시
          </label>
          <div className="relative">
            <CalendarClock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input id="schedule" className="form-control pl-10" type="datetime-local" value={scheduledAt} onChange={(event) => onScheduleChange(event.target.value)} />
          </div>
        </div>
        <div className="rounded-md bg-lightsecondary p-4">
          <p className="text-sm font-semibold text-foreground dark:text-white">검증 조건</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground dark:text-white/70">
            <li>제목, slug, 본문 필수</li>
            <li>이미지 공개 시 altText 필수</li>
            <li>예약 시간은 미래 시각</li>
          </ul>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <button className="button-base bg-primary text-white hover:bg-primaryemphasis" type="button" onClick={onSave}>
            <Save className="h-4 w-4" aria-hidden="true" />
            초안 저장
          </button>
          <button className="button-base border border-primary bg-transparent text-primary hover:bg-primary hover:text-white" type="button" onClick={onPreview}>
            <Eye className="h-4 w-4" aria-hidden="true" />
            미리보기
          </button>
          <button className="button-base bg-secondary text-white hover:bg-secondaryemphasis" type="button" onClick={onSubmit}>
            <Send className="h-4 w-4" aria-hidden="true" />
            검토 요청
          </button>
          <button className="button-base bg-success text-white hover:bg-emerald-500" type="button" onClick={onPublish}>
            <UploadCloud className="h-4 w-4" aria-hidden="true" />
            게시
          </button>
        </div>
      </div>
    </aside>
  );
}
