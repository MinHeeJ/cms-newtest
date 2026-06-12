package com.example.community.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class FieldValidationError {
    @Column(name = "field_name", nullable = false)
    private String field;

    @Column(name = "error_code", nullable = false)
    private String code;

    @Column(name = "message", nullable = false)
    private String message;

    protected FieldValidationError() {
    }

    public FieldValidationError(String field, String code, String message) {
        this.field = field;
        this.code = code;
        this.message = message;
    }

    public String getField() {
        return field;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
