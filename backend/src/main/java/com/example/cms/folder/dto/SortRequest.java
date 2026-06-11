package com.example.cms.folder.dto;

import jakarta.validation.constraints.NotNull;

public record SortRequest(
        @NotNull(message = "정렬 순서를 입력해 주세요.") Integer sortOrder
) {
}
