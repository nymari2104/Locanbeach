package com.locanbeach.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentQrResponse {
    private UUID bookingId;
    private String bookingCode;
    private BigDecimal depositAmount;
    private BigDecimal totalAmount;
    private String bankName;
    private String bankAccountNo;
    private String bankAccountName;
    private String transferContent;
    private String qrImageUrl;
    private String status;
}
