package com.example.community.api;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

public record ErrorResponse(String code, String message, List<FieldError> fieldErrors) {
    public ErrorResponse(String code, String message) {
        this(code, message, List.of());
    }

    public record FieldError(String field, String code, String message) {
    }

    public static class ApiException extends RuntimeException {
        private final HttpStatus status;
        private final String code;
        private final List<FieldError> fieldErrors;

        public ApiException(HttpStatus status, String code, String message) {
            this(status, code, message, List.of());
        }

        public ApiException(HttpStatus status, String code, String message, List<FieldError> fieldErrors) {
            super(message);
            this.status = status;
            this.code = code;
            this.fieldErrors = fieldErrors;
        }

        public HttpStatus status() {
            return status;
        }

        public String code() {
            return code;
        }

        public List<FieldError> fieldErrors() {
            return fieldErrors;
        }
    }
}

@RestControllerAdvice
class ApiExceptionHandler {
    @ExceptionHandler(ErrorResponse.ApiException.class)
    ResponseEntity<ErrorResponse> handleApiException(ErrorResponse.ApiException exception) {
        return ResponseEntity.status(exception.status())
                .body(new ErrorResponse(exception.code(), exception.getMessage(), exception.fieldErrors()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException exception) {
        List<ErrorResponse.FieldError> fields = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> new ErrorResponse.FieldError(
                        error.getField(),
                        "INVALID_VALUE",
                        error.getDefaultMessage() == null ? "입력값을 확인해 주세요." : error.getDefaultMessage()))
                .toList();
        return ResponseEntity.badRequest()
                .body(new ErrorResponse("VALIDATION_FAILED", "입력값을 확인해 주세요.", fields));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ErrorResponse> handleUnknown(Exception exception) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("INTERNAL_ERROR", "요청을 처리하는 중 오류가 발생했습니다."));
    }
}
