package com.example.cms.portal;

import com.example.cms.article.Article;
import com.example.cms.article.ArticleMapper;
import com.example.cms.article.ArticleStatus;
import com.example.cms.article.PortalArticleService;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PortalVisibilityTest {

    @Test
    void portalServiceUsesPublishedMapperQueryOnly() {
        ArticleMapper mapper = mock(ArticleMapper.class);
        Article article = new Article();
        article.setId(7L);
        article.setFolderId(3L);
        article.setTitle("게시 문서");
        article.setStatus(ArticleStatus.PUBLISHED);
        when(mapper.findPublishedByFolder(3L)).thenReturn(List.of(article));

        PortalArticleService service = new PortalArticleService(mapper);

        assertThat(service.list(3L)).hasSize(1);
        verify(mapper).findPublishedByFolder(3L);
    }
}
