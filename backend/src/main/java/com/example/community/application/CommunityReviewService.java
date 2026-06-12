package com.example.community.application;

import com.example.community.api.ErrorResponse;
import com.example.community.domain.AuditEvent;
import com.example.community.domain.CommunityCreationRequest;
import com.example.community.domain.CommunityReview;
import com.example.community.domain.CommunityTypes;
import com.example.community.repository.CommunityCreationRepositories;
import com.example.community.support.CommunityCreationMetrics;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommunityReviewService {
    private final CommunityCreationRepositories repositories;
    private final CommunityCreationService creationService;
    private final CommunityLaunchService launchService;
    private final CommunityCreationNotificationService notificationService;
    private final CommunityCreationMetrics metrics;
    private final Clock clock;

    public CommunityReviewService(
            CommunityCreationRepositories repositories,
            CommunityCreationService creationService,
            CommunityLaunchService launchService,
            CommunityCreationNotificationService notificationService,
            CommunityCreationMetrics metrics,
            Clock clock) {
        this.repositories = repositories;
        this.creationService = creationService;
        this.launchService = launchService;
        this.notificationService = notificationService;
        this.metrics = metrics;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public ReviewQueue list(
            CommunityTypes.CreationRequestStatus status,
            CommunityTypes.RiskLevel riskLevel,
            UUID categoryId,
            int page,
            int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, Math.min(100, size));
        List<CommunityCreationRequest> items = repositories.findReviewQueue(status, riskLevel, categoryId, safePage, safeSize);
        long total = repositories.countReviewQueue(status, riskLevel, categoryId);
        return new ReviewQueue(items, safePage, safeSize, total);
    }

    @Transactional(readOnly = true)
    public ReviewDetail detail(UUID requestId) {
        CommunityCreationRequest request = creationService.requireRequest(requestId);
        List<AuditEvent> auditEvents = repositories.findAuditEvents("COMMUNITY_CREATION_REQUEST", requestId);
        return new ReviewDetail(request, auditEvents);
    }

    @Transactional
    public ReviewDecisionResult decide(UUID operatorUserId, UUID requestId, DecisionCommand command) {
        CommunityCreationRequest request = creationService.requireRequest(requestId);
        if (request.getUpdatedAt() != null && command.expectedRequestUpdatedAt() != null
                && !request.getUpdatedAt().equals(command.expectedRequestUpdatedAt())) {
            throw new ErrorResponse.ApiException(HttpStatus.CONFLICT, "REQUEST_CHANGED", "검수 중 요청이 변경되었습니다. 다시 확인해 주세요.");
        }
        if (command.reasonCode() == null || command.reasonCode().isBlank()
                || command.reasonText() == null || command.reasonText().strip().length() < 5) {
            throw new ErrorResponse.ApiException(HttpStatus.BAD_REQUEST, "REASON_REQUIRED", "검수 결정 사유를 입력해 주세요.");
        }
        if (request.getStatus() != CommunityTypes.CreationRequestStatus.PENDING_REVIEW
                && request.getStatus() != CommunityTypes.CreationRequestStatus.CHANGE_REQUESTED) {
            throw new ErrorResponse.ApiException(HttpStatus.CONFLICT, "NOT_REVIEWABLE", "현재 검수 결정을 등록할 수 없는 상태입니다.");
        }

        CommunityReview review = new CommunityReview(
                request,
                operatorUserId,
                command.decision(),
                command.reasonCode(),
                command.reasonText(),
                Instant.now(clock));
        repositories.persist(review);

        UUID communityId = null;
        if (command.decision() == CommunityTypes.ReviewDecision.APPROVED) {
            request.markApproved();
            communityId = launchService.launch(request, request.getIdempotencyKey() == null ? "operator-approved-" + request.getId() : request.getIdempotencyKey());
            notificationService.notifyCreator(request, "CREATION_APPROVED", "커뮤니티 개설 요청이 승인되었습니다.");
        } else if (command.decision() == CommunityTypes.ReviewDecision.REJECTED) {
            request.markRejected();
            notificationService.notifyCreator(request, "CREATION_REJECTED", command.reasonText());
        } else {
            request.markChangeRequested();
            notificationService.notifyCreator(request, "CREATION_CHANGE_REQUESTED", command.reasonText());
        }
        metrics.recordRequestStatus(request.getStatus());
        notificationService.notifyOperator(operatorUserId, request, "REVIEW_DECISION_RECORDED", "운영자 검수 결정이 기록되었습니다.");
        return new ReviewDecisionResult(communityId, request);
    }

    public record ReviewQueue(List<CommunityCreationRequest> items, int page, int size, long totalElements) {
    }

    public record ReviewDetail(CommunityCreationRequest request, List<AuditEvent> auditEvents) {
    }

    public record DecisionCommand(
            CommunityTypes.ReviewDecision decision,
            String reasonCode,
            String reasonText,
            Instant expectedRequestUpdatedAt) {
    }

    public record ReviewDecisionResult(UUID communityId, CommunityCreationRequest request) {
    }
}
