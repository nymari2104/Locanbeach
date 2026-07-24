package com.locanbeach.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentWebhookRequest {
    private String transactionId;
    private BigDecimal amount;
    private String content;
    private String signature;
    private String gateway; // VIETQR, PAYOS, CASSO
}
