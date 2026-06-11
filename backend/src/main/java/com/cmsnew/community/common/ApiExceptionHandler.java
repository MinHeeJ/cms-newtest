package com.cmsnew.community.common;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
    public record ErrorResponse(String code, String message, List<FieldErrorResponse> fieldErrors) {
    }

    public record FieldErrorResponse(String field, String message) {
    }

    @ExceptionHandler(ApiErrorException.class)
    ResponseEntity<ErrorResponse> handleApiError(ApiErrorException exception) {
        return ResponseEntity
                .status(exception.status())
                .body(new ErrorResponse(exception.code(), exception.getMessage(), List.of()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException exception) {
        List<FieldErrorResponse> fieldErrors = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::toFieldError)
                .toList();
        return ResponseEntity
                .badRequest()
                .body(new ErrorResponse("VALIDATION_FAILED", "입력값을 다시 확인해주세요.", fieldErrors));
    }

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException exception) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("UNAUTHORIZED", "로그인이 필요한 요청입니다.", List.of()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException exception) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse("FORBIDDEN", "현재 계정으로 접근할 수 없습니다.", List.of()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ErrorResponse> handleConflict(DataIntegrityViolationException exception) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new ErrorResponse("CONFLICT", "이미 등록된 값이 있거나 중복 요청입니다.", List.of()));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ErrorResponse> handleUnexpected(Exception exception) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("INTERNAL_ERROR", "요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.", List.of()));
    }

    private FieldErrorResponse toFieldError(FieldError fieldError) {
        String message = fieldError.getDefaultMessage() == null ? "입력값을 확인해주세요." : fieldError.getDefaultMessage();
        return new FieldErrorResponse(fieldError.getField(), message);
    }
}
