package com.cmsnew.community.admin;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cmsnew.community.board.BoardRepository;
import com.cmsnew.community.comment.CommentRepository;
import com.cmsnew.community.common.CommunityEnums.PostStatus;
import com.cmsnew.community.common.CommunityEnums.ReportStatus;
import com.cmsnew.community.member.MemberRepository;
import com.cmsnew.community.moderation.ReportRepository;
import com.cmsnew.community.post.PostRepository;

@Service
public class AdminMetricsService {
    private final MemberRepository memberRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final ReportRepository reportRepository;
    private final BoardRepository boardRepository;

    public AdminMetricsService(MemberRepository memberRepository, PostRepository postRepository,
                               CommentRepository commentRepository, ReportRepository reportRepository,
                               BoardRepository boardRepository) {
        this.memberRepository = memberRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.reportRepository = reportRepository;
        this.boardRepository = boardRepository;
    }

    @Transactional(readOnly = true)
    public AdminMetrics metrics() {
        OffsetDateTime today = OffsetDateTime.now().toLocalDate().atStartOfDay().atOffset(OffsetDateTime.now().getOffset());
        return new AdminMetrics(
                memberRepository.countByCreatedAtAfter(today),
                postRepository.countByCreatedAtAfter(today),
                commentRepository.countByCreatedAtAfter(today),
                reportRepository.countByStatus(ReportStatus.OPEN) + reportRepository.countByStatus(ReportStatus.IN_REVIEW),
                boardRepository.count(),
                postRepository.countByStatus(PostStatus.PUBLISHED)
        );
    }

    public record AdminMetrics(
            long todayMembers,
            long todayPosts,
            long todayComments,
            long pendingReports,
            long activeBoards,
            long publishedPosts
    ) {
    }
}
