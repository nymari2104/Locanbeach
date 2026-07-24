package com.locanbeach.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HoldItem {
    private String itemId;
    private UUID categoryId;
    private String categoryName;
    private String categoryCode;
    private UUID accommodationId;
    private String accommodationCode;
    private LocalDateTime checkinDate;
    private LocalDateTime checkoutDate;
    private long numNights;
    private BigDecimal pricePerNight;
    private BigDecimal itemTotalAmount;
}
