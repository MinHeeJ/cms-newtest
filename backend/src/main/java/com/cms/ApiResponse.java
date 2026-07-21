package com.cms;

import java.time.OffsetDateTime;

public record ApiResponse<T>(boolean success, T data, ApiError error, OffsetDateTime timestamp) {
  public static <T> ApiResponse<T> ok(T data) { return new ApiResponse<>(true, data, null, OffsetDateTime.now()); }
  public static ApiResponse<Void> fail(String code, String message, String traceId) { return new ApiResponse<>(false, null, new ApiError(code, message, traceId), OffsetDateTime.now()); }
  public record ApiError(String code, String message, String traceId) {}
}
