package com.locanbeach.backend.service;

import com.locanbeach.backend.common.exception.AppException;
import com.locanbeach.backend.dto.PaymentDTO;
import com.locanbeach.backend.dto.PaymentQrResponse;
import com.locanbeach.backend.dto.PaymentWebhookRequest;
import com.locanbeach.backend.entity.Booking;
import com.locanbeach.backend.entity.Payment;
import com.locanbeach.backend.entity.enums.BookingStatus;
import com.locanbeach.backend.exception.errorcode.BookingErrorCode;
import com.locanbeach.backend.exception.errorcode.PaymentErrorCode;
import com.locanbeach.backend.repository.BookingRepository;
import com.locanbeach.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final VietQRService vietQRService;

    @Transactional(readOnly = true)
    public PaymentQrResponse createPaymentQr(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(BookingErrorCode.BOOKING_NOT_FOUND));

        BigDecimal depositAmount = booking.getDepositAmount() != null 
                ? booking.getDepositAmount() 
                : booking.getTotalAmount().multiply(new BigDecimal("0.30"));

        String transferContent = vietQRService.generateTransferContent(booking.getId());
        String qrImageUrl = vietQRService.generateQrImageUrl(depositAmount, transferContent);

        return PaymentQrResponse.builder()
                .bookingId(booking.getId())
                .bookingCode(booking.getId().toString().substring(0, 8).toUpperCase())
                .depositAmount(depositAmount)
                .totalAmount(booking.getTotalAmount())
                .bankName("MBBank")
                .bankAccountNo(vietQRService.getAccountNo())
                .bankAccountName(vietQRService.getAccountName())
                .transferContent(transferContent)
                .qrImageUrl(qrImageUrl)
                .status(booking.getStatus().name())
                .build();
    }

    @Transactional
    public PaymentDTO processWebhook(PaymentWebhookRequest request) {
        log.info("Processing Payment Webhook: transactionId={}, amount={}, content={}", 
                request.getTransactionId(), request.getAmount(), request.getContent());

        if (request.getTransactionId() != null && paymentRepository.existsByTransactionId(request.getTransactionId())) {
            log.warn("Transaction ID {} already processed", request.getTransactionId());
            Payment existing = paymentRepository.findByTransactionId(request.getTransactionId()).orElseThrow();
            return mapToDTO(existing);
        }

        String content = request.getContent() != null ? request.getContent() : "";
        List<Booking> pendingBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING_DEPOSIT)
                .filter(b -> content.toUpperCase().contains(b.getId().toString().substring(0, 8).toUpperCase()))
                .toList();

        if (pendingBookings.isEmpty()) {
            log.error("No PENDING_DEPOSIT booking found matching content: {}", content);
            throw new AppException(BookingErrorCode.BOOKING_NOT_FOUND);
        }

        Booking booking = pendingBookings.get(0);

        BigDecimal depositRequired = booking.getDepositAmount() != null 
                ? booking.getDepositAmount() 
                : booking.getTotalAmount().multiply(new BigDecimal("0.30"));

        if (request.getAmount() != null && request.getAmount().compareTo(depositRequired) < 0) {
            log.error("Paid amount {} is less than required deposit {}", request.getAmount(), depositRequired);
            throw new AppException(PaymentErrorCode.INVALID_PAYMENT_AMOUNT);
        }

        // Auto confirm booking!
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        Payment payment = Payment.builder()
                .booking(booking)
                .transactionId(request.getTransactionId() != null ? request.getTransactionId() : UUID.randomUUID().toString())
                .amount(request.getAmount() != null ? request.getAmount() : depositRequired)
                .paymentMethod(request.getGateway() != null ? request.getGateway() : "VIETQR")
                .transferContent(content)
                .status("SUCCESS")
                .paidAt(LocalDateTime.now())
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        log.info("Successfully processed payment and confirmed booking ID: {}", booking.getId());

        return mapToDTO(savedPayment);
    }

    @Transactional(readOnly = true)
    public PaymentQrResponse getPaymentStatus(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(BookingErrorCode.BOOKING_NOT_FOUND));

        return PaymentQrResponse.builder()
                .bookingId(booking.getId())
                .bookingCode(booking.getId().toString().substring(0, 8).toUpperCase())
                .depositAmount(booking.getDepositAmount())
                .totalAmount(booking.getTotalAmount())
                .status(booking.getStatus().name())
                .build();
    }

    private PaymentDTO mapToDTO(Payment payment) {
        return PaymentDTO.builder()
                .id(payment.getId())
                .bookingId(payment.getBooking().getId())
                .transactionId(payment.getTransactionId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .transferContent(payment.getTransferContent())
                .status(payment.getStatus())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
