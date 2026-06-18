package com.cms.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.*;
@Entity @Table(name="cms_users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CmsUser {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(nullable=false, unique=true) private String email;
    @Column(name="display_name", nullable=false) private String displayName;
    @Column(name="status") private String status = "ACTIVE";
    @Column(name="last_login_at") private Instant lastLoginAt;
    @Column(name="created_at", nullable=false, updatable=false) private Instant createdAt;
    @Column(name="updated_at", nullable=false) private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = Instant.now();
    }
    @PreUpdate
    public void preUpdate() { updatedAt = Instant.now(); }

    @ElementCollection(fetch=FetchType.EAGER)
    @CollectionTable(name="cms_user_roles", joinColumns=@JoinColumn(name="user_id"))
    @Column(name="role")
    private Set<String> roles = new HashSet<>();
}