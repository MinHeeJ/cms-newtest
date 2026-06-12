package com.example.cms.folder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FolderUpsertRequest(
        Long parentId,
        @NotBlank @Size(max = 160) String title,
        @Size(max = 500) String description,
        Boolean active,
        Integer sortOrder) {
}
