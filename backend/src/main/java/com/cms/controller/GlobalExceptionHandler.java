package com.cms.controller;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.Map;
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String,Object>> handle(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of(
            "statusCode", ex.getStatusCode().value(),
            "error", ex.getReason() != null ? ex.getReason() : ex.getMessage(),
            "timestamp", Instant.now().toString()));
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,Object>> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
            "statusCode", 500, "error", ex.getMessage() != null ? ex.getMessage() : "서버 오류",
            "timestamp", Instant.now().toString()));
    }
}
