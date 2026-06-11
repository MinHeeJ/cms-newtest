package com.cmsnew.community.notification;

import java.time.OffsetDateTime;

import com.cmsnew.community.common.CommunityEnums.NotificationType;

public final class NotificationDtos {
    private NotificationDtos() {
    }

    public record NotificationResponse(
            String id,
            NotificationType type,
            String title,
            String message,
            String targetType,
            String targetId,
            OffsetDateTime readAt,
            OffsetDateTime createdAt
    ) {
        public static NotificationResponse from(Notification notification) {
            return new NotificationResponse(
                    notification.getId(),
                    notification.getType(),
                    notification.getTitle(),
                    notification.getMessage(),
                    notification.getTargetType(),
                    notification.getTargetId(),
                    notification.getReadAt(),
                    notification.getCreatedAt()
            );
        }
    }
}
