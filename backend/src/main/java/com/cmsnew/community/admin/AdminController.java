package com.cmsnew.community.admin;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

import com.cmsnew.community.admin.AdminMetricsService.AdminMetrics;
import com.cmsnew.community.admin.NoticeService.NoticeRequest;
import com.cmsnew.community.auth.AuthDtos.MemberProfile;
import com.cmsnew.community.auth.CurrentMember;
import com.cmsnew.community.board.BoardDtos.BoardResponse;
import com.cmsnew.community.board.BoardDtos.BoardUpsertRequest;
import com.cmsnew.community.common.CommunityEnums.MemberStatus;
import com.cmsnew.community.common.CommunityEnums.Role;
import com.cmsnew.community.post.PostDtos.PostDetail;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

@RestController
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminBoardService adminBoardService;
    private final NoticeService noticeService;
    private final RoleManagementService roleManagementService;
    private final AdminMetricsService adminMetricsService;

    public AdminController(AdminBoardService adminBoardService, NoticeService noticeService,
                           RoleManagementService roleManagementService, AdminMetricsService adminMetricsService) {
        this.adminBoardService = adminBoardService;
        this.noticeService = noticeService;
        this.roleManagementService = roleManagementService;
        this.adminMetricsService = adminMetricsService;
    }

    @PostMapping("/api/v1/boards")
    ResponseEntity<BoardResponse> createBoard(@AuthenticationPrincipal CurrentMember currentMember,
                                              @Valid @RequestBody BoardUpsertRequest request) {
        CurrentMember current = CurrentMember.require(currentMember);
        return ResponseEntity.status(HttpStatus.CREATED).body(adminBoardService.create(current.id(), request));
    }

    @PatchMapping("/api/v1/boards/{boardId}")
    BoardResponse updateBoard(@AuthenticationPrincipal CurrentMember currentMember,
                              @PathVariable String boardId,
                              @Valid @RequestBody BoardUpsertRequest request) {
        CurrentMember current = CurrentMember.require(currentMember);
        return adminBoardService.update(current.id(), boardId, request);
    }

    @GetMapping("/api/v1/admin/metrics")
    AdminMetrics metrics() {
        return adminMetricsService.metrics();
    }

    @PostMapping("/api/v1/admin/notices")
    ResponseEntity<PostDetail> notice(@AuthenticationPrincipal CurrentMember currentMember,
                                      @Valid @RequestBody NoticeRequest request) {
        CurrentMember current = CurrentMember.require(currentMember);
        return ResponseEntity.status(HttpStatus.CREATED).body(noticeService.createNotice(current.id(), request));
    }

    @PatchMapping("/api/v1/admin/posts/{postId}/pin")
    PostDetail pin(@AuthenticationPrincipal CurrentMember currentMember,
                   @PathVariable String postId,
                   @Valid @RequestBody PinRequest request) {
        CurrentMember current = CurrentMember.require(currentMember);
        return noticeService.pin(current.id(), postId, request.pinned());
    }

    @PatchMapping("/api/v1/admin/users/{memberId}/role")
    MemberProfile role(@AuthenticationPrincipal CurrentMember currentMember,
                       @PathVariable String memberId,
                       @Valid @RequestBody RoleRequest request) {
        CurrentMember current = CurrentMember.require(currentMember);
        return roleManagementService.updateRole(current.id(), memberId, request.role());
    }

    @PatchMapping("/api/v1/admin/users/{memberId}/status")
    MemberProfile status(@AuthenticationPrincipal CurrentMember currentMember,
                         @PathVariable String memberId,
                         @Valid @RequestBody StatusRequest request) {
        CurrentMember current = CurrentMember.require(currentMember);
        return roleManagementService.updateStatus(current.id(), memberId, request.status());
    }

    public record PinRequest(boolean pinned) {
    }

    public record RoleRequest(@NotNull(message = "권한을 선택해주세요.") Role role) {
    }

    public record StatusRequest(@NotNull(message = "회원 상태를 선택해주세요.") MemberStatus status) {
    }
}
