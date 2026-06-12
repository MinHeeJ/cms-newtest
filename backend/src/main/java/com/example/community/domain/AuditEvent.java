package com.example.community.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_events")
public class AuditEvent {
    @Id
    private UUID id = UUID.randomUUID();

    @Column(nullable = false)
    private UUID actorUserId;

    @Column(nullable = false, length = 80)
    private String subjectType;

    @Column(nullable = false)
    private UUID subjectId;

    @Column(nullable = false, length = 80)
    private String eventType;

    @Column(nullable = false, length = 300)
    private String summary;

    @Column(columnDefinition = "text")
    private String metadata = "{}";

    @Column(nullable = false)
    private Instant createdAt;

    protected AuditEvent() {
    }

    public AuditEvent(UUID actorUserId, String subjectType, UUID subjectId, String eventType, String summary, String metadata) {
        this.actorUserId = actorUserId;
        this.subjectType = subjectType;
        this.subjectId = subjectId;
        this.eventType = eventType;
        this.summary = summary;
        this.metadata = metadata == null ? "{}" : metadata;
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getActorUserId() {
        return actorUserId;
    }

    public String getEventType() {
        return eventType;
    }

    public String getSummary() {
        return summary;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
