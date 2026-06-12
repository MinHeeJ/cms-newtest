package com.example.cms.article.dto;

import com.example.cms.article.Article;
import java.time.OffsetDateTime;

public record ArticleSummaryResponse(
        Long id,
        Long folderId,
        String title,
        String status,
        int sortOrder,
        OffsetDateTime publishedAt,
        OffsetDateTime updatedAt) {
    public static ArticleSummaryResponse from(Article article) {
        return new ArticleSummaryResponse(
                article.getId(),
                article.getFolderId(),
                article.getTitle(),
                article.getStatus(),
                article.getSortOrder() == null ? 0 : article.getSortOrder(),
                article.getPublishedAt(),
                article.getUpdatedAt());
    }
}
