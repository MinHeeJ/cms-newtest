package com.example.community.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.CascadeType;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "community_creation_requests")
public class CommunityCreationRequest {
    @Id
    private UUID id = UUID.randomUUID();

    @Column(nullable = false)
    private UUID creatorUserId;

    @Column(length = 128)
    private String idempotencyKey;

    @Column(length = 80)
    private String displayName;

    @Column(length = 120)
    private String normalizedName;

    @Column(length = 40)
    private String slug;

    private UUID categoryId;

    @Column(length = 300)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private CommunityTypes.Visibility visibility = CommunityTypes.Visibility.PUBLIC;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private CommunityTypes.JoinPolicy joinPolicy = CommunityTypes.JoinPolicy.OPEN;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CommunityTypes.CreationRequestStatus status = CommunityTypes.CreationRequestStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CommunityTypes.RiskLevel riskLevel = CommunityTypes.RiskLevel.LOW;

    @Column(length = 40)
    private String source = "HEADER_BUTTON";

    private UUID representativeImageId;
    private UUID launchedCommunityId;
    private Instant submittedAt;
    private Instant createdAt;
    private Instant updatedAt;

    @ElementCollection
    @CollectionTable(name = "community_request_risk_signals", joinColumns = @JoinColumn(name = "request_id"))
    @Column(name = "signal_code", nullable = false, length = 80)
    private Set<String> riskSignals = new LinkedHashSet<>();

    @ElementCollection
    @CollectionTable(name = "community_request_validation_errors", joinColumns = @JoinColumn(name = "request_id"))
    private List<FieldValidationError> validationErrors = new ArrayList<>();

    @OneToMany(mappedBy = "creationRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<CommunityBoard> boards = new ArrayList<>();

    @OneToMany(mappedBy = "creationRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<CommunityRule> rules = new ArrayList<>();

    @OneToMany(mappedBy = "creationRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<ModeratorInvitation> moderatorInvitations = new ArrayList<>();

    protected CommunityCreationRequest() {
    }

    public CommunityCreationRequest(UUID creatorUserId, String source) {
        this.creatorUserId = creatorUserId;
        if (source != null && !source.isBlank()) {
            this.source = source;
        }
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

    public void updateIdentity(
            String displayName,
            String normalizedName,
            String slug,
            UUID categoryId,
            String description,
            CommunityTypes.Visibility visibility,
            CommunityTypes.JoinPolicy joinPolicy,
            UUID representativeImageId) {
        if (displayName != null) {
            this.displayName = displayName.strip();
            this.normalizedName = normalizedName;
        }
        if (slug != null) {
            this.slug = slug;
        }
        if (categoryId != null) {
            this.categoryId = categoryId;
        }
        if (description != null) {
            this.description = description.strip();
        }
        if (visibility != null) {
            this.visibility = visibility;
        }
        if (joinPolicy != null) {
            this.joinPolicy = joinPolicy;
        }
        if (representativeImageId != null) {
            this.representativeImageId = representativeImageId;
        }
        if (status == CommunityTypes.CreationRequestStatus.PENDING_REVIEW) {
            status = CommunityTypes.CreationRequestStatus.CHANGE_REQUESTED;
        }
    }

    public void replaceBoards(List<CommunityBoard> replacement) {
        boards.clear();
        replacement.forEach(this::addBoard);
    }

    public void addBoard(CommunityBoard board) {
        board.setCreationRequest(this);
        boards.add(board);
    }

    public void replaceRules(List<CommunityRule> replacement) {
        rules.clear();
        replacement.forEach(this::addRule);
    }

    public void addRule(CommunityRule rule) {
        rule.setCreationRequest(this);
        rules.add(rule);
    }

    public void replaceModeratorInvitations(List<ModeratorInvitation> replacement) {
        moderatorInvitations.clear();
        replacement.forEach(this::addModeratorInvitation);
    }

    public void addModeratorInvitation(ModeratorInvitation invitation) {
        invitation.setCreationRequest(this);
        moderatorInvitations.add(invitation);
    }

    public void applyValidation(
            List<FieldValidationError> errors,
            Set<String> riskSignalCodes,
            CommunityTypes.RiskLevel riskLevel) {
        validationErrors.clear();
        validationErrors.addAll(errors);
        riskSignals.clear();
        riskSignals.addAll(riskSignalCodes);
        this.riskLevel = riskLevel;
        if (!errors.isEmpty()) {
            status = CommunityTypes.CreationRequestStatus.VALIDATION_FAILED;
        }
    }

    public void markReadyToSubmit() {
        status = CommunityTypes.CreationRequestStatus.READY_TO_SUBMIT;
    }

    public void markPendingReview(String idempotencyKey, Instant submittedAt) {
        this.idempotencyKey = idempotencyKey;
        this.submittedAt = submittedAt;
        status = CommunityTypes.CreationRequestStatus.PENDING_REVIEW;
    }

    public void markApproved() {
        status = CommunityTypes.CreationRequestStatus.APPROVED;
    }

    public void markRejected() {
        status = CommunityTypes.CreationRequestStatus.REJECTED;
    }

    public void markChangeRequested() {
        status = CommunityTypes.CreationRequestStatus.CHANGE_REQUESTED;
    }

    public void markLaunched(UUID communityId, String idempotencyKey, Instant submittedAt) {
        this.launchedCommunityId = communityId;
        this.idempotencyKey = idempotencyKey;
        if (this.submittedAt == null) {
            this.submittedAt = submittedAt;
        }
        status = CommunityTypes.CreationRequestStatus.LAUNCHED;
    }

    public UUID getId() {
        return id;
    }

    public UUID getCreatorUserId() {
        return creatorUserId;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
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

    public CommunityTypes.CreationRequestStatus getStatus() {
        return status;
    }

    public CommunityTypes.RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public UUID getRepresentativeImageId() {
        return representativeImageId;
    }

    public UUID getLaunchedCommunityId() {
        return launchedCommunityId;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Set<String> getRiskSignals() {
        return riskSignals;
    }

    public List<FieldValidationError> getValidationErrors() {
        return validationErrors;
    }

    public List<CommunityBoard> getBoards() {
        return boards;
    }

    public List<CommunityRule> getRules() {
        return rules;
    }

    public List<ModeratorInvitation> getModeratorInvitations() {
        return moderatorInvitations;
    }
}
