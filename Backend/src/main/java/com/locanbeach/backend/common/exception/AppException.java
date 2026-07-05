package com.locanbeach.backend.common.exception;

import com.locanbeach.backend.common.exception.errorcode.ErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

public class AppException extends RuntimeException {

    private final ErrorCode errorCode;
    private final String customMessage;

    public AppException(ErrorCode errorCode) {
        super(errorCode != null ? errorCode.getMessage() : "Unknown error");
        this.errorCode = errorCode;
        this.customMessage = null;
    }

    public AppException(ErrorCode errorCode, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
        this.customMessage = customMessage;
    }

    public String getErrorCode() {
        return errorCode != null ? errorCode.getCode() : "UNKNOWN_ERROR";
    }

    public String getErrorMessage() {
        if (customMessage != null && !customMessage.isEmpty()) {
            return customMessage;
        }
        return errorCode != null ? errorCode.getMessage() : "Unknown error";
    }

    public HttpStatusCode getStatusCode() {
        return errorCode != null ? errorCode.getStatusCode() : HttpStatus.INTERNAL_SERVER_ERROR;
    }
}
