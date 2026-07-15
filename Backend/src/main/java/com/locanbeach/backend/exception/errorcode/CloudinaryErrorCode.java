package com.locanbeach.backend.exception.errorcode;

import com.locanbeach.backend.common.exception.errorcode.ErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

public enum CloudinaryErrorCode implements ErrorCode {

    UPLOAD_FAILED("CLOUDINARY_UPLOAD_FAILED", "Failed to upload file to Cloudinary", HttpStatus.INTERNAL_SERVER_ERROR),
    DELETE_FAILED("CLOUDINARY_DELETE_FAILED", "Failed to delete file from Cloudinary", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String message;
    private final HttpStatusCode statusCode;

    CloudinaryErrorCode(String code, String message, HttpStatusCode statusCode) {
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
