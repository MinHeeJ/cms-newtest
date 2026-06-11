package com.cmsnew.community.notification;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.cmsnew.community.common.CommunityEnums.NotificationType;
import com.cmsnew.community.member.Member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id")
    private Member recipient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String message;

    private String targetType;

    private String targetId;

    private OffsetDateTime readAt;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    protected Notification() {
    }

    public Notification(Member recipient, NotificationType type, String title, String message, String targetType, String targetId) {
        this.recipient = recipient;
        this.type = type;
        this.title = title;
        this.message = message;
        this.targetType = targetType;
        this.targetId = targetId;
    }

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        createdAt = OffsetDateTime.now();
    }

    public void markRead() {
        readAt = OffsetDateTime.now();
    }

    public String getId() {
        return id;
    }

    public Member getRecipient() {
        return recipient;
    }

    public NotificationType getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public String getTargetType() {
        return targetType;
    }

    public String getTargetId() {
        return targetId;
    }

    public OffsetDateTime getReadAt() {
        return readAt;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
