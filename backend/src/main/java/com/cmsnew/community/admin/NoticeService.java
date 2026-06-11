package com.cmsnew.community.admin;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cmsnew.community.audit.AuditService;
import com.cmsnew.community.board.Board;
import com.cmsnew.community.board.BoardRepository;
import com.cmsnew.community.common.ApiErrorException;
import com.cmsnew.community.member.Member;
import com.cmsnew.community.member.MemberRepository;
import com.cmsnew.community.post.Post;
import com.cmsnew.community.post.PostDtos.PostDetail;
import com.cmsnew.community.post.PostRepository;

import jakarta.validation.constraints.NotBlank;

@Service
public class NoticeService {
    private final BoardRepository boardRepository;
    private final MemberRepository memberRepository;
    private final PostRepository postRepository;
    private final AuditService auditService;

    public NoticeService(BoardRepository boardRepository, MemberRepository memberRepository,
                         PostRepository postRepository, AuditService auditService) {
        this.boardRepository = boardRepository;
        this.memberRepository = memberRepository;
        this.postRepository = postRepository;
        this.auditService = auditService;
    }

    @Transactional
    public PostDetail createNotice(String actorId, NoticeRequest request) {
        Board board = boardRepository.findById(request.boardId())
                .orElseThrow(() -> ApiErrorException.notFound("게시판을 찾을 수 없습니다."));
        Member actor = memberRepository.findById(actorId)
                .orElseThrow(() -> ApiErrorException.notFound("관리자 정보를 찾을 수 없습니다."));
        Post post = new Post(board, actor, request.title(), request.body(), request.category());
        post.notice(true);
        post.pin(request.pinned());
        postRepository.save(post);
        auditService.record(actorId, "NOTICE_CREATE", "POST", post.getId(), "공지 등록", request.title());
        return PostDetail.from(post, null);
    }

    @Transactional
    public PostDetail pin(String actorId, String postId, boolean pinned) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> ApiErrorException.notFound("게시글을 찾을 수 없습니다."));
        post.pin(pinned);
        auditService.record(actorId, pinned ? "POST_PIN" : "POST_UNPIN", "POST", postId, "고정글 설정 변경", null);
        return PostDetail.from(post, null);
    }

    public record NoticeRequest(
            @NotBlank(message = "게시판을 선택해주세요.") String boardId,
            @NotBlank(message = "공지 제목은 필수입니다.") String title,
            @NotBlank(message = "공지 본문은 필수입니다.") String body,
            String category,
            boolean pinned
    ) {
    }
}
