package com.example.cms.article;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ArticleStatePolicyTest {

    private final ArticleStatePolicy policy = new ArticleStatePolicy();

    @Test
    void allowsPublishAndUnpublishFlow() {
        assertThatCode(() -> policy.validateTransition(ArticleStatus.DRAFT, ArticleStatus.PUBLISHED))
                .doesNotThrowAnyException();
        assertThatCode(() -> policy.validateTransition(ArticleStatus.PUBLISHED, ArticleStatus.UNPUBLISHED))
                .doesNotThrowAnyException();
        assertThatCode(() -> policy.validateTransition(ArticleStatus.UNPUBLISHED, ArticleStatus.PUBLISHED))
                .doesNotThrowAnyException();
    }

    @Test
    void rejectsReturningToDraft() {
        assertThatThrownBy(() -> policy.validateTransition(ArticleStatus.PUBLISHED, ArticleStatus.DRAFT))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("초안");
    }
}
