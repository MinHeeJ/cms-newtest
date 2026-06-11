package com.cmsnew.community.board;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cmsnew.community.board.BoardDtos.BoardResponse;
import com.cmsnew.community.common.ApiErrorException;
import com.cmsnew.community.common.CommunityEnums.BoardVisibility;
import com.cmsnew.community.common.CommunityEnums.PostStatus;
import com.cmsnew.community.common.PageResponse;
import com.cmsnew.community.post.PostDtos.PostSummary;
import com.cmsnew.community.post.PostRepository;

@Service
public class BoardFeedService {
    private final BoardRepository boardRepository;
    private final PostRepository postRepository;

    public BoardFeedService(BoardRepository boardRepository, PostRepository postRepository) {
        this.boardRepository = boardRepository;
        this.postRepository = postRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<BoardResponse> publicBoards(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("sortOrder").ascending().and(Sort.by("createdAt").ascending()));
        return PageResponse.from(boardRepository.findByVisibilityOrderBySortOrderAscCreatedAtAsc(BoardVisibility.PUBLIC, pageable)
                .map(BoardResponse::from));
    }

    @Transactional(readOnly = true)
    public BoardResponse board(String boardId) {
        Board board = boardRepository.findById(boardId)
                .filter(candidate -> candidate.getVisibility() == BoardVisibility.PUBLIC)
                .orElseThrow(() -> ApiErrorException.notFound("게시판을 찾을 수 없습니다."));
        return BoardResponse.from(board);
    }

    @Transactional(readOnly = true)
    public PageResponse<PostSummary> posts(String boardId, String sort, String category, int page, int size) {
        Board board = boardRepository.findById(boardId)
                .filter(candidate -> candidate.getVisibility() == BoardVisibility.PUBLIC)
                .orElseThrow(() -> ApiErrorException.notFound("게시판을 찾을 수 없습니다."));
        Sort springSort = switch (sort == null ? "latest" : sort) {
            case "popular" -> Sort.by("reactionCount").descending().and(Sort.by("commentCount").descending()).and(Sort.by("createdAt").descending());
            case "commented" -> Sort.by("commentCount").descending().and(Sort.by("createdAt").descending());
            default -> Sort.by("isPinned").descending().and(Sort.by("isNotice").descending()).and(Sort.by("createdAt").descending());
        };
        Pageable pageable = PageRequest.of(page, size, springSort);
        return PageResponse.from(postRepository.findPublicBoardPosts(board.getId(), blankToNull(category), PostStatus.PUBLISHED, pageable)
                .map(PostSummary::from));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
