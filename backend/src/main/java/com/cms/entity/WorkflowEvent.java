package com.cms.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;
@Entity
@Table(name="cms_workflow_events")
@Getter @Setter @NoArgsConstructor
public class WorkflowEvent {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(name="event_type", nullable=false) private String eventType;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="actor_id", nullable=false) private CmsUser actor;
    @Column(name="target_type", nullable=false) private String targetType;
    @Column(name="target_id", nullable=false) private UUID targetId;
    @Column(name="before_state", columnDefinition="TEXT") private String beforeState;
    @Column(name="after_state", columnDefinition="TEXT") private String afterState;
    private String comment;
    @Column(name="created_at", nullable=false, updatable=false) private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public static WorkflowEventBuilder builder() { return new WorkflowEventBuilder(); }

    public static class WorkflowEventBuilder {
        private String eventType;
        private CmsUser actor;
        private String targetType;
        private UUID targetId;
        private String beforeState;
        private String afterState;
        private String comment;

        public WorkflowEventBuilder eventType(String v) { this.eventType = v; return this; }
        public WorkflowEventBuilder actor(CmsUser v) { this.actor = v; return this; }
        public WorkflowEventBuilder targetType(String v) { this.targetType = v; return this; }
        public WorkflowEventBuilder targetId(UUID v) { this.targetId = v; return this; }
        public WorkflowEventBuilder beforeState(String v) { this.beforeState = v; return this; }
        public WorkflowEventBuilder afterState(String v) { this.afterState = v; return this; }
        public WorkflowEventBuilder comment(String v) { this.comment = v; return this; }

        public WorkflowEvent build() {
            WorkflowEvent e = new WorkflowEvent();
            e.eventType = eventType; e.actor = actor;
            e.targetType = targetType; e.targetId = targetId;
            e.beforeState = beforeState; e.afterState = afterState;
            e.comment = comment;
            e.createdAt = Instant.now();
            return e;
        }
    }
}