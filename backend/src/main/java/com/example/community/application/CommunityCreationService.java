package com.example.community.application;

import com.example.community.api.ErrorResponse;
import com.example.community.domain.CommunityCreationRequest;
import com.example.community.domain.CommunityTypes;
import com.example.community.domain.FieldValidationError;
import com.example.community.domain.MediaAsset;
import com.example.community.repository.CommunityCreationRepositories;
import com.example.community.support.CommunityCreationMetrics;
import com.example.community.support.IdempotencyService;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommunityCreationService {
    private final CommunityCreationRepositories repositories;
    private final CommunitySlugService slugService;
    private final CommunityPolicyService policyService;
    private final CommunityStructureService structureService;
    private final CommunityMediaService mediaService;
    private final ModeratorInvitationService invitationService;
    private final CommunityLaunchService launchService;
    private final IdempotencyService idempotencyService;
    private final AuditEventPublisher auditEventPublisher;
    private final CommunityCreationNotificationService notificationService;
    private final CommunityCreationMetrics metrics;
    private final Clock clock;

    public CommunityCreationService(
            CommunityCreationRepositories repositories,
            CommunitySlugService slugService,
            CommunityPolicyService policyService,
            CommunityStructureService structureService,
            CommunityMediaService mediaService,
            ModeratorInvitationService invitationService,
            CommunityLaunchService launchService,
            IdempotencyService idempotencyService,
            AuditEventPublisher auditEventPublisher,
            CommunityCreationNotificationService notificationService,
            CommunityCreationMetrics metrics,
            Clock clock) {
        this.repositories = repositories;
        this.slugService = slugService;
        this.policyService = policyService;
        this.structureService = structureService;
        this.mediaService = mediaService;
        this.invitationService = invitationService;
        this.launchService = launchService;
        this.idempotencyService = idempotencyService;
        this.auditEventPublisher = auditEventPublisher;
        this.notificationService = notificationService;
        this.metrics = metrics;
        this.clock = clock;
    }

    public SlugCheck checkSlug(String slug) {
        String normalized = slugService.normalizeSlug(slug);
        if (!slugService.isSlugFormatValid(normalized)) {
            return new SlugCheck(slug, normalized, false, "INVALID_FORMAT", "주소는 영문 소문자, 숫자, 하이픈으로 3~40자 입력해야 합니다.");
        }
        if (slugService.isReservedSlug(normalized)) {
            return new SlugCheck(slug, normalized, false, "RESERVED_SLUG", "운영 용도로 예약된 주소입니다.");
        }
        if (!slugService.isAvailable(normalized)) {
            return new SlugCheck(slug, normalized, false, "SLUG_TAKEN", "이미 사용 중인 주소입니다.");
        }
        return new SlugCheck(slug, normalized, true, null, null);
    }

    @Transactional
    public CommunityCreationRequest createDraft(UUID creatorUserId, String source) {
        CommunityCreationRequest request = new CommunityCreationRequest(creatorUserId, source);
        repositories.persist(request);
        auditEventPublisher.publish(
                creatorUserId,
                "COMMUNITY_CREATION_REQUEST",
                request.getId(),
                "CREATION_DRAFT_STARTED",
                "커뮤니티 개설 초안이 생성되었습니다.");
        return request;
    }

    @Transactional(readOnly = true)
    public CommunityCreationRequest getRequest(UUID requesterUserId, boolean operator, UUID requestId) {
        CommunityCreationRequest request = requireRequest(requestId);
        requireOwnerOrOperator(requesterUserId, operator, request);
        return request;
    }

    @Transactional
    public CommunityCreationRequest updateDraft(UUID requesterUserId, UUID requestId, UpdateDraftCommand command) {
        CommunityCreationRequest request = requireRequest(requestId);
        requireOwner(requesterUserId, request);
        String normalizedSlug = command.slug() == null ? null : slugService.normalizeSlug(command.slug());
        String normalizedName = command.displayName() == null ? null : slugService.normalizeName(command.displayName());
        request.updateIdentity(
                command.displayName(),
                normalizedName,
                normalizedSlug,
                command.categoryId(),
                command.description(),
                command.visibility(),
                command.joinPolicy(),
                command.representativeImageId());
        auditEventPublisher.publish(
                requesterUserId,
                "COMMUNITY_CREATION_REQUEST",
                request.getId(),
                "CREATION_DRAFT_UPDATED",
                "커뮤니티 개설 초안이 저장되었습니다.");
        return request;
    }

    @Transactional
    public CommunityCreationRequest replaceBoards(UUID requesterUserId, UUID requestId, List<CommunityStructureService.BoardCommand> boards) {
        CommunityCreationRequest request = requireRequest(requestId);
        requireOwner(requesterUserId, request);
        structureService.replaceBoards(request, boards);
        return request;
    }

    @Transactional
    public CommunityCreationRequest replaceRules(UUID requesterUserId, UUID requestId, List<CommunityStructureService.RuleCommand> rules) {
        CommunityCreationRequest request = requireRequest(requestId);
        requireOwner(requesterUserId, request);
        structureService.replaceRules(request, rules);
        return request;
    }

    @Transactional
    public CommunityCreationRequest replaceModeratorInvitations(
            UUID requesterUserId,
            UUID requestId,
            List<ModeratorInvitationService.InvitationCommand> invitations) {
        CommunityCreationRequest request = requireRequest(requestId);
        requireOwner(requesterUserId, request);
        invitationService.replaceInvitations(request, invitations);
        return request;
    }

    @Transactional
    public MediaAsset attachMedia(UUID requesterUserId, UUID requestId, CommunityMediaService.MediaCommand command) {
        CommunityCreationRequest request = requireRequest(requestId);
        requireOwner(requesterUserId, request);
        MediaAsset asset = mediaService.attachMetadata(requesterUserId, request, command);
        auditEventPublisher.publish(
                requesterUserId,
                "MEDIA_ASSET",
                asset.getId(),
                "MEDIA_METADATA_ATTACHED",
                "대표 이미지 메타데이터가 연결되었습니다.");
        return asset;
    }

    @Transactional
    public SubmitResult submit(UUID requesterUserId, UUID requestId, String idempotencyKey) {
        idempotencyService.requireValidKey(idempotencyKey);
        CommunityCreationRequest request = requireRequest(requestId);
        requireOwner(requesterUserId, request);

        if (idempotencyService.isReplay(request, idempotencyKey)) {
            return SubmitResult.replayed(resultFromStatus(request.getStatus()), request.getLaunchedCommunityId(), request);
        }
        idempotencyService.rejectConflictingReplay(request, idempotencyKey);

        CommunityPolicyService.PolicyResult policy = policyService.evaluate(request);
        List<FieldValidationError> errors = policy.errors();
        if (request.getSlug() != null
                && slugService.isSlugFormatValid(request.getSlug())
                && !slugService.isReservedSlug(request.getSlug())
                && !slugService.isAvailable(request.getSlug(), request.getId())) {
            errors = new java.util.ArrayList<>(errors);
            errors.add(new FieldValidationError("slug", "SLUG_TAKEN", "이미 사용 중인 주소입니다."));
        }

        request.applyValidation(errors, policy.riskSignalCodes(), policy.riskLevel());
        if (!errors.isEmpty()) {
            auditEventPublisher.publish(
                    requesterUserId,
                    "COMMUNITY_CREATION_REQUEST",
                    request.getId(),
                    "CREATION_VALIDATION_FAILED",
                    "커뮤니티 개설 제출 검증에 실패했습니다.");
            return SubmitResult.created(SubmitResultKind.VALIDATION_FAILED, null, request);
        }

        request.markReadyToSubmit();
        if (policy.requiresReview()) {
            request.markPendingReview(idempotencyKey, Instant.now(clock));
            metrics.recordRequestStatus(request.getStatus());
            notificationService.notifyCreator(request, "CREATION_REVIEW_PENDING", "커뮤니티 개설 요청이 운영자 검수 대기 상태가 되었습니다.");
            return SubmitResult.created(SubmitResultKind.PENDING_REVIEW, null, request);
        }

        UUID communityId = launchService.launch(request, idempotencyKey);
        metrics.recordRequestStatus(request.getStatus());
        notificationService.notifyCreator(request, "CREATION_LAUNCHED", "커뮤니티가 개설되었습니다.");
        return SubmitResult.created(SubmitResultKind.LAUNCHED, communityId, request);
    }

    @Transactional(readOnly = true)
    public com.example.community.domain.Community getCommunity(UUID communityId) {
        return repositories.findCommunity(communityId)
                .orElseThrow(() -> new ErrorResponse.ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "커뮤니티를 찾을 수 없습니다."));
    }

    CommunityCreationRequest requireRequest(UUID requestId) {
        return repositories.findRequest(requestId)
                .orElseThrow(() -> new ErrorResponse.ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "개설 요청을 찾을 수 없습니다."));
    }

    private void requireOwner(UUID requesterUserId, CommunityCreationRequest request) {
        if (!request.getCreatorUserId().equals(requesterUserId)) {
            throw new ErrorResponse.ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "이 개설 요청을 수정할 권한이 없습니다.");
        }
    }

    private void requireOwnerOrOperator(UUID requesterUserId, boolean operator, CommunityCreationRequest request) {
        if (!operator && !request.getCreatorUserId().equals(requesterUserId)) {
            throw new ErrorResponse.ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "이 개설 요청을 조회할 권한이 없습니다.");
        }
    }

    private SubmitResultKind resultFromStatus(CommunityTypes.CreationRequestStatus status) {
        if (status == CommunityTypes.CreationRequestStatus.LAUNCHED || status == CommunityTypes.CreationRequestStatus.APPROVED) {
            return SubmitResultKind.LAUNCHED;
        }
        if (status == CommunityTypes.CreationRequestStatus.PENDING_REVIEW) {
            return SubmitResultKind.PENDING_REVIEW;
        }
        return SubmitResultKind.VALIDATION_FAILED;
    }

    public record SlugCheck(String slug, String normalizedSlug, boolean available, String reasonCode, String message) {
    }

    public record UpdateDraftCommand(
            String displayName,
            String slug,
            UUID categoryId,
            String description,
            CommunityTypes.Visibility visibility,
            CommunityTypes.JoinPolicy joinPolicy,
            UUID representativeImageId) {
    }

    public enum SubmitResultKind {
        LAUNCHED,
        PENDING_REVIEW,
        VALIDATION_FAILED
    }

    public record SubmitResult(SubmitResultKind result, UUID communityId, CommunityCreationRequest request, boolean replayed) {
        static SubmitResult created(SubmitResultKind result, UUID communityId, CommunityCreationRequest request) {
            return new SubmitResult(result, communityId, request, false);
        }

        static SubmitResult replayed(SubmitResultKind result, UUID communityId, CommunityCreationRequest request) {
            return new SubmitResult(result, communityId, request, true);
        }
    }
}
