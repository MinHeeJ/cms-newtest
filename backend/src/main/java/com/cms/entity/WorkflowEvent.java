package com.cms.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="cms_workflow_events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkflowEvent {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(name="event_type", nullable=false) private String eventType;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="actor_id", nullable=false) private CmsUser actor;
    @Column(name="target_type", nullable=false) private String targetType;
    @Column(name="target_id", nullable=false) private UUID targetId;
    @Column(name="before_state", columnDefinition="TEXT") private String beforeState;
    @Column(name="after_state", columnDefinition="TEXT") private String afterState;
    private String comment;
    @Column(name="created_at", updatable=false) private Instant createdAt = Instant.now();
}
