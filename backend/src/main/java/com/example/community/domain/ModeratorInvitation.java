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
@Table(name = "moderator_invitations")
public class ModeratorInvitation {
    @Id
    private UUID id = UUID.randomUUID();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creation_request_id", nullable = false)
    private CommunityCreationRequest creationRequest;

    @Column(nullable = false, length = 120)
    private String userIdentifier;

    @Column(length = 240)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CommunityTypes.InvitationStatus status = CommunityTypes.InvitationStatus.INVITED;

    private Instant createdAt;

    protected ModeratorInvitation() {
    }

    public ModeratorInvitation(String userIdentifier, String message) {
        this.userIdentifier = userIdentifier == null ? "" : userIdentifier.strip();
        this.message = message == null ? "" : message.strip();
    }

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public void setCreationRequest(CommunityCreationRequest creationRequest) {
        this.creationRequest = creationRequest;
    }

    public UUID getId() {
        return id;
    }

    public String getUserIdentifier() {
        return userIdentifier;
    }

    public String getMessage() {
        return message;
    }

    public CommunityTypes.InvitationStatus getStatus() {
        return status;
    }
}
