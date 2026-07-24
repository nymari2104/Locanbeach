package com.locanbeach.backend.service;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
@Getter
public class VietQRService {

    @Value("${app.payment.bank-id:mb}")
    private String bankId;

    @Value("${app.payment.account-no:0987654321}")
    private String accountNo;

    @Value("${app.payment.account-name:THE HOUSE LOC AN BEACH}")
    private String accountName;

    @Value("${app.payment.template:compact2}")
    private String template;

    public String generateTransferContent(UUID bookingId) {
        String shortId = bookingId.toString().substring(0, 8).toUpperCase();
        return "LOCAN " + shortId;
    }

    public String generateQrImageUrl(BigDecimal amount, String addInfo) {
        try {
            String encodedAccountName = URLEncoder.encode(accountName, StandardCharsets.UTF_8);
            String encodedAddInfo = URLEncoder.encode(addInfo, StandardCharsets.UTF_8);

            return String.format(
                "https://img.vietqr.io/image/%s-%s-%s.png?amount=%s&addInfo=%s&accountName=%s",
                bankId,
                accountNo,
                template,
                amount.toBigInteger().toString(),
                encodedAddInfo,
                encodedAccountName
            );
        } catch (Exception e) {
            return String.format(
                "https://img.vietqr.io/image/%s-%s-%s.png?amount=%s",
                bankId, accountNo, template, amount.toBigInteger().toString()
            );
        }
    }
}
