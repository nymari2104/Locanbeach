package com.locanbeach.backend.dto;

import com.locanbeach.backend.entity.enums.DiscountType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponDTO {
    private UUID id;
    private String code;
    private String description;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minBookingAmount;
    private BigDecimal maxDiscountAmount;
    private Integer minLengthOfStay;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer maxUsage;
    private Integer currentUsage;
    private Integer maxUsagePerUser;
    private Boolean isActive;
    private LocalDateTime createdAt;

    // Additional calculation properties for validate response
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
}
