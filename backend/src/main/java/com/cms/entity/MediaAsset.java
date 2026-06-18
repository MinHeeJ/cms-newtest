package com.cms.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="cms_media_assets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MediaAsset {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(name="file_name", nullable=false) private String fileName;
    @Column(name="mime_type", nullable=false) private String mimeType;
    @Column(name="size_bytes", nullable=false) private Long sizeBytes;
    @Column(name="storage_key", nullable=false) private String storageKey;
    @Column(name="alt_text") private String altText;
    private String caption;
    @Column(name="usage_count") private Integer usageCount = 0;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="uploaded_by", nullable=false) private CmsUser uploadedBy;
    @Column(name="created_at", nullable=false, updatable=false) private Instant createdAt;
    @Column(name="updated_at", nullable=false) private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = Instant.now();
    }
    @PreUpdate
    public void preUpdate() { updatedAt = Instant.now(); }
}