package com.example.cms.article;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ArticleStatePolicyTest {
    private final ArticleStatePolicy policy = new ArticleStatePolicy();

    @Test
    void allowsPublishFromDraft() {
        assertThatCode(() -> policy.assertTransition("DRAFT", ArticleStatus.PUBLISHED)).doesNotThrowAnyException();
    }

    @Test
    void rejectsDraftFromPublished() {
        assertThatThrownBy(() -> policy.assertTransition("PUBLISHED", ArticleStatus.DRAFT))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("상태 전이");
    }
}
