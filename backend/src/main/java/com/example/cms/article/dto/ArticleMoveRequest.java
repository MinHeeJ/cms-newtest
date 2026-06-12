package com.example.cms.article.dto;

import jakarta.validation.constraints.NotNull;

public record ArticleMoveRequest(@NotNull Long folderId) {
}
