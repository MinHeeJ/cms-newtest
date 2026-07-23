package com.cms.operations.dto;

import java.util.List;
import java.util.UUID;

public record ApiResponse<T>(boolean success, T data, ApiError error, String traceId) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null, UUID.randomUUID().toString());
    }

    public static ApiResponse<Void> error(String code, String message, List<String> details) {
        return new ApiResponse<>(false, null, new ApiError(code, message, details == null ? List.of() : details), UUID.randomUUID().toString());
    }
}
