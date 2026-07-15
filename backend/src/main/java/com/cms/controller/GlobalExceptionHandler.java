package com.cms.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String,Object>> validation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        List<Map<String,String>> violations = ex.getBindingResult().getFieldErrors().stream().map(error -> Map.of("field", error.getField(), "message", "입력값을 확인하세요.")).toList();
        return error(req, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "필수 입력값을 확인하세요.", violations);
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<Map<String,Object>> status(ResponseStatusException ex, HttpServletRequest req) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        return error(req, status, status == HttpStatus.NOT_FOUND ? "NOT_FOUND" : "REQUEST_ERROR", "요청을 처리할 수 없습니다.", List.of());
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String,Object>> generic(Exception ex, HttpServletRequest req) {
        return error(req, HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "요청을 처리하는 중 오류가 발생했습니다.", List.of());
    }

    private ResponseEntity<Map<String,Object>> error(HttpServletRequest req, HttpStatus status, String code, String message, List<?> violations) {
        Map<String,Object> body = new LinkedHashMap<>();
        body.put("success", false);
        body.put("data", null);
        body.put("requestId", Optional.ofNullable(req.getHeader("X-Request-Id")).orElse(UUID.randomUUID().toString()));
        body.put("timestamp", OffsetDateTime.now().toString());
        body.put("meta", Map.of("page", 0, "size", 20, "totalElements", 0, "totalPages", 0));
        body.put("error", Map.of("code", code, "message", message, "violations", violations));
        return ResponseEntity.status(status).body(body);
    }
}
