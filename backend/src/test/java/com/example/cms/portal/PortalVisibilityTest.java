package com.example.cms.portal;

import com.example.cms.article.Article;
import com.example.cms.article.ArticleMapper;
import com.example.cms.article.ArticleStatus;
import com.example.cms.article.PortalArticleService;
import java.util.List;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PortalVisibilityTest {
    @Test
    void portalArticleListUsesPublishedMapperFilter() {
        ArticleMapper mapper = mock(ArticleMapper.class);
        Article article = new Article();
        article.setId(1L);
        article.setFolderId(10L);
        article.setTitle("published");
        article.setStatus(ArticleStatus.PUBLISHED.name());
        when(mapper.listPortalByFolder(10L)).thenReturn(List.of(article));

        List<?> result = new PortalArticleService(mapper).list(10L);

        assertThat(result).hasSize(1);
    }

    @Test
    void hiddenArticleDirectAccessReturnsControlledError() {
        ArticleMapper mapper = mock(ArticleMapper.class);
        when(mapper.findPublished(2L)).thenReturn(null);

        org.assertj.core.api.Assertions.assertThatThrownBy(() -> new PortalArticleService(mapper).detail(2L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("열람 권한");
    }
}
