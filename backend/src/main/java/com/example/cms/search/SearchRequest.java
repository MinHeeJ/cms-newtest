package com.example.cms.search;

public record SearchRequest(String query) {

    public String normalizedQuery() {
        String normalized = query == null ? "" : query.trim();
        if (normalized.isBlank()) {
            throw new IllegalArgumentException("검색어를 입력해 주세요.");
        }
        if (normalized.length() > 80) {
            throw new IllegalArgumentException("검색어는 80자 이하로 입력해 주세요.");
        }
        if (!normalized.matches(".*[A-Za-z0-9가-힣].*")) {
            throw new IllegalArgumentException("검색어에 문자 또는 숫자를 포함해 주세요.");
        }
        return normalized;
    }
}
