package com.cmsnew.community.moderation;

import java.time.OffsetDateTime;

import com.cmsnew.community.common.CommunityEnums.ModerationActionType;
import com.cmsnew.community.common.CommunityEnums.ReportReasonCode;
import com.cmsnew.community.common.CommunityEnums.ReportStatus;
import com.cmsnew.community.common.CommunityEnums.ReportTargetType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class ModerationDtos {
    private ModerationDtos() {
    }

    public record ReportCreateRequest(
            @NotNull(message = "신고 대상을 선택해주세요.") ReportTargetType targetType,
            @NotBlank(message = "신고 대상 식별자가 필요합니다.") String targetId,
            @NotNull(message = "신고 사유를 선택해주세요.") ReportReasonCode reasonCode,
            @Size(max = 1000, message = "상세 설명은 1000자 이하로 입력해주세요.") String description
    ) {
    }

    public record ReportResponse(
            String id,
            String reporterNickname,
            ReportTargetType targetType,
            String targetId,
            ReportReasonCode reasonCode,
            String description,
            ReportStatus status,
            OffsetDateTime createdAt
    ) {
        public static ReportResponse from(Report report) {
            return new ReportResponse(
                    report.getId(),
                    report.getReporter().getNickname(),
                    report.getTargetType(),
                    report.getTargetId(),
                    report.getReasonCode(),
                    report.getDescription(),
                    report.getStatus(),
                    report.getCreatedAt()
            );
        }
    }

    public record ModerationActionRequest(
            @NotNull(message = "운영 조치 유형을 선택해주세요.") ModerationActionType actionType,
            @NotBlank(message = "조치 사유는 필수입니다.") @Size(min = 3, max = 1000, message = "조치 사유는 3자 이상 1000자 이하로 입력해주세요.") String reason,
            Boolean visibleToMember
    ) {
        public boolean memberVisible() {
            return visibleToMember == null || visibleToMember;
        }
    }

    public record ModerationActionResponse(
            String id,
            String actorNickname,
            String reportId,
            ModerationActionType actionType,
            String reason,
            boolean visibleToMember,
            OffsetDateTime createdAt
    ) {
        public static ModerationActionResponse from(ModerationAction action) {
            return new ModerationActionResponse(
                    action.getId(),
                    action.getActor().getNickname(),
                    action.getReport() == null ? null : action.getReport().getId(),
                    action.getActionType(),
                    action.getReason(),
                    action.isVisibleToMember(),
                    action.getCreatedAt()
            );
        }
    }
}
