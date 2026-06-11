package com.cmsnew.community.audit;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "audit_events")
public class AuditEvent {
    @Id
    private String id;

    private String actorId;

    @Column(nullable = false)
    private String eventType;

    private String targetType;

    private String targetId;

    @Column(nullable = false)
    private String summary;

    @Column(columnDefinition = "text")
    private String metadata;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    protected AuditEvent() {
    }

    public AuditEvent(String actorId, String eventType, String targetType, String targetId, String summary, String metadata) {
        this.actorId = actorId;
        this.eventType = eventType;
        this.targetType = targetType;
        this.targetId = targetId;
        this.summary = summary;
        this.metadata = metadata;
    }

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        createdAt = OffsetDateTime.now();
    }
}
