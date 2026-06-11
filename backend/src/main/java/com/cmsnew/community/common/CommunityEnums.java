package com.cmsnew.community.common;

public final class CommunityEnums {
    private CommunityEnums() {
    }

    public enum Role {
        MEMBER, MODERATOR, ADMIN
    }

    public enum MemberStatus {
        ACTIVE, PENDING_VERIFICATION, SUSPENDED, WITHDRAWN
    }

    public enum BoardVisibility {
        PUBLIC, MEMBERS_ONLY, CLOSED
    }

    public enum PostingPolicy {
        MEMBERS, MODERATORS, ADMINS
    }

    public enum PostStatus {
        PUBLISHED, HIDDEN, DELETED, LOCKED
    }

    public enum CommentStatus {
        PUBLISHED, HIDDEN, DELETED
    }

    public enum ReactionType {
        LIKE, FUN, INSIGHTFUL
    }

    public enum NotificationType {
        REPLY, COMMENT_ON_POST, MODERATION_RESULT, NOTICE
    }

    public enum ReportTargetType {
        POST, COMMENT
    }

    public enum ReportReasonCode {
        SPAM, ABUSE, ILLEGAL, PRIVACY, OTHER
    }

    public enum ReportStatus {
        OPEN, IN_REVIEW, ACTIONED, REJECTED, DUPLICATE
    }

    public enum ModerationTargetType {
        POST, COMMENT, MEMBER, BOARD, REPORT
    }

    public enum ModerationActionType {
        HIDE, RESTORE, DELETE, WARN, SUSPEND, REJECT_REPORT, MARK_DUPLICATE
    }
}
