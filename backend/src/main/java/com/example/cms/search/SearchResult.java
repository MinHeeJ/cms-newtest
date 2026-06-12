package com.example.cms.search;

public record SearchResult(
        Long articleId,
        Long folderId,
        String title,
        String folderTitle,
        String snippet) {
}
