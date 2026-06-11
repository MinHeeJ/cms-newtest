package com.cmsnew.community.moderation;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cmsnew.community.audit.AuditService;
import com.cmsnew.community.comment.CommentRepository;
import com.cmsnew.community.common.ApiErrorException;
import com.cmsnew.community.common.CommunityEnums.PostStatus;
import com.cmsnew.community.common.CommunityEnums.ReportStatus;
import com.cmsnew.community.common.CommunityEnums.ReportTargetType;
import com.cmsnew.community.member.Member;
import com.cmsnew.community.member.MemberRepository;
import com.cmsnew.community.moderation.ModerationDtos.ReportCreateRequest;
import com.cmsnew.community.moderation.ModerationDtos.ReportResponse;
import com.cmsnew.community.post.Post;
import com.cmsnew.community.post.PostRepository;

@Service
public class ReportService {
    private final ReportRepository reportRepository;
    private final MemberRepository memberRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final AuditService auditService;

    public ReportService(ReportRepository reportRepository, MemberRepository memberRepository, PostRepository postRepository,
                         CommentRepository commentRepository, AuditService auditService) {
        this.reportRepository = reportRepository;
        this.memberRepository = memberRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.auditService = auditService;
    }

    @Transactional
    public ReportResponse submit(String memberId, ReportCreateRequest request) {
        assertTargetExists(request);
        boolean duplicate = reportRepository.existsByReporter_IdAndTargetTypeAndTargetIdAndReasonCodeAndStatusIn(
                memberId,
                request.targetType(),
                request.targetId(),
                request.reasonCode(),
                List.of(ReportStatus.OPEN, ReportStatus.IN_REVIEW)
        );
        if (duplicate) {
            throw ApiErrorException.conflict("이미 같은 사유로 접수된 신고가 있습니다.");
        }
        Member reporter = memberRepository.findById(memberId)
                .orElseThrow(() -> ApiErrorException.notFound("회원 정보를 찾을 수 없습니다."));
        Report report = reportRepository.save(new Report(
                reporter,
                request.targetType(),
                request.targetId(),
                request.reasonCode(),
                request.description()
        ));
        if (request.targetType() == ReportTargetType.POST) {
            postRepository.findById(request.targetId()).ifPresent(Post::incrementReportCount);
        }
        auditService.record(memberId, "REPORT_SUBMIT", request.targetType().name(), request.targetId(), "신고 접수", request.reasonCode().name());
        return ReportResponse.from(report);
    }

    private void assertTargetExists(ReportCreateRequest request) {
        if (request.targetType() == ReportTargetType.POST) {
            postRepository.findById(request.targetId())
                    .filter(post -> post.getStatus() != PostStatus.DELETED)
                    .orElseThrow(() -> ApiErrorException.notFound("신고할 게시글을 찾을 수 없습니다."));
            return;
        }
        commentRepository.findById(request.targetId())
                .orElseThrow(() -> ApiErrorException.notFound("신고할 댓글을 찾을 수 없습니다."));
    }
}
