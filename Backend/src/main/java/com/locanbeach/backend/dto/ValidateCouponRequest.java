package com.locanbeach.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidateCouponRequest {

    @NotBlank(message = "Mã coupon không được để trống")
    private String code;

    private BigDecimal totalAmount;

    private LocalDateTime checkinDate;

    private LocalDateTime checkoutDate;
}
