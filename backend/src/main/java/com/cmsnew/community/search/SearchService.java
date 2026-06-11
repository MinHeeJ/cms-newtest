package com.cmsnew.community.search;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cmsnew.community.common.ApiErrorException;
import com.cmsnew.community.common.CommunityEnums.PostStatus;
import com.cmsnew.community.common.PageResponse;
import com.cmsnew.community.post.PostDtos.PostSummary;
import com.cmsnew.community.post.PostRepository;

@Service
public class SearchService {
    private final PostRepository postRepository;

    public SearchService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<PostSummary> search(String keyword, String boardId, String sort, int page, int size) {
        if (keyword == null || keyword.trim().length() < 2) {
            throw ApiErrorException.badRequest("검색어는 2자 이상 입력해주세요.");
        }
        Sort springSort = "latest".equals(sort)
                ? Sort.by("createdAt").descending()
                : Sort.by("reactionCount").descending().and(Sort.by("commentCount").descending()).and(Sort.by("createdAt").descending());
        Pageable pageable = PageRequest.of(page, size, springSort);
        return PageResponse.from(postRepository.searchPublicPosts(keyword.trim(), blankToNull(boardId), PostStatus.PUBLISHED, pageable)
                .map(PostSummary::from));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
