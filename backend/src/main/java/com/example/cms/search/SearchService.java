package com.example.cms.search;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SearchService {

    private static final int RESULT_LIMIT = 50;
    private final SearchMapper searchMapper;

    public SearchService(SearchMapper searchMapper) {
        this.searchMapper = searchMapper;
    }

    public List<SearchResult> search(SearchRequest request) {
        return searchMapper.searchPublished(request.normalizedQuery(), RESULT_LIMIT);
    }
}
