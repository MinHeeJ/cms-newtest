package com.example.cms.attachment.dto;

import com.example.cms.attachment.Attachment;

import java.time.OffsetDateTime;

public record AttachmentResponse(
        Long id,
        String originalName,
        long sizeBytes,
        String contentType,
        String extension,
        OffsetDateTime createdAt
) {

    public static AttachmentResponse from(Attachment attachment) {
        return new AttachmentResponse(
                attachment.getId(),
                attachment.getOriginalName(),
                attachment.getSizeBytes() == null ? 0 : attachment.getSizeBytes(),
                attachment.getContentType(),
                attachment.getExtension(),
                attachment.getCreatedAt()
        );
    }
}
