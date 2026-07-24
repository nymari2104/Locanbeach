package com.locanbeach.backend.exception.errorcode;

import com.locanbeach.backend.common.exception.errorcode.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum PaymentErrorCode implements ErrorCode {
    PAYMENT_NOT_FOUND("PAYMENT_NOT_FOUND", "Không tìm thấy thông tin giao dịch thanh toán.", HttpStatus.NOT_FOUND),
    INVALID_WEBHOOK_SIGNATURE("INVALID_WEBHOOK_SIGNATURE", "Chữ ký xác thực Webhook không hợp lệ.", HttpStatus.UNAUTHORIZED),
    INVALID_PAYMENT_AMOUNT("INVALID_PAYMENT_AMOUNT", "Số tiền chuyển khoản không đủ tiền đặt cọc.", HttpStatus.BAD_REQUEST),
    PAYMENT_ALREADY_PROCESSED("PAYMENT_ALREADY_PROCESSED", "Giao dịch thanh toán này đã được xử lý trước đó.", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus statusCode;
}
