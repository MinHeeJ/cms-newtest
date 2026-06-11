package com.cmsnew.community.comment;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cmsnew.community.audit.AuditService;
import com.cmsnew.community.comment.CommentDtos.CommentCreateRequest;
import com.cmsnew.community.comment.CommentDtos.CommentResponse;
import com.cmsnew.community.common.ApiErrorException;
import com.cmsnew.community.common.CommunityEnums.PostStatus;
import com.cmsnew.community.member.Member;
import com.cmsnew.community.member.MemberRepository;
import com.cmsnew.community.notification.NotificationService;
import com.cmsnew.community.post.Post;
import com.cmsnew.community.post.PostRepository;

@Service
public class CommentCommandService {
    private static final int MAX_REPLY_DEPTH = 1;

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final MemberRepository memberRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public CommentCommandService(CommentRepository commentRepository, PostRepository postRepository, MemberRepository memberRepository,
                                 NotificationService notificationService, AuditService auditService) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.memberRepository = memberRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Transactional
    public CommentResponse create(String postId, String memberId, CommentCreateRequest request) {
        Post post = postRepository.findById(postId)
                .filter(candidate -> candidate.getStatus() == PostStatus.PUBLISHED)
                .orElseThrow(() -> ApiErrorException.notFound("댓글을 작성할 게시글을 찾을 수 없습니다."));
        Member author = memberRepository.findById(memberId)
                .orElseThrow(() -> ApiErrorException.notFound("회원 정보를 찾을 수 없습니다."));
        Comment parent = null;
        int depth = 0;
        if (request.parentCommentId() != null && !request.parentCommentId().isBlank()) {
            parent = commentRepository.findById(request.parentCommentId())
                    .orElseThrow(() -> ApiErrorException.notFound("상위 댓글을 찾을 수 없습니다."));
            if (!parent.getPost().getId().equals(postId)) {
                throw ApiErrorException.badRequest("상위 댓글이 게시글과 일치하지 않습니다.");
            }
            depth = parent.getDepth() + 1;
            if (depth > MAX_REPLY_DEPTH) {
                throw ApiErrorException.badRequest("대댓글은 한 단계까지만 작성할 수 있습니다.");
            }
        }

        Comment comment = commentRepository.save(new Comment(post, author, parent, request.body().trim(), depth));
        post.incrementCommentCount();
        notificationService.notifyForComment(comment);
        auditService.record(memberId, "COMMENT_CREATE", "COMMENT", comment.getId(), "댓글 작성", null);
        return CommentResponse.from(comment);
    }
}
