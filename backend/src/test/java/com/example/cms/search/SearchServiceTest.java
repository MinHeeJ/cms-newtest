package com.example.cms.search;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SearchServiceTest {

    @Test
    void validatesQueryAndLimitsResults() {
        SearchMapper mapper = mock(SearchMapper.class);
        when(mapper.searchPublished("safe", 50)).thenReturn(List.of());
        SearchService service = new SearchService(mapper);

        service.search(new SearchRequest(" safe "));

        verify(mapper).searchPublished("safe", 50);
    }

    @Test
    void rejectsSpecialCharacterOnlyQuery() {
        SearchService service = new SearchService(mock(SearchMapper.class));

        assertThatThrownBy(() -> service.search(new SearchRequest("!!!")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("검색어");
    }
}
