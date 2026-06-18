package com.cms.entity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
@Entity @Table(name="cms_navigation_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NavigationItem {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="menu_id", nullable=false) private NavigationMenu menu;
    @Column(nullable=false) private String label;
    @Column(name="target_type", nullable=false) private String targetType;
    @Column(name="target_id") private UUID targetId;
    private String url;
    @Column(name="parent_id") private UUID parentId;
    @Column(name="sort_order") private Integer sortOrder = 0;
    @Column(name="is_visible") private Boolean isVisible = true;
}
