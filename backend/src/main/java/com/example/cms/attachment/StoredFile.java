package com.example.cms.attachment;

public record StoredFile(
        String storageKey,
        String originalName,
        long sizeBytes,
        String contentType,
        String extension
) {
}
