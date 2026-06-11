package com.cmsnew.community.member;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cmsnew.community.board.Board;
import com.cmsnew.community.board.BoardRepository;
import com.cmsnew.community.board.BoardSubscription;
import com.cmsnew.community.board.BoardSubscriptionRepository;
import com.cmsnew.community.common.ApiErrorException;
import com.cmsnew.community.common.CommunityEnums.BoardVisibility;
import com.cmsnew.community.common.CommunityEnums.PostStatus;
import com.cmsnew.community.post.Bookmark;
import com.cmsnew.community.post.BookmarkRepository;
import com.cmsnew.community.post.Post;
import com.cmsnew.community.post.PostRepository;

@Service
public class PersonalizationService {
    private final MemberRepository memberRepository;
    private final BoardRepository boardRepository;
    private final BoardSubscriptionRepository subscriptionRepository;
    private final PostRepository postRepository;
    private final BookmarkRepository bookmarkRepository;

    public PersonalizationService(MemberRepository memberRepository, BoardRepository boardRepository,
                                  BoardSubscriptionRepository subscriptionRepository, PostRepository postRepository,
                                  BookmarkRepository bookmarkRepository) {
        this.memberRepository = memberRepository;
        this.boardRepository = boardRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.postRepository = postRepository;
        this.bookmarkRepository = bookmarkRepository;
    }

    @Transactional
    public void subscribe(String memberId, String boardId) {
        Member member = member(memberId);
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> ApiErrorException.notFound("게시판을 찾을 수 없습니다."));
        if (board.getVisibility() == BoardVisibility.CLOSED || board.isArchived()) {
            throw ApiErrorException.forbidden("구독할 수 없는 게시판입니다.");
        }
        if (!subscriptionRepository.existsByMember_IdAndBoard_Id(memberId, boardId)) {
            subscriptionRepository.save(new BoardSubscription(member, board));
        }
    }

    @Transactional
    public void unsubscribe(String memberId, String boardId) {
        subscriptionRepository.deleteByMember_IdAndBoard_Id(memberId, boardId);
    }

    @Transactional
    public void bookmark(String memberId, String postId) {
        Member member = member(memberId);
        Post post = postRepository.findById(postId)
                .filter(candidate -> candidate.getStatus() == PostStatus.PUBLISHED)
                .orElseThrow(() -> ApiErrorException.notFound("저장할 게시글을 찾을 수 없습니다."));
        if (!bookmarkRepository.existsByMember_IdAndPost_Id(memberId, postId)) {
            bookmarkRepository.save(new Bookmark(member, post));
        }
    }

    @Transactional
    public void removeBookmark(String memberId, String postId) {
        bookmarkRepository.deleteByMember_IdAndPost_Id(memberId, postId);
    }

    private Member member(String memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> ApiErrorException.notFound("회원 정보를 찾을 수 없습니다."));
    }
}
