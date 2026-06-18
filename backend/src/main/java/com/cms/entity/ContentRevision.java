package com.cms.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="cms_content_revisions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContentRevision {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(name="content_item_id", nullable=false) private UUID contentItemId;
    @Column(name="revision_number", nullable=false) private Integer revisionNumber;
    @Column(name="title_snapshot", nullable=false, length=160) private String titleSnapshot;
    @Column(name="metadata_snapshot", columnDefinition="TEXT") private String metadataSnapshot = "{}";
    @Column(name="markdown_body_snapshot", nullable=false, columnDefinition="TEXT") private String markdownBodySnapshot;
    @Column(name="change_summary") private String changeSummary;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="created_by", nullable=false) private CmsUser createdBy;
    @Column(name="created_at", nullable=false, updatable=false) private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }
}