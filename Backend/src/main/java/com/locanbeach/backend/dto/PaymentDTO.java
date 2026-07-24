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
public class PaymentDTO {
    private UUID id;
    private UUID bookingId;
    private String transactionId;
    private BigDecimal amount;
    private String paymentMethod;
    private String transferContent;
    private String status;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}
