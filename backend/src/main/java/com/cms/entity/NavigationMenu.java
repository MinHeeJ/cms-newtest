package com.cms.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.*;
@Entity @Table(name="cms_navigation_menus")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NavigationMenu {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(nullable=false, unique=true, length=100) private String key;
    @Column(nullable=false) private String label;
    @Column(name="is_active") private Boolean isActive = true;
    @OneToMany(mappedBy="menu", cascade=CascadeType.ALL, orphanRemoval=true, fetch=FetchType.LAZY)
    @OrderBy("sortOrder ASC")
    private List<NavigationItem> items = new ArrayList<>();
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