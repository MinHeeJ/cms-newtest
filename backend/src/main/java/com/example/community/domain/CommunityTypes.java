package com.example.community.domain;

public final class CommunityTypes {
    private CommunityTypes() {
    }

    public enum Visibility {
        PUBLIC,
        PRIVATE,
        INVITE_ONLY
    }

    public enum JoinPolicy {
        OPEN,
        APPROVAL_REQUIRED,
        INVITE_ONLY
    }

    public enum CommunityStatus {
        DRAFT,
        PENDING_REVIEW,
        ACTIVE,
        REJECTED,
        CHANGE_REQUESTED,
        SUSPENDED
    }

    public enum CreationRequestStatus {
        DRAFT,
        VALIDATION_FAILED,
        READY_TO_SUBMIT,
        PENDING_REVIEW,
        APPROVED,
        REJECTED,
        CHANGE_REQUESTED,
        LAUNCHED
    }

    public enum RiskLevel {
        LOW,
        MEDIUM,
        HIGH
    }

    public enum BoardType {
        GENERAL,
        NOTICE,
        QNA,
        MEDIA
    }

    public enum Role {
        OWNER,
        MODERATOR,
        MEMBER
    }

    public enum MembershipStatus {
        ACTIVE,
        INVITED,
        DECLINED,
        REMOVED,
        BANNED
    }

    public enum ReviewDecision {
        APPROVED,
        REJECTED,
        CHANGE_REQUESTED
    }

    public enum MediaStatus {
        TEMPORARY,
        ATTACHED,
        REJECTED,
        DELETED
    }

    public enum InvitationStatus {
        INVITED,
        ACCEPTED,
        DECLINED,
        EXPIRED
    }
}
