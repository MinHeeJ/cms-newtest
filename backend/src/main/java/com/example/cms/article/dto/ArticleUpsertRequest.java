package com.example.cms.article.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ArticleUpsertRequest(
        @NotNull Long folderId,
        @NotBlank @Size(max = 220) String title,
        @NotNull String body,
        Integer sortOrder) {
}
