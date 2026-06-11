import { apiRequest, PageResponse } from '../../services/apiClient';

export type ReportTargetType = 'POST' | 'COMMENT';
export type ReportReasonCode = 'SPAM' | 'ABUSE' | 'ILLEGAL' | 'PRIVACY' | 'OTHER';
export type ReportStatus = 'OPEN' | 'IN_REVIEW' | 'ACTIONED' | 'REJECTED' | 'DUPLICATE';
export type ModerationActionType = 'HIDE' | 'RESTORE' | 'DELETE' | 'WARN' | 'SUSPEND' | 'REJECT_REPORT' | 'MARK_DUPLICATE';

export interface Report {
  id: string;
  reporterNickname: string;
  targetType: ReportTargetType;
  targetId: string;
  reasonCode: ReportReasonCode;
  description?: string | null;
  status: ReportStatus;
  createdAt: string;
}

export interface ModerationAction {
  id: string;
  actorNickname: string;
  reportId?: string | null;
  actionType: ModerationActionType;
  reason: string;
  visibleToMember: boolean;
  createdAt: string;
}

export function reportTarget(targetType: ReportTargetType, targetId: string, reasonCode: ReportReasonCode, description?: string) {
  return apiRequest<Report>('/api/v1/reports', {
    method: 'POST',
    body: JSON.stringify({ targetType, targetId, reasonCode, description })
  });
}

export function listReports(status?: ReportStatus) {
  const params = new URLSearchParams({ page: '0', size: '50' });
  if (status) {
    params.set('status', status);
  }
  return apiRequest<PageResponse<Report>>(`/api/v1/admin/reports?${params}`);
}

export function createModerationAction(reportId: string, actionType: ModerationActionType, reason: string, visibleToMember = true) {
  return apiRequest<ModerationAction>(`/api/v1/admin/reports/${reportId}/actions`, {
    method: 'POST',
    body: JSON.stringify({ actionType, reason, visibleToMember })
  });
}
