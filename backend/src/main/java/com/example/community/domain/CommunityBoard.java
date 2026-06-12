package com.example.community.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "community_boards")
public class CommunityBoard {
    @Id
    private UUID id = UUID.randomUUID();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id")
    private Community community;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creation_request_id")
    private CommunityCreationRequest creationRequest;

    @Column(nullable = false, length = 60)
    private String name;

    @Column(length = 160)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CommunityTypes.BoardType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CommunityTypes.Role postPermission;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CommunityTypes.Role commentPermission;

    @Column(nullable = false)
    private int displayOrder;

    @Column(nullable = false)
    private boolean isDefault;

    protected CommunityBoard() {
    }

    public CommunityBoard(
            String name,
            String description,
            CommunityTypes.BoardType type,
            CommunityTypes.Role postPermission,
            CommunityTypes.Role commentPermission,
            int displayOrder,
            boolean isDefault) {
        this.name = name == null ? "" : name.strip();
        this.description = description == null ? "" : description.strip();
        this.type = type;
        this.postPermission = postPermission;
        this.commentPermission = commentPermission;
        this.displayOrder = displayOrder;
        this.isDefault = isDefault;
    }

    public void setCreationRequest(CommunityCreationRequest creationRequest) {
        this.creationRequest = creationRequest;
    }

    public void setCommunity(Community community) {
        this.community = community;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public CommunityTypes.BoardType getType() {
        return type;
    }

    public CommunityTypes.Role getPostPermission() {
        return postPermission;
    }

    public CommunityTypes.Role getCommentPermission() {
        return commentPermission;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public boolean isDefault() {
        return isDefault;
    }
}
