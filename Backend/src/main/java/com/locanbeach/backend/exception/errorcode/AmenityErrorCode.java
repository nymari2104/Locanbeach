package com.locanbeach.backend.exception.errorcode;

import com.locanbeach.backend.common.exception.errorcode.ErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

public enum AmenityErrorCode implements ErrorCode {

    AMENITY_NOT_FOUND("AMENITY_NOT_FOUND", "Amenity not found", HttpStatus.NOT_FOUND);

    private final String code;
    private final String message;
    private final HttpStatusCode statusCode;

    AmenityErrorCode(String code, String message, HttpStatusCode statusCode) {
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
