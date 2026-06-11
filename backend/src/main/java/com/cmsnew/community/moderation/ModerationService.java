package com.cmsnew.community.moderation;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cmsnew.community.audit.AuditService;
import com.cmsnew.community.comment.Comment;
import com.cmsnew.community.comment.CommentRepository;
import com.cmsnew.community.common.ApiErrorException;
import com.cmsnew.community.common.CommunityEnums.CommentStatus;
import com.cmsnew.community.common.CommunityEnums.MemberStatus;
import com.cmsnew.community.common.CommunityEnums.ModerationActionType;
import com.cmsnew.community.common.CommunityEnums.ModerationTargetType;
import com.cmsnew.community.common.CommunityEnums.PostStatus;
import com.cmsnew.community.common.CommunityEnums.ReportStatus;
import com.cmsnew.community.common.CommunityEnums.ReportTargetType;
import com.cmsnew.community.member.Member;
import com.cmsnew.community.member.MemberRepository;
import com.cmsnew.community.moderation.ModerationDtos.ModerationActionRequest;
import com.cmsnew.community.moderation.ModerationDtos.ModerationActionResponse;
import com.cmsnew.community.notification.NotificationService;
import com.cmsnew.community.post.Post;
import com.cmsnew.community.post.PostRepository;

@Service
public class ModerationService {
    private final ReportRepository reportRepository;
    private final ModerationActionRepository actionRepository;
    private final MemberRepository memberRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public ModerationService(ReportRepository reportRepository, ModerationActionRepository actionRepository,
                             MemberRepository memberRepository, PostRepository postRepository, CommentRepository commentRepository,
                             NotificationService notificationService, AuditService auditService) {
        this.reportRepository = reportRepository;
        this.actionRepository = actionRepository;
        this.memberRepository = memberRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Transactional
    public ModerationActionResponse act(String actorId, String reportId, ModerationActionRequest request) {
        Member actor = memberRepository.findById(actorId)
                .orElseThrow(() -> ApiErrorException.notFound("운영자 정보를 찾을 수 없습니다."));
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> ApiErrorException.notFound("신고를 찾을 수 없습니다."));

        TargetOwner targetOwner = applyTargetAction(report, request.actionType());
        report.changeStatus(statusFor(request.actionType()));
        ModerationTargetType targetType = report.getTargetType() == ReportTargetType.POST
                ? ModerationTargetType.POST
                : ModerationTargetType.COMMENT;
        ModerationAction action = actionRepository.save(new ModerationAction(
                actor,
                report,
                targetType,
                report.getTargetId(),
                request.actionType(),
                request.reason(),
                request.memberVisible()
        ));
        auditService.record(actorId, "MODERATION_ACTION", targetType.name(), report.getTargetId(), request.actionType().name(), request.reason());
        if (request.memberVisible() && targetOwner.memberId() != null) {
            notificationService.notifyModerationResult(targetOwner.memberId(), targetType.name(), report.getTargetId(), request.reason());
        }
        return ModerationActionResponse.from(action);
    }

    private TargetOwner applyTargetAction(Report report, ModerationActionType actionType) {
        if (report.getTargetType() == ReportTargetType.POST) {
            Post post = postRepository.findById(report.getTargetId())
                    .orElseThrow(() -> ApiErrorException.notFound("조치 대상 게시글을 찾을 수 없습니다."));
            applyPostAction(post, actionType);
            return new TargetOwner(post.getAuthor().getId());
        }
        Comment comment = commentRepository.findById(report.getTargetId())
                .orElseThrow(() -> ApiErrorException.notFound("조치 대상 댓글을 찾을 수 없습니다."));
        applyCommentAction(comment, actionType);
        return new TargetOwner(comment.getAuthor().getId());
    }

    private void applyPostAction(Post post, ModerationActionType actionType) {
        switch (actionType) {
            case HIDE -> post.changeStatus(PostStatus.HIDDEN);
            case RESTORE -> post.changeStatus(PostStatus.PUBLISHED);
            case DELETE -> post.changeStatus(PostStatus.DELETED);
            case SUSPEND -> post.getAuthor().changeStatus(MemberStatus.SUSPENDED);
            default -> {
            }
        }
    }

    private void applyCommentAction(Comment comment, ModerationActionType actionType) {
        switch (actionType) {
            case HIDE -> comment.changeStatus(CommentStatus.HIDDEN);
            case RESTORE -> comment.changeStatus(CommentStatus.PUBLISHED);
            case DELETE -> comment.changeStatus(CommentStatus.DELETED);
            case SUSPEND -> comment.getAuthor().changeStatus(MemberStatus.SUSPENDED);
            default -> {
            }
        }
    }

    private ReportStatus statusFor(ModerationActionType actionType) {
        return switch (actionType) {
            case REJECT_REPORT -> ReportStatus.REJECTED;
            case MARK_DUPLICATE -> ReportStatus.DUPLICATE;
            default -> ReportStatus.ACTIONED;
        };
    }

    private record TargetOwner(String memberId) {
    }
}
