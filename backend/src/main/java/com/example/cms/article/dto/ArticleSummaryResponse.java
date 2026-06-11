package com.example.cms.article.dto;

import com.example.cms.article.Article;
import com.example.cms.article.ArticleStatus;

import java.time.OffsetDateTime;

public record ArticleSummaryResponse(
        Long id,
        Long folderId,
        String title,
        ArticleStatus status,
        int sortOrder,
        String authorName,
        OffsetDateTime publishedAt,
        OffsetDateTime updatedAt
) {

    public static ArticleSummaryResponse from(Article article) {
        return new ArticleSummaryResponse(
                article.getId(),
                article.getFolderId(),
                article.getTitle(),
                article.getStatus(),
                article.getSortOrder() == null ? 0 : article.getSortOrder(),
                article.getAuthorName(),
                article.getPublishedAt(),
                article.getUpdatedAt()
        );
    }
}
