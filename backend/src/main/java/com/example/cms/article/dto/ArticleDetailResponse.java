package com.example.cms.article.dto;

import com.example.cms.article.Article;
import java.time.OffsetDateTime;

public record ArticleDetailResponse(
        Long id,
        Long folderId,
        String title,
        String body,
        String status,
        int sortOrder,
        OffsetDateTime publishedAt,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {
    public static ArticleDetailResponse from(Article article) {
        return new ArticleDetailResponse(
                article.getId(),
                article.getFolderId(),
                article.getTitle(),
                article.getBody(),
                article.getStatus(),
                article.getSortOrder() == null ? 0 : article.getSortOrder(),
                article.getPublishedAt(),
                article.getCreatedAt(),
                article.getUpdatedAt());
    }
}
