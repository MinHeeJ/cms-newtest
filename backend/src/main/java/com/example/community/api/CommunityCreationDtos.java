package com.example.community.api;

import com.example.community.application.CommunityCreationService;
import com.example.community.application.CommunityPolicyService;
import com.example.community.application.CommunityReviewService;
import com.example.community.domain.AuditEvent;
import com.example.community.domain.Community;
import com.example.community.domain.CommunityBoard;
import com.example.community.domain.CommunityCreationRequest;
import com.example.community.domain.CommunityRule;
import com.example.community.domain.CommunityTypes;
import com.example.community.domain.FieldValidationError;
import com.example.community.domain.MediaAsset;
import com.example.community.domain.ModeratorInvitation;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class CommunityCreationDtos {
    private CommunityCreationDtos() {
    }

    public record SlugCheckRequest(String slug) {
    }

    public record SlugCheckResponse(String slug, String normalizedSlug, boolean available, String reasonCode, String message) {
        public static SlugCheckResponse from(CommunityCreationService.SlugCheck check) {
            return new SlugCheckResponse(check.slug(), check.normalizedSlug(), check.available(), check.reasonCode(), check.message());
        }
    }

    public record CreateCommunityDraftRequest(String source) {
    }

    public record UpdateCommunityCreationRequest(
            String displayName,
            String slug,
            UUID categoryId,
            String description,
            CommunityTypes.Visibility visibility,
            CommunityTypes.JoinPolicy joinPolicy,
            UUID representativeImageId) {
        public CommunityCreationService.UpdateDraftCommand toCommand() {
            return new CommunityCreationService.UpdateDraftCommand(
                    displayName, slug, categoryId, description, visibility, joinPolicy, representativeImageId);
        }
    }

    public record BoardsRequest(List<BoardInput> boards) {
    }

    public record RulesRequest(List<RuleInput> rules) {
    }

    public record InvitationsRequest(List<ModeratorInvitationInput> invitations) {
    }

    public record MediaMetadataRequest(String fileName, String mimeType, long byteSize, int width, int height) {
    }

    public record MediaAssetResponse(UUID id, String fileName, String mimeType, long byteSize, int width, int height, CommunityTypes.MediaStatus status) {
        public static MediaAssetResponse from(MediaAsset asset) {
            return new MediaAssetResponse(
                    asset.getId(),
                    asset.getFileName(),
                    asset.getMimeType(),
                    asset.getByteSize(),
                    asset.getWidth(),
                    asset.getHeight(),
                    asset.getStatus());
        }
    }

    public record CategoryResponse(UUID id, String name, boolean active, boolean creatable, boolean requiresReview) {
        public static CategoryResponse from(CommunityPolicyService.CategoryOption option) {
            return new CategoryResponse(option.id(), option.name(), option.active(), option.creatable(), option.requiresReview());
        }
    }

    public record CommunityCreationRequestResponse(
            UUID id,
            UUID creatorUserId,
            String displayName,
            String slug,
            UUID categoryId,
            String description,
            CommunityTypes.Visibility visibility,
            CommunityTypes.JoinPolicy joinPolicy,
            CommunityTypes.CreationRequestStatus status,
            CommunityTypes.RiskLevel riskLevel,
            UUID representativeImageId,
            UUID launchedCommunityId,
            List<BoardResponse> boards,
            List<RuleResponse> rules,
            List<ModeratorInvitationResponse> moderatorInvitations,
            List<FieldErrorResponse> validationErrors,
            List<RiskSignalResponse> riskSignals,
            Instant submittedAt,
            Instant createdAt,
            Instant updatedAt) {
        public static CommunityCreationRequestResponse from(CommunityCreationRequest request) {
            return new CommunityCreationRequestResponse(
                    request.getId(),
                    request.getCreatorUserId(),
                    request.getDisplayName(),
                    request.getSlug(),
                    request.getCategoryId(),
                    request.getDescription(),
                    request.getVisibility(),
                    request.getJoinPolicy(),
                    request.getStatus(),
                    request.getRiskLevel(),
                    request.getRepresentativeImageId(),
                    request.getLaunchedCommunityId(),
                    request.getBoards().stream().map(BoardResponse::from).toList(),
                    request.getRules().stream().map(RuleResponse::from).toList(),
                    request.getModeratorInvitations().stream().map(ModeratorInvitationResponse::from).toList(),
                    request.getValidationErrors().stream().map(FieldErrorResponse::from).toList(),
                    request.getRiskSignals().stream().map(RiskSignalResponse::fromCode).toList(),
                    request.getSubmittedAt(),
                    request.getCreatedAt(),
                    request.getUpdatedAt());
        }
    }

    public record SubmitCommunityCreationResponse(
            CommunityCreationService.SubmitResultKind result,
            UUID communityId,
            CommunityCreationRequestResponse request) {
        public static SubmitCommunityCreationResponse from(CommunityCreationService.SubmitResult result) {
            return new SubmitCommunityCreationResponse(result.result(), result.communityId(), CommunityCreationRequestResponse.from(result.request()));
        }
    }

    public record BoardInput(
            String name,
            String description,
            CommunityTypes.BoardType type,
            CommunityTypes.Role postPermission,
            CommunityTypes.Role commentPermission,
            Integer displayOrder) {
        public com.example.community.application.CommunityStructureService.BoardCommand toCommand() {
            return new com.example.community.application.CommunityStructureService.BoardCommand(
                    name, description, type, postPermission, commentPermission, displayOrder);
        }
    }

    public record BoardResponse(
            UUID id,
            String name,
            String description,
            CommunityTypes.BoardType type,
            CommunityTypes.Role postPermission,
            CommunityTypes.Role commentPermission,
            int displayOrder,
            boolean isDefault) {
        public static BoardResponse from(CommunityBoard board) {
            return new BoardResponse(
                    board.getId(),
                    board.getName(),
                    board.getDescription(),
                    board.getType(),
                    board.getPostPermission(),
                    board.getCommentPermission(),
                    board.getDisplayOrder(),
                    board.isDefault());
        }
    }

    public record RuleInput(String title, String body, Integer displayOrder, Boolean required) {
        public com.example.community.application.CommunityStructureService.RuleCommand toCommand() {
            return new com.example.community.application.CommunityStructureService.RuleCommand(title, body, displayOrder, required);
        }
    }

    public record RuleResponse(UUID id, String title, String body, int displayOrder, boolean required) {
        public static RuleResponse from(CommunityRule rule) {
            return new RuleResponse(rule.getId(), rule.getTitle(), rule.getBody(), rule.getDisplayOrder(), rule.isRequiredRule());
        }
    }

    public record ModeratorInvitationInput(String userIdentifier, String message) {
        public com.example.community.application.ModeratorInvitationService.InvitationCommand toCommand() {
            return new com.example.community.application.ModeratorInvitationService.InvitationCommand(userIdentifier, message);
        }
    }

    public record ModeratorInvitationResponse(UUID id, String userIdentifier, String message, CommunityTypes.InvitationStatus status) {
        public static ModeratorInvitationResponse from(ModeratorInvitation invitation) {
            return new ModeratorInvitationResponse(
                    invitation.getId(),
                    invitation.getUserIdentifier(),
                    invitation.getMessage(),
                    invitation.getStatus());
        }
    }

    public record CommunityResponse(
            UUID id,
            String displayName,
            String slug,
            UUID categoryId,
            String description,
            CommunityTypes.Visibility visibility,
            CommunityTypes.JoinPolicy joinPolicy,
            CommunityTypes.CommunityStatus status,
            UUID ownerUserId,
            UUID representativeImageId,
            Instant launchedAt) {
        public static CommunityResponse from(Community community) {
            return new CommunityResponse(
                    community.getId(),
                    community.getDisplayName(),
                    community.getSlug(),
                    community.getCategoryId(),
                    community.getDescription(),
                    community.getVisibility(),
                    community.getJoinPolicy(),
                    community.getStatus(),
                    community.getOwnerUserId(),
                    community.getRepresentativeImageId(),
                    community.getLaunchedAt());
        }
    }

    public record ReviewQueuePage(List<ReviewListItem> items, int page, int size, long totalElements) {
        public static ReviewQueuePage from(CommunityReviewService.ReviewQueue queue) {
            return new ReviewQueuePage(
                    queue.items().stream().map(ReviewListItem::from).toList(),
                    queue.page(),
                    queue.size(),
                    queue.totalElements());
        }
    }

    public record ReviewListItem(
            UUID requestId,
            String displayName,
            String slug,
            UUID categoryId,
            UUID creatorUserId,
            CommunityTypes.RiskLevel riskLevel,
            CommunityTypes.CreationRequestStatus status,
            Instant submittedAt) {
        public static ReviewListItem from(CommunityCreationRequest request) {
            return new ReviewListItem(
                    request.getId(),
                    request.getDisplayName(),
                    request.getSlug(),
                    request.getCategoryId(),
                    request.getCreatorUserId(),
                    request.getRiskLevel(),
                    request.getStatus(),
                    request.getSubmittedAt());
        }
    }

    public record ReviewDetail(CommunityCreationRequestResponse request, List<AuditEventResponse> auditEvents) {
        public static ReviewDetail from(CommunityReviewService.ReviewDetail detail) {
            return new ReviewDetail(
                    CommunityCreationRequestResponse.from(detail.request()),
                    detail.auditEvents().stream().map(AuditEventResponse::from).toList());
        }
    }

    public record ReviewDecisionRequest(
            CommunityTypes.ReviewDecision decision,
            String reasonCode,
            String reasonText,
            Instant expectedRequestUpdatedAt) {
        public CommunityReviewService.DecisionCommand toCommand() {
            return new CommunityReviewService.DecisionCommand(decision, reasonCode, reasonText, expectedRequestUpdatedAt);
        }
    }

    public record ReviewDecisionResponse(UUID communityId, CommunityCreationRequestResponse request) {
        public static ReviewDecisionResponse from(CommunityReviewService.ReviewDecisionResult result) {
            return new ReviewDecisionResponse(result.communityId(), CommunityCreationRequestResponse.from(result.request()));
        }
    }

    public record AuditEventResponse(UUID id, UUID actorUserId, String eventType, String summary, Instant createdAt) {
        public static AuditEventResponse from(AuditEvent event) {
            return new AuditEventResponse(event.getId(), event.getActorUserId(), event.getEventType(), event.getSummary(), event.getCreatedAt());
        }
    }

    public record FieldErrorResponse(String field, String code, String message) {
        public static FieldErrorResponse from(FieldValidationError error) {
            return new FieldErrorResponse(error.getField(), error.getCode(), error.getMessage());
        }
    }

    public record RiskSignalResponse(String code, String severity, String message) {
        public static RiskSignalResponse fromCode(String code) {
            return switch (code) {
                case "IMPERSONATION_PATTERN" -> new RiskSignalResponse(code, "BLOCKING", "사칭 또는 공식 채널 오인 가능성이 있습니다.");
                case "CATEGORY_REQUIRES_REVIEW" -> new RiskSignalResponse(code, "WARNING", "카테고리 정책에 따라 운영자 검수가 필요합니다.");
                default -> new RiskSignalResponse(code, "INFO", "정책 검토 신호가 감지되었습니다.");
            };
        }
    }
}
