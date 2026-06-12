package com.example.cms.search;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class SearchServiceTest {
    @Test
    void capsLimitAtFiftyAndPassesQueryAsMapperParameter() {
        SearchMapper mapper = mock(SearchMapper.class);
        SearchService service = new SearchService(mapper);

        service.search(new SearchRequest("' OR 1=1 --", 999));

        ArgumentCaptor<String> query = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Integer> limit = ArgumentCaptor.forClass(Integer.class);
        verify(mapper).search(query.capture(), limit.capture());
        assertThat(query.getValue()).isEqualTo("' OR 1=1 --");
        assertThat(limit.getValue()).isEqualTo(50);
    }

    @Test
    void rejectsSpecialOnlyQuery() {
        assertThatThrownBy(() -> new SearchRequest("%%%---", 10).normalizedQuery())
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("문자 또는 숫자");
    }
}
