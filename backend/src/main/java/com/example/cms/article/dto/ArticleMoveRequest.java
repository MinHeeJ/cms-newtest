package com.example.cms.article.dto;

import jakarta.validation.constraints.NotNull;

public record ArticleMoveRequest(
        @NotNull(message = "이동할 폴더를 선택해 주세요.") Long folderId,
        Integer sortOrder
) {
}
