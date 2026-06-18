package com.cms.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="cms_taxonomy_terms")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TaxonomyTerm {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(name="type", nullable=false) private String type;
    @Column(nullable=false) private String name;
    @Column(nullable=false, unique=true) private String slug;
    private String description;
    @Column(name="parent_id") private UUID parentId;
    @Column(name="sort_order") private Integer sortOrder;
    @Column(name="created_at", updatable=false) private Instant createdAt = Instant.now();
    @Column(name="updated_at") private Instant updatedAt = Instant.now();
}
