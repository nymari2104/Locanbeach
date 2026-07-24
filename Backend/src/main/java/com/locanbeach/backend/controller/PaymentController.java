package com.locanbeach.backend.controller;

import com.locanbeach.backend.common.dto.ApiResponse;
import com.locanbeach.backend.dto.PaymentDTO;
import com.locanbeach.backend.dto.PaymentQrResponse;
import com.locanbeach.backend.dto.PaymentWebhookRequest;
import com.locanbeach.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-qr")
    public ResponseEntity<ApiResponse<PaymentQrResponse>> createPaymentQr(@RequestBody Map<String, UUID> request) {
        UUID bookingId = request.get("bookingId");
        PaymentQrResponse response = paymentService.createPaymentQr(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Tạo mã VietQR thanh toán thành công", response));
    }

    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<PaymentDTO>> processWebhook(@RequestBody PaymentWebhookRequest request) {
        PaymentDTO payment = paymentService.processWebhook(request);
        return ResponseEntity.ok(ApiResponse.success("Xử lý webhook thanh toán thành công", payment));
    }

    @GetMapping("/booking/{bookingId}/status")
    public ResponseEntity<ApiResponse<PaymentQrResponse>> getPaymentStatus(@PathVariable UUID bookingId) {
        PaymentQrResponse response = paymentService.getPaymentStatus(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Lấy trạng thái thanh toán thành công", response));
    }
}
