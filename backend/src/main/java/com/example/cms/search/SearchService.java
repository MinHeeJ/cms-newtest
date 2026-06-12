package com.example.cms.search;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class SearchService {
    private final SearchMapper searchMapper;

    public SearchService(SearchMapper searchMapper) {
        this.searchMapper = searchMapper;
    }

    public List<SearchResult> search(SearchRequest request) {
        return searchMapper.search(request.normalizedQuery(), request.normalizedLimit());
    }
}
