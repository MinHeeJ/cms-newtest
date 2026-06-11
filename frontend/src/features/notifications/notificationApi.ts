import { apiRequest, PageResponse } from '../../services/apiClient';

export type NotificationType = 'REPLY' | 'COMMENT_ON_POST' | 'MODERATION_RESULT' | 'NOTICE';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  targetType?: string | null;
  targetId?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export function listNotifications(unreadOnly = false) {
  return apiRequest<PageResponse<NotificationItem>>(`/api/v1/notifications?unreadOnly=${unreadOnly}&page=0&size=50`);
}

export function markNotificationRead(notificationId: string) {
  return apiRequest<void>(`/api/v1/notifications/${notificationId}/read`, { method: 'PATCH' });
}
