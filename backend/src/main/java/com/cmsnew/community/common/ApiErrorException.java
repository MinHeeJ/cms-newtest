package com.cmsnew.community.common;

import org.springframework.http.HttpStatus;

public class ApiErrorException extends RuntimeException {
    private final HttpStatus status;
    private final String code;

    public ApiErrorException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public HttpStatus status() {
        return status;
    }

    public String code() {
        return code;
    }

    public static ApiErrorException badRequest(String message) {
        return new ApiErrorException(HttpStatus.BAD_REQUEST, "BAD_REQUEST", message);
    }

    public static ApiErrorException unauthorized(String message) {
        return new ApiErrorException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", message);
    }

    public static ApiErrorException forbidden(String message) {
        return new ApiErrorException(HttpStatus.FORBIDDEN, "FORBIDDEN", message);
    }

    public static ApiErrorException notFound(String message) {
        return new ApiErrorException(HttpStatus.NOT_FOUND, "NOT_FOUND", message);
    }

    public static ApiErrorException conflict(String message) {
        return new ApiErrorException(HttpStatus.CONFLICT, "CONFLICT", message);
    }
}
