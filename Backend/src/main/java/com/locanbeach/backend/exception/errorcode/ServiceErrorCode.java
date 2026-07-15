package com.locanbeach.backend.exception.errorcode;

import com.locanbeach.backend.common.exception.errorcode.ErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

public enum ServiceErrorCode implements ErrorCode {

    SERVICE_NOT_FOUND("SERVICE_NOT_FOUND", "Service not found", HttpStatus.NOT_FOUND),
    SERVICE_NAME_ALREADY_EXISTS("SERVICE_NAME_ALREADY_EXISTS", "Service name already exists", HttpStatus.CONFLICT);

    private final String code;
    private final String message;
    private final HttpStatusCode statusCode;

    ServiceErrorCode(String code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    @Override
    public String getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }

    @Override
    public HttpStatusCode getStatusCode() {
        return statusCode;
    }
}
