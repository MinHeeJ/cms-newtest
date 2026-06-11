package com.example.cms.article.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ArticleRequest(
        @NotNull(message = "폴더를 선택해 주세요.") Long folderId,
        @NotBlank(message = "문서 제목을 입력해 주세요.") @Size(max = 200, message = "문서 제목은 200자 이하입니다.") String title,
        @NotBlank(message = "문서 본문을 입력해 주세요.") String bodyMarkdown,
        Integer sortOrder
) {
}
