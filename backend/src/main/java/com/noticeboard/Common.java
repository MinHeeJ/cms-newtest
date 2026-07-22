package com.noticeboard;

import jakarta.validation.ConstraintViolationException;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

record ApiResponse<T>(boolean success, T data, String error, String message) {
  static <T> ApiResponse<T> ok(T data) { return new ApiResponse<>(true, data, null, null); }
  static ApiResponse<Object> empty() { return new ApiResponse<>(true, null, null, null); }
  static ApiResponse<Object> fail(String error, String message) { return new ApiResponse<>(false, null, error, message); }
}

class ApiException extends RuntimeException {
  final HttpStatus status; final String code;
  ApiException(HttpStatus status, String code, String message) { super(message); this.status = status; this.code = code; }
}

@RestControllerAdvice
class GlobalExceptionHandler {
  @ExceptionHandler(ApiException.class) ResponseEntity<ApiResponse<Object>> api(ApiException e) {
    return ResponseEntity.status(e.status).body(ApiResponse.fail(e.code, e.getMessage()));
  }
  @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<ApiResponse<Object>> validation(MethodArgumentNotValidException e) {
    FieldError f = e.getBindingResult().getFieldErrors().stream().findFirst().orElse(null);
    String msg = f == null ? "입력값이 올바르지 않습니다." : f.getDefaultMessage();
    return ResponseEntity.badRequest().body(ApiResponse.fail("VALIDATION_ERROR", msg));
  }
  @ExceptionHandler(ConstraintViolationException.class) ResponseEntity<ApiResponse<Object>> constraint(ConstraintViolationException e) {
    return ResponseEntity.badRequest().body(ApiResponse.fail("VALIDATION_ERROR", "입력값이 올바르지 않습니다."));
  }
  @ExceptionHandler(AccessDeniedException.class) ResponseEntity<ApiResponse<Object>> denied(AccessDeniedException e) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.fail("FORBIDDEN", "권한이 없습니다."));
  }
  @ExceptionHandler(AuthenticationException.class) ResponseEntity<ApiResponse<Object>> unauth(AuthenticationException e) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.fail("UNAUTHORIZED", "인증이 필요합니다."));
  }
  @ExceptionHandler(ResponseStatusException.class) ResponseEntity<ApiResponse<Object>> response(ResponseStatusException e) {
    var status = HttpStatus.valueOf(e.getStatusCode().value());
    String code = switch (status.value()) { case 401 -> "UNAUTHORIZED"; case 403 -> "FORBIDDEN"; case 404 -> "NOT_FOUND"; case 400 -> "VALIDATION_ERROR"; default -> "INTERNAL_SERVER_ERROR"; };
    return ResponseEntity.status(status).body(ApiResponse.fail(code, e.getReason() == null ? status.getReasonPhrase() : e.getReason()));
  }
  @ExceptionHandler(Exception.class) ResponseEntity<ApiResponse<Object>> generic(Exception e) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.fail("INTERNAL_SERVER_ERROR", "서버 오류가 발생했습니다."));
  }
}
