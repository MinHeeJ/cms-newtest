package com.example.community.api;

import com.example.community.application.CommunityReviewService;
import com.example.community.domain.CommunityTypes;
import com.example.community.support.SecurityUserContext;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/community-creation/reviews")
public class CommunityReviewController {
    private final CommunityReviewService reviewService;
    private final SecurityUserContext userContext;

    public CommunityReviewController(CommunityReviewService reviewService, SecurityUserContext userContext) {
        this.reviewService = reviewService;
        this.userContext = userContext;
    }

    @GetMapping
    public CommunityCreationDtos.ReviewQueuePage list(
            @RequestParam(required = false) CommunityTypes.CreationRequestStatus status,
            @RequestParam(required = false) CommunityTypes.RiskLevel riskLevel,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        userContext.requireOperator();
        return CommunityCreationDtos.ReviewQueuePage.from(reviewService.list(status, riskLevel, categoryId, page, size));
    }

    @GetMapping("/{requestId}")
    public CommunityCreationDtos.ReviewDetail detail(@PathVariable UUID requestId) {
        userContext.requireOperator();
        return CommunityCreationDtos.ReviewDetail.from(reviewService.detail(requestId));
    }

    @PostMapping("/{requestId}/decision")
    public CommunityCreationDtos.ReviewDecisionResponse decide(
            @PathVariable UUID requestId,
            @RequestBody CommunityCreationDtos.ReviewDecisionRequest request) {
        SecurityUserContext.CurrentUser operator = userContext.requireOperator();
        return CommunityCreationDtos.ReviewDecisionResponse.from(
                reviewService.decide(operator.userId(), requestId, request.toCommand()));
    }
}
