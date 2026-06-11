package com.example.cms.article.dto;

import com.example.cms.article.ArticleStatus;
import jakarta.validation.constraints.NotNull;

public record ArticleStatusRequest(
        @NotNull(message = "상태를 선택해 주세요.") ArticleStatus status
) {
}
