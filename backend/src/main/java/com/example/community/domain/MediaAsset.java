package com.example.community.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "media_assets")
public class MediaAsset {
    @Id
    private UUID id = UUID.randomUUID();

    @Column(nullable = false)
    private UUID ownerUserId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creation_request_id")
    private CommunityCreationRequest creationRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id")
    private Community community;

    @Column(nullable = false, length = 180)
    private String storageKey;

    @Column(nullable = false, length = 180)
    private String fileName;

    @Column(nullable = false, length = 80)
    private String mimeType;

    @Column(nullable = false)
    private long byteSize;

    @Column(nullable = false)
    private int width;

    @Column(nullable = false)
    private int height;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CommunityTypes.MediaStatus status = CommunityTypes.MediaStatus.TEMPORARY;

    private Instant createdAt;

    protected MediaAsset() {
    }

    public MediaAsset(
            UUID ownerUserId,
            CommunityCreationRequest creationRequest,
            String fileName,
            String mimeType,
            long byteSize,
            int width,
            int height) {
        this.ownerUserId = ownerUserId;
        this.creationRequest = creationRequest;
        this.fileName = fileName;
        this.mimeType = mimeType;
        this.byteSize = byteSize;
        this.width = width;
        this.height = height;
        this.storageKey = "community-requests/" + creationRequest.getId() + "/" + id + "-" + fileName;
    }

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public void attachTo(Community community) {
        this.community = community;
        status = CommunityTypes.MediaStatus.ATTACHED;
    }

    public void reject() {
        status = CommunityTypes.MediaStatus.REJECTED;
    }

    public UUID getId() {
        return id;
    }

    public String getFileName() {
        return fileName;
    }

    public String getMimeType() {
        return mimeType;
    }

    public long getByteSize() {
        return byteSize;
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }

    public CommunityTypes.MediaStatus getStatus() {
        return status;
    }
}
