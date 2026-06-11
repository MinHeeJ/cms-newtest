package com.cmsnew.community.moderation;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cmsnew.community.auth.CurrentMember;
import com.cmsnew.community.common.CommunityEnums.ReportStatus;
import com.cmsnew.community.common.PageResponse;
import com.cmsnew.community.moderation.ModerationDtos.ModerationActionRequest;
import com.cmsnew.community.moderation.ModerationDtos.ModerationActionResponse;
import com.cmsnew.community.moderation.ModerationDtos.ReportCreateRequest;
import com.cmsnew.community.moderation.ModerationDtos.ReportResponse;

import jakarta.validation.Valid;

@RestController
public class ModerationController {
    private final ReportService reportService;
    private final ModerationService moderationService;
    private final ReportRepository reportRepository;

    public ModerationController(ReportService reportService, ModerationService moderationService, ReportRepository reportRepository) {
        this.reportService = reportService;
        this.moderationService = moderationService;
        this.reportRepository = reportRepository;
    }

    @PostMapping("/api/v1/reports")
    ResponseEntity<ReportResponse> report(@AuthenticationPrincipal CurrentMember currentMember,
                                          @Valid @RequestBody ReportCreateRequest request) {
        CurrentMember current = CurrentMember.require(currentMember);
        return ResponseEntity.status(HttpStatus.CREATED).body(reportService.submit(current.id(), request));
    }

    @GetMapping("/api/v1/admin/reports")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    @Transactional(readOnly = true)
    PageResponse<ReportResponse> queue(@RequestParam(required = false) ReportStatus status,
                                       @RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size);
        if (status == null) {
            return PageResponse.from(reportRepository.findAllByOrderByCreatedAtDesc(pageable).map(ReportResponse::from));
        }
        return PageResponse.from(reportRepository.findByStatusOrderByCreatedAtDesc(status, pageable).map(ReportResponse::from));
    }

    @PostMapping("/api/v1/admin/reports/{reportId}/actions")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    ResponseEntity<ModerationActionResponse> action(@AuthenticationPrincipal CurrentMember currentMember,
                                                    @PathVariable String reportId,
                                                    @Valid @RequestBody ModerationActionRequest request) {
        CurrentMember current = CurrentMember.require(currentMember);
        return ResponseEntity.status(HttpStatus.CREATED).body(moderationService.act(current.id(), reportId, request));
    }
}
