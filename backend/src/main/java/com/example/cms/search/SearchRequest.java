package com.example.cms.search;

public record SearchRequest(String q, Integer limit) {
    public String normalizedQuery() {
        if (q == null || q.isBlank()) {
            throw new IllegalArgumentException("검색어를 입력해 주세요.");
        }
        String value = q.trim();
        if (value.length() > 100) {
            throw new IllegalArgumentException("검색어는 100자 이하로 입력해 주세요.");
        }
        if (!value.matches(".*[\\p{L}\\p{N}].*")) {
            throw new IllegalArgumentException("검색어에 문자 또는 숫자를 포함해 주세요.");
        }
        return value;
    }

    public int normalizedLimit() {
        if (limit == null || limit < 1) {
            return 20;
        }
        return Math.min(limit, 50);
    }
}
