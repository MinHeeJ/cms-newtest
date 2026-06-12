package com.example.community.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "communities")
public class Community {
    @Id
    private UUID id = UUID.randomUUID();

    @Column(nullable = false, length = 80)
    private String displayName;

    @Column(nullable = false, length = 120)
    private String normalizedName;

    @Column(nullable = false, unique = true, length = 40)
    private String slug;

    @Column(nullable = false)
    private UUID categoryId;

    @Column(nullable = false, length = 300)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CommunityTypes.Visibility visibility;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CommunityTypes.JoinPolicy joinPolicy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CommunityTypes.CommunityStatus status = CommunityTypes.CommunityStatus.ACTIVE;

    @Column(nullable = false)
    private UUID ownerUserId;

    private UUID representativeImageId;
    private Instant launchedAt;
    private Instant createdAt;
    private Instant updatedAt;

    protected Community() {
    }

    public Community(
            String displayName,
            String normalizedName,
            String slug,
            UUID categoryId,
            String description,
            CommunityTypes.Visibility visibility,
            CommunityTypes.JoinPolicy joinPolicy,
            UUID ownerUserId,
            UUID representativeImageId,
            Instant launchedAt) {
        this.displayName = displayName;
        this.normalizedName = normalizedName;
        this.slug = slug;
        this.categoryId = categoryId;
        this.description = description;
        this.visibility = visibility;
        this.joinPolicy = joinPolicy;
        this.ownerUserId = ownerUserId;
        this.representativeImageId = representativeImageId;
        this.launchedAt = launchedAt;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getNormalizedName() {
        return normalizedName;
    }

    public String getSlug() {
        return slug;
    }

    public UUID getCategoryId() {
        return categoryId;
    }

    public String getDescription() {
        return description;
    }

    public CommunityTypes.Visibility getVisibility() {
        return visibility;
    }

    public CommunityTypes.JoinPolicy getJoinPolicy() {
        return joinPolicy;
    }

    public CommunityTypes.CommunityStatus getStatus() {
        return status;
    }

    public UUID getOwnerUserId() {
        return ownerUserId;
    }

    public UUID getRepresentativeImageId() {
        return representativeImageId;
    }

    public Instant getLaunchedAt() {
        return launchedAt;
    }
}
