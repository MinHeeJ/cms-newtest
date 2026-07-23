package com.cms.operations.dto;

import java.util.List;

public record PageResponse<T>(List<T> items, PageMeta page) {
    public static <T> PageResponse<T> of(List<T> items, int page, int size, long total) {
        int totalPages = size <= 0 ? 1 : (int) Math.ceil((double) total / (double) size);
        return new PageResponse<>(items, new PageMeta(page, size, total, totalPages));
    }
}
