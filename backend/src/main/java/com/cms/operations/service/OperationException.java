package com.cms.operations.service;

import org.springframework.http.HttpStatus;
import java.util.List;

public class OperationException extends RuntimeException {
    private final HttpStatus status;
    private final String code;
    private final List<String> details;

    public OperationException(HttpStatus status, String code, String message) {
        this(status, code, message, List.of());
    }

    public OperationException(HttpStatus status, String code, String message, List<String> details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }

    public HttpStatus status() { return status; }
    public String code() { return code; }
    public List<String> details() { return details; }
}
