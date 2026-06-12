package com.example.community.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "community_reviews")
public class CommunityReview {
    @Id
    private UUID id = UUID.randomUUID();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creation_request_id", nullable = false)
    private CommunityCreationRequest creationRequest;

    @Column(nullable = false)
    private UUID reviewerUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CommunityTypes.ReviewDecision decision;

    @Column(nullable = false, length = 60)
    private String reasonCode;

    @Column(nullable = false, length = 1200)
    private String reasonText;

    @Column(nullable = false)
    private Instant decidedAt;

    protected CommunityReview() {
    }

    public CommunityReview(
            CommunityCreationRequest creationRequest,
            UUID reviewerUserId,
            CommunityTypes.ReviewDecision decision,
            String reasonCode,
            String reasonText,
            Instant decidedAt) {
        this.creationRequest = creationRequest;
        this.reviewerUserId = reviewerUserId;
        this.decision = decision;
        this.reasonCode = reasonCode;
        this.reasonText = reasonText;
        this.decidedAt = decidedAt;
    }
}
