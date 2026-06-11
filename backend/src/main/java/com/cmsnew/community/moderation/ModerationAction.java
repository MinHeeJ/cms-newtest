package com.cmsnew.community.moderation;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.cmsnew.community.common.CommunityEnums.ModerationActionType;
import com.cmsnew.community.common.CommunityEnums.ModerationTargetType;
import com.cmsnew.community.member.Member;

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

@Entity
@Table(name = "moderation_actions")
public class ModerationAction {
    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "actor_id")
    private Member actor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    private Report report;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ModerationTargetType targetType;

    @Column(nullable = false)
    private String targetId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ModerationActionType actionType;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private boolean visibleToMember = true;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    protected ModerationAction() {
    }

    public ModerationAction(Member actor, Report report, ModerationTargetType targetType, String targetId,
                            ModerationActionType actionType, String reason, boolean visibleToMember) {
        this.actor = actor;
        this.report = report;
        this.targetType = targetType;
        this.targetId = targetId;
        this.actionType = actionType;
        this.reason = reason;
        this.visibleToMember = visibleToMember;
    }

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        createdAt = OffsetDateTime.now();
    }

    public String getId() {
        return id;
    }

    public Member getActor() {
        return actor;
    }

    public Report getReport() {
        return report;
    }

    public ModerationActionType getActionType() {
        return actionType;
    }

    public String getReason() {
        return reason;
    }

    public boolean isVisibleToMember() {
        return visibleToMember;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
