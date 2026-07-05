package com.locanbeach.backend.exception.errorcode;

import com.locanbeach.backend.common.exception.errorcode.ErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

public enum AccommodationErrorCode implements ErrorCode {

    CATEGORY_NOT_FOUND("CATEGORY_NOT_FOUND", "Accommodation category not found", HttpStatus.NOT_FOUND),
    ACCOMMODATION_NOT_FOUND("ACCOMMODATION_NOT_FOUND", "Accommodation not found", HttpStatus.NOT_FOUND),
    CATEGORY_CODE_ALREADY_EXISTS("CATEGORY_CODE_ALREADY_EXISTS", "Category code already exists", HttpStatus.BAD_REQUEST),
    ACCOMMODATION_CODE_ALREADY_EXISTS("ACCOMMODATION_CODE_ALREADY_EXISTS", "Accommodation code already exists", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatusCode statusCode;

    AccommodationErrorCode(String code, String message, HttpStatusCode statusCode) {
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
