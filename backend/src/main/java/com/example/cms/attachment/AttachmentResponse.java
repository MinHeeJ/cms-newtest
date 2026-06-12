package com.example.cms.attachment;

import java.time.OffsetDateTime;

public record AttachmentResponse(
        Long id,
        String refType,
        Long refId,
        String originalName,
        long sizeBytes,
        String contentType,
        String extension,
        OffsetDateTime createdAt) {
    public static AttachmentResponse from(Attachment attachment) {
        return new AttachmentResponse(
                attachment.getId(),
                attachment.getRefType(),
                attachment.getRefId(),
                attachment.getOriginalName(),
                attachment.getSizeBytes() == null ? 0 : attachment.getSizeBytes(),
                attachment.getContentType(),
                attachment.getExtension(),
                attachment.getCreatedAt());
    }
}
