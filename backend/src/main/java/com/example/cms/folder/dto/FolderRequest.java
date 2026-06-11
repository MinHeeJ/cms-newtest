package com.example.cms.folder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FolderRequest(
        Long parentId,
        @NotBlank(message = "폴더명을 입력해 주세요.") @Size(max = 120, message = "폴더명은 120자 이하입니다.") String title,
        @Size(max = 500, message = "설명은 500자 이하입니다.") String description,
        Boolean active,
        Integer sortOrder
) {
}
