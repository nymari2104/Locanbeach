package com.locanbeach.backend.exception.errorcode;

import com.locanbeach.backend.common.exception.errorcode.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum CouponErrorCode implements ErrorCode {
    COUPON_NOT_FOUND("COUPON_NOT_FOUND", "Mã giảm giá không tồn tại.", HttpStatus.NOT_FOUND),
    COUPON_INACTIVE("COUPON_INACTIVE", "Mã giảm giá hiện đang bị khóa hoặc ngưng áp dụng.", HttpStatus.BAD_REQUEST),
    COUPON_NOT_STARTED("COUPON_NOT_STARTED", "Mã giảm giá chưa đến thời gian áp dụng.", HttpStatus.BAD_REQUEST),
    COUPON_EXPIRED("COUPON_EXPIRED", "Mã giảm giá đã hết hạn sử dụng.", HttpStatus.BAD_REQUEST),
    COUPON_USAGE_LIMIT_EXCEEDED("COUPON_USAGE_LIMIT_EXCEEDED", "Mã giảm giá đã hết lượt sử dụng.", HttpStatus.BAD_REQUEST),
    MIN_BOOKING_AMOUNT_NOT_MET("MIN_BOOKING_AMOUNT_NOT_MET", "Tổng đơn giá chưa đạt giá trị tối thiểu để áp dụng mã giảm giá.", HttpStatus.BAD_REQUEST),
    MIN_LENGTH_OF_STAY_NOT_MET("MIN_LENGTH_OF_STAY_NOT_MET", "Số đêm lưu trú chưa đủ điều kiện áp dụng mã giảm giá này.", HttpStatus.BAD_REQUEST),
    COUPON_CODE_ALREADY_EXISTS("COUPON_CODE_ALREADY_EXISTS", "Mã giảm giá này đã tồn tại trong hệ thống.", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus statusCode;
}
