package com.locanbeach.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HoldSession {
    private String guestToken;
    @Builder.Default
    private List<HoldItem> items = new ArrayList<>();
    private BigDecimal totalAmount;
    private BigDecimal depositAmount;
    private LocalDateTime expiresAt;
    private long expiresAtTimestamp;
}
