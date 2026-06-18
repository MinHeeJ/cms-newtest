package com.cms.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="cms_publication_schedules")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PublicationSchedule {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(name="content_item_id", nullable=false) private UUID contentItemId;
    @Column(name="scheduled_at", nullable=false) private Instant scheduledAt;
    @Column(name="status", nullable=false) private String status = "PENDING";
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="requested_by", nullable=false) private CmsUser requestedBy;
    @Column(name="executed_at") private Instant executedAt;
    @Column(name="failure_reason") private String failureReason;
    @Column(name="created_at", updatable=false) private Instant createdAt = Instant.now();
}
