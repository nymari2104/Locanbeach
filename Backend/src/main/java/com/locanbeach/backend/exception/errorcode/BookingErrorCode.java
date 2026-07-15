package com.locanbeach.backend.exception.errorcode;

import com.locanbeach.backend.common.exception.errorcode.ErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

public enum BookingErrorCode implements ErrorCode {

    BOOKING_NOT_FOUND("BOOKING_NOT_FOUND", "Booking not found", HttpStatus.NOT_FOUND),
    NO_AVAILABLE_ROOM("NO_AVAILABLE_ROOM", "No available rooms for the selected category and dates", HttpStatus.CONFLICT),
    HOLD_NOT_FOUND("HOLD_NOT_FOUND", "Hold not found or invalid", HttpStatus.NOT_FOUND),
    HOLD_EXPIRED("HOLD_EXPIRED", "Hold has expired. Please try booking again.", HttpStatus.GONE),
    INVALID_CHECKIN_STATUS("INVALID_CHECKIN_STATUS", "Cannot check-in from current booking status", HttpStatus.BAD_REQUEST),
    INVALID_CHECKOUT_STATUS("INVALID_CHECKOUT_STATUS", "Only checked-in bookings can be checked out", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatusCode statusCode;

    BookingErrorCode(String code, String message, HttpStatusCode statusCode) {
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
