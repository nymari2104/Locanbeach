package com.locanbeach.backend.service;

import com.locanbeach.backend.entity.Booking;
import com.locanbeach.backend.entity.enums.BookingStatus;
import com.locanbeach.backend.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingSchedulerService {

    private final BookingRepository bookingRepository;

    @Scheduled(fixedDelay = 30000) // Runs every 30 seconds
    @Transactional
    public void autoCancelExpiredPendingBookings() {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> expiredPendingBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING_DEPOSIT)
                .filter(b -> b.getExpiresAt() != null && b.getExpiresAt().isBefore(now))
                .toList();

        if (!expiredPendingBookings.isEmpty()) {
            for (Booking booking : expiredPendingBookings) {
                booking.setStatus(BookingStatus.CANCELLED);
                booking.setCancelledAt(now);
                booking.setCancelledReason("Quá thời gian thanh toán 10 phút (Tự động hủy bởi hệ thống)");
                bookingRepository.save(booking);
                log.info("AUTO-CANCELLED pending booking ID {} as expiresAt {} has passed", booking.getId(), booking.getExpiresAt());
            }
        }
    }
}
