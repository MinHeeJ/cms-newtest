package com.cms.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.*;
@Entity @Table(name="cms_content_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContentItem {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(name="content_type", nullable=false) private String contentType;
    @Column(nullable=false, length=160) private String title;
    @Column(nullable=false, unique=true) private String slug;
    @Column(name="status", nullable=false) private String status = "DRAFT";
    @Column(nullable=false) private String summary = "";
    @Column(name="markdown_body", nullable=false, columnDefinition="TEXT") private String markdownBody;
    @Column(name="visibility", nullable=false) private String visibility = "PUBLIC";
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="featured_media_id") private MediaAsset featuredMedia;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="author_id", nullable=false) private CmsUser author;
    @Column(name="revisions_count") private Integer revisionsCount = 0;
    @Column(name="published_at") private Instant publishedAt;
    @Column(name="scheduled_at") private Instant scheduledAt;
    @Column(name="archived_at") private Instant archivedAt;
    @Column(name="created_at", updatable=false) private Instant createdAt = Instant.now();
    @Column(name="updated_at") private Instant updatedAt = Instant.now();
    @ManyToMany(fetch=FetchType.LAZY)
    @JoinTable(name="cms_content_categories", joinColumns=@JoinColumn(name="content_id"), inverseJoinColumns=@JoinColumn(name="term_id"))
    private List<TaxonomyTerm> categories = new ArrayList<>();
    @ManyToMany(fetch=FetchType.LAZY)
    @JoinTable(name="cms_content_tags", joinColumns=@JoinColumn(name="content_id"), inverseJoinColumns=@JoinColumn(name="term_id"))
    private List<TaxonomyTerm> tags = new ArrayList<>();
}
