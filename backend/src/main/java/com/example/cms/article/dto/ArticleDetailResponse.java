package com.example.cms.article.dto;

import com.example.cms.article.Article;
import com.example.cms.article.ArticleStatus;

import java.time.OffsetDateTime;

public record ArticleDetailResponse(
        Long id,
        Long folderId,
        String title,
        String bodyMarkdown,
        ArticleStatus status,
        int sortOrder,
        String authorName,
        OffsetDateTime publishedAt,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {

    public static ArticleDetailResponse from(Article article) {
        return new ArticleDetailResponse(
                article.getId(),
                article.getFolderId(),
                article.getTitle(),
                article.getBodyMarkdown(),
                article.getStatus(),
                article.getSortOrder() == null ? 0 : article.getSortOrder(),
                article.getAuthorName(),
                article.getPublishedAt(),
                article.getCreatedAt(),
                article.getUpdatedAt()
        );
    }
}
