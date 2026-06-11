package com.example.cms.folder.dto;

import com.example.cms.folder.Folder;

import java.time.OffsetDateTime;

public record FolderResponse(
        Long id,
        Long parentId,
        String title,
        String description,
        boolean active,
        int sortOrder,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {

    public static FolderResponse from(Folder folder) {
        return new FolderResponse(
                folder.getId(),
                folder.getParentId(),
                folder.getTitle(),
                folder.getDescription(),
                Boolean.TRUE.equals(folder.getActive()),
                folder.getSortOrder() == null ? 0 : folder.getSortOrder(),
                folder.getCreatedAt(),
                folder.getUpdatedAt()
        );
    }
}
