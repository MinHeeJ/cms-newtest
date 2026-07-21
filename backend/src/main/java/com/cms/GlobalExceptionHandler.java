package com.cms;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Optional;
import java.util.UUID;

@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(ApiException.class)
  ResponseEntity<ApiResponse<Void>> api(ApiException ex, HttpServletRequest request) {
    String traceId = traceId(request);
    return ResponseEntity.status(ex.status()).body(ApiResponse.fail(ex.code(), ex.getMessage(), traceId));
  }
  @ExceptionHandler({IllegalArgumentException.class, MethodArgumentNotValidException.class})
  ResponseEntity<ApiResponse<Void>> validation(Exception ex, HttpServletRequest request) {
    return ResponseEntity.badRequest().body(ApiResponse.fail("VALIDATION_ERROR", safe(ex.getMessage()), traceId(request)));
  }
  @ExceptionHandler(Exception.class)
  ResponseEntity<ApiResponse<Void>> generic(Exception ex, HttpServletRequest request) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.fail("INTERNAL_ERROR", "요청 처리 중 오류가 발생했습니다. 운영자에게 traceId를 전달하세요.", traceId(request)));
  }
  private String traceId(HttpServletRequest request) {
    Object existing = request.getAttribute("traceId");
    if (existing != null) return String.valueOf(existing);
    String traceId = Optional.ofNullable(request.getHeader("X-Trace-Id")).filter(v -> !v.isBlank()).orElse(UUID.randomUUID().toString());
    request.setAttribute("traceId", traceId);
    return traceId;
  }
  private String safe(String message) {
    if (message == null || message.isBlank()) return "입력값을 확인하세요.";
    return message.replaceAll("(?i)[a-z0-9_$.]*exception", "오류");
  }
}
