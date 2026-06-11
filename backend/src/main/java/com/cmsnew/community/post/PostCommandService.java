package com.cmsnew.community.post;

import java.util.EnumMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cmsnew.community.audit.AuditService;
import com.cmsnew.community.auth.CurrentMember;
import com.cmsnew.community.board.Board;
import com.cmsnew.community.board.BoardRepository;
import com.cmsnew.community.common.ApiErrorException;
import com.cmsnew.community.common.CommunityEnums.PostStatus;
import com.cmsnew.community.common.CommunityEnums.PostingPolicy;
import com.cmsnew.community.common.CommunityEnums.ReactionType;
import com.cmsnew.community.common.CommunityEnums.Role;
import com.cmsnew.community.member.Member;
import com.cmsnew.community.member.MemberRepository;
import com.cmsnew.community.post.PostDtos.PostCreateRequest;
import com.cmsnew.community.post.PostDtos.PostDetail;
import com.cmsnew.community.post.PostDtos.PostUpdateRequest;
import com.cmsnew.community.post.PostDtos.ReactionSummary;

@Service
public class PostCommandService {
    private final PostRepository postRepository;
    private final BoardRepository boardRepository;
    private final MemberRepository memberRepository;
    private final ReactionRepository reactionRepository;
    private final AuditService auditService;

    public PostCommandService(PostRepository postRepository, BoardRepository boardRepository, MemberRepository memberRepository,
                              ReactionRepository reactionRepository, AuditService auditService) {
        this.postRepository = postRepository;
        this.boardRepository = boardRepository;
        this.memberRepository = memberRepository;
        this.reactionRepository = reactionRepository;
        this.auditService = auditService;
    }

    @Transactional
    public PostDetail create(String boardId, String memberId, Role role, PostCreateRequest request) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> ApiErrorException.notFound("게시판을 찾을 수 없습니다."));
        if (board.isArchived()) {
            throw ApiErrorException.forbidden("보관된 게시판에는 글을 쓸 수 없습니다.");
        }
        if (!canPost(role, board.getPostingPolicy())) {
            throw ApiErrorException.forbidden("이 게시판에 글을 작성할 권한이 없습니다.");
        }
        String category = normalizeCategory(board, request.category());
        Member author = member(memberId);
        Post post = postRepository.save(new Post(board, author, request.title().trim(), request.body(), category));
        auditService.record(memberId, "POST_CREATE", "POST", post.getId(), "게시글 작성", null);
        return PostDetail.from(post, null);
    }

    @Transactional
    public PostDetail detail(String postId, CurrentMember currentMember) {
        Post post = visiblePost(postId);
        post.incrementViewCount();
        ReactionType currentReaction = currentMember == null
                ? null
                : reactionRepository.findByPost_IdAndMember_Id(postId, currentMember.id()).map(Reaction::getType).orElse(null);
        return PostDetail.from(post, currentReaction);
    }

    @Transactional
    public PostDetail update(String postId, CurrentMember currentMember, PostUpdateRequest request) {
        CurrentMember current = CurrentMember.require(currentMember);
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> ApiErrorException.notFound("게시글을 찾을 수 없습니다."));
        assertOwnerOrStaff(post, current);
        normalizeCategory(post.getBoard(), request.category());
        post.update(request.title(), request.body(), request.category());
        auditService.record(current.id(), "POST_UPDATE", "POST", post.getId(), "게시글 수정", null);
        return PostDetail.from(post, currentReaction(postId, current.id()));
    }

    @Transactional
    public void delete(String postId, CurrentMember currentMember) {
        CurrentMember current = CurrentMember.require(currentMember);
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> ApiErrorException.notFound("게시글을 찾을 수 없습니다."));
        assertOwnerOrStaff(post, current);
        post.changeStatus(PostStatus.DELETED);
        auditService.record(current.id(), "POST_DELETE", "POST", post.getId(), "게시글 삭제", null);
    }

    @Transactional
    public ReactionSummary react(String postId, String memberId, ReactionType type) {
        Post post = visiblePost(postId);
        Member member = member(memberId);
        Reaction reaction = reactionRepository.findByPost_IdAndMember_Id(postId, memberId)
                .orElseGet(() -> new Reaction(post, member, type));
        reaction.changeType(type);
        reactionRepository.save(reaction);
        updateReactionCount(post);
        return reactionSummary(postId, type);
    }

    @Transactional
    public ReactionSummary removeReaction(String postId, String memberId) {
        Post post = visiblePost(postId);
        reactionRepository.deleteByPost_IdAndMember_Id(postId, memberId);
        updateReactionCount(post);
        return reactionSummary(postId, null);
    }

    @Transactional(readOnly = true)
    public ReactionSummary reactionSummary(String postId, ReactionType currentMemberReaction) {
        Map<ReactionType, Long> counts = new EnumMap<>(ReactionType.class);
        for (ReactionType type : ReactionType.values()) {
            counts.put(type, 0L);
        }
        reactionRepository.findByPost_Id(postId).forEach(reaction -> counts.merge(reaction.getType(), 1L, Long::sum));
        return new ReactionSummary(postId, counts, currentMemberReaction);
    }

    private void updateReactionCount(Post post) {
        post.setReactionCount((int) reactionRepository.countByPost_Id(post.getId()));
    }

    private ReactionType currentReaction(String postId, String memberId) {
        return reactionRepository.findByPost_IdAndMember_Id(postId, memberId).map(Reaction::getType).orElse(null);
    }

    private Post visiblePost(String postId) {
        return postRepository.findById(postId)
                .filter(candidate -> candidate.getStatus() == PostStatus.PUBLISHED)
                .orElseThrow(() -> ApiErrorException.notFound("게시글을 찾을 수 없습니다."));
    }

    private Member member(String memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> ApiErrorException.notFound("회원 정보를 찾을 수 없습니다."));
    }

    private void assertOwnerOrStaff(Post post, CurrentMember current) {
        if (!post.getAuthor().getId().equals(current.id()) && current.role() != Role.MODERATOR && current.role() != Role.ADMIN) {
            throw ApiErrorException.forbidden("본인이 작성한 글만 변경할 수 있습니다.");
        }
    }

    private boolean canPost(Role role, PostingPolicy policy) {
        return switch (policy) {
            case MEMBERS -> true;
            case MODERATORS -> role == Role.MODERATOR || role == Role.ADMIN;
            case ADMINS -> role == Role.ADMIN;
        };
    }

    private String normalizeCategory(Board board, String category) {
        if (category == null || category.isBlank()) {
            return null;
        }
        String normalized = category.trim();
        if (!board.getCategoryOptions().isEmpty() && !board.getCategoryOptions().contains(normalized)) {
            throw ApiErrorException.badRequest("선택할 수 없는 말머리입니다.");
        }
        return normalized;
    }
}
