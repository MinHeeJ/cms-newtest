package com.cmsnew.community.search;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cmsnew.community.common.PageResponse;
import com.cmsnew.community.post.PostDtos.PostSummary;

@RestController
public class SearchController {
    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/api/v1/search")
    PageResponse<PostSummary> search(@RequestParam("q") String keyword,
                                     @RequestParam(required = false) String boardId,
                                     @RequestParam(defaultValue = "relevance") String sort,
                                     @RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "20") int size) {
        return searchService.search(keyword, boardId, sort, page, size);
    }
}
