package com.example.community.api;

import com.example.community.application.CommunityCreationService;
import com.example.community.application.CommunityMediaService;
import com.example.community.application.CommunityPolicyService;
import com.example.community.domain.CommunityCreationRequest;
import com.example.community.domain.MediaAsset;
import com.example.community.support.SecurityUserContext;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/community-creation")
public class CommunityCreationController {
    private final CommunityCreationService creationService;
    private final CommunityPolicyService policyService;
    private final SecurityUserContext userContext;

    public CommunityCreationController(
            CommunityCreationService creationService,
            CommunityPolicyService policyService,
            SecurityUserContext userContext) {
        this.creationService = creationService;
        this.policyService = policyService;
        this.userContext = userContext;
    }

    @GetMapping("/categories")
    public java.util.List<CommunityCreationDtos.CategoryResponse> categories() {
        return policyService.creatableCategories().stream()
                .map(CommunityCreationDtos.CategoryResponse::from)
                .toList();
    }

    @PostMapping("/slug-check")
    public CommunityCreationDtos.SlugCheckResponse checkSlug(@RequestBody CommunityCreationDtos.SlugCheckRequest request) {
        return CommunityCreationDtos.SlugCheckResponse.from(creationService.checkSlug(request.slug()));
    }

    @PostMapping("/requests")
    public ResponseEntity<CommunityCreationDtos.CommunityCreationRequestResponse> createRequest(
            @RequestBody(required = false) CommunityCreationDtos.CreateCommunityDraftRequest request) {
        SecurityUserContext.CurrentUser currentUser = userContext.currentUser();
        CommunityCreationRequest created = creationService.createDraft(
                currentUser.userId(),
                request == null ? "HEADER_BUTTON" : request.source());
        return ResponseEntity.created(URI.create("/api/v1/community-creation/requests/" + created.getId()))
                .body(CommunityCreationDtos.CommunityCreationRequestResponse.from(created));
    }

    @GetMapping("/requests/{requestId}")
    public CommunityCreationDtos.CommunityCreationRequestResponse getRequest(@PathVariable UUID requestId) {
        SecurityUserContext.CurrentUser currentUser = userContext.currentUser();
        return CommunityCreationDtos.CommunityCreationRequestResponse.from(
                creationService.getRequest(currentUser.userId(), currentUser.isOperator(), requestId));
    }

    @PatchMapping("/requests/{requestId}")
    public CommunityCreationDtos.CommunityCreationRequestResponse updateRequest(
            @PathVariable UUID requestId,
            @RequestBody CommunityCreationDtos.UpdateCommunityCreationRequest request) {
        SecurityUserContext.CurrentUser currentUser = userContext.currentUser();
        return CommunityCreationDtos.CommunityCreationRequestResponse.from(
                creationService.updateDraft(currentUser.userId(), requestId, request.toCommand()));
    }

    @PutMapping("/requests/{requestId}/boards")
    public CommunityCreationDtos.CommunityCreationRequestResponse replaceBoards(
            @PathVariable UUID requestId,
            @RequestBody CommunityCreationDtos.BoardsRequest request) {
        SecurityUserContext.CurrentUser currentUser = userContext.currentUser();
        return CommunityCreationDtos.CommunityCreationRequestResponse.from(creationService.replaceBoards(
                currentUser.userId(),
                requestId,
                (request.boards() == null ? List.<CommunityCreationDtos.BoardInput>of() : request.boards())
                        .stream()
                        .map(CommunityCreationDtos.BoardInput::toCommand)
                        .toList()));
    }

    @PutMapping("/requests/{requestId}/rules")
    public CommunityCreationDtos.CommunityCreationRequestResponse replaceRules(
            @PathVariable UUID requestId,
            @RequestBody CommunityCreationDtos.RulesRequest request) {
        SecurityUserContext.CurrentUser currentUser = userContext.currentUser();
        return CommunityCreationDtos.CommunityCreationRequestResponse.from(creationService.replaceRules(
                currentUser.userId(),
                requestId,
                (request.rules() == null ? List.<CommunityCreationDtos.RuleInput>of() : request.rules())
                        .stream()
                        .map(CommunityCreationDtos.RuleInput::toCommand)
                        .toList()));
    }

    @PutMapping("/requests/{requestId}/moderator-invitations")
    public CommunityCreationDtos.CommunityCreationRequestResponse replaceModeratorInvitations(
            @PathVariable UUID requestId,
            @RequestBody CommunityCreationDtos.InvitationsRequest request) {
        SecurityUserContext.CurrentUser currentUser = userContext.currentUser();
        return CommunityCreationDtos.CommunityCreationRequestResponse.from(creationService.replaceModeratorInvitations(
                currentUser.userId(),
                requestId,
                (request.invitations() == null
                                ? List.<CommunityCreationDtos.ModeratorInvitationInput>of()
                                : request.invitations())
                        .stream()
                        .map(CommunityCreationDtos.ModeratorInvitationInput::toCommand)
                        .toList()));
    }

    @PutMapping("/requests/{requestId}/media")
    public CommunityCreationDtos.MediaAssetResponse attachMedia(
            @PathVariable UUID requestId,
            @RequestBody CommunityCreationDtos.MediaMetadataRequest request) {
        SecurityUserContext.CurrentUser currentUser = userContext.currentUser();
        MediaAsset asset = creationService.attachMedia(
                currentUser.userId(),
                requestId,
                new CommunityMediaService.MediaCommand(
                        request.fileName(), request.mimeType(), request.byteSize(), request.width(), request.height()));
        return CommunityCreationDtos.MediaAssetResponse.from(asset);
    }

    @PostMapping("/requests/{requestId}/submit")
    public ResponseEntity<CommunityCreationDtos.SubmitCommunityCreationResponse> submit(
            @PathVariable UUID requestId,
            @RequestHeader("Idempotency-Key") String idempotencyKey) {
        SecurityUserContext.CurrentUser currentUser = userContext.currentUser();
        CommunityCreationService.SubmitResult result = creationService.submit(currentUser.userId(), requestId, idempotencyKey);
        return ResponseEntity.status(result.replayed() ? 200 : 201)
                .body(CommunityCreationDtos.SubmitCommunityCreationResponse.from(result));
    }
}

@RestController
@RequestMapping("/api/v1/communities")
class CommunityReadController {
    private final CommunityCreationService creationService;

    CommunityReadController(CommunityCreationService creationService) {
        this.creationService = creationService;
    }

    @GetMapping("/{communityId}")
    CommunityCreationDtos.CommunityResponse getCommunity(@PathVariable UUID communityId) {
        return CommunityCreationDtos.CommunityResponse.from(creationService.getCommunity(communityId));
    }
}
