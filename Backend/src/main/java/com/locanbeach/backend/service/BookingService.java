package com.locanbeach.backend.service;

import com.locanbeach.backend.common.exception.AppException;
import com.locanbeach.backend.exception.errorcode.BookingErrorCode;
import com.locanbeach.backend.dto.request.BookingConfirmRequest;
import com.locanbeach.backend.dto.request.RoomHoldRequest;
import com.locanbeach.backend.dto.response.BookingResponse;
import com.locanbeach.backend.dto.response.RoomHoldResponse;
import com.locanbeach.backend.entity.Accommodation;
import com.locanbeach.backend.entity.Booking;
import com.locanbeach.backend.entity.RoomHold;
import com.locanbeach.backend.entity.enums.BookingStatus;
import com.locanbeach.backend.repository.AccommodationRepository;
import com.locanbeach.backend.repository.BookingRepository;
import com.locanbeach.backend.repository.RoomHoldRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final AccommodationRepository accommodationRepository;
    private final RoomHoldRepository roomHoldRepository;
    private final BookingRepository bookingRepository;
    private final CouponService couponService;
    private final com.locanbeach.backend.repository.CouponRepository couponRepository;

    @Transactional
    public RoomHoldResponse holdRoom(RoomHoldRequest request) {
        if (request.getCheckinDate().toLocalDate().isBefore(java.time.LocalDate.now())) {
            throw new AppException(BookingErrorCode.INVALID_CHECKIN_STATUS, "Check-in date must be today or in the future");
        }

        if (!request.getCheckoutDate().isAfter(request.getCheckinDate())) {
            throw new AppException(BookingErrorCode.INVALID_CHECKIN_STATUS, "Check-out date must be after check-in date");
        }

        // Lock 1 available accommodation for the requested dates
        Accommodation accommodation = accommodationRepository.findAvailableAccommodationWithLock(
                request.getCategoryId(), request.getCheckinDate(), request.getCheckoutDate());
        
        if (accommodation == null) {
            throw new AppException(BookingErrorCode.NO_AVAILABLE_ROOM);
        }

        RoomHold roomHold = new RoomHold();
        roomHold.setAccommodation(accommodation);
        roomHold.setCheckinDate(request.getCheckinDate());
        roomHold.setCheckoutDate(request.getCheckoutDate());
        roomHold.setExpiresAt(LocalDateTime.now().plusMinutes(10));

        roomHold = roomHoldRepository.save(roomHold);

        return RoomHoldResponse.builder()
                .holdId(roomHold.getId())
                .expiresAt(roomHold.getExpiresAt())
                .build();
    }

    @Transactional
    public BookingResponse confirmBooking(BookingConfirmRequest request) {
        RoomHold roomHold = roomHoldRepository.findById(request.getHoldId())
                .orElseThrow(() -> new AppException(BookingErrorCode.HOLD_NOT_FOUND));

        if (roomHold.getExpiresAt().isBefore(LocalDateTime.now())) {
            roomHoldRepository.delete(roomHold);
            throw new AppException(BookingErrorCode.HOLD_EXPIRED);
        }

        Accommodation accommodation = roomHold.getAccommodation();
        
        long days = ChronoUnit.DAYS.between(
                roomHold.getCheckinDate().toLocalDate(), 
                roomHold.getCheckoutDate().toLocalDate());
        if (days <= 0) days = 1;
        
        BigDecimal originalTotalAmount = accommodation.getCategory().getBasePrice().multiply(BigDecimal.valueOf(days));
        BigDecimal finalTotalAmount = originalTotalAmount;
        BigDecimal discountAmount = BigDecimal.ZERO;
        com.locanbeach.backend.entity.Coupon appliedCoupon = null;

        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            com.locanbeach.backend.dto.ValidateCouponRequest validateReq = com.locanbeach.backend.dto.ValidateCouponRequest.builder()
                    .code(request.getCouponCode())
                    .totalAmount(originalTotalAmount)
                    .checkinDate(roomHold.getCheckinDate())
                    .checkoutDate(roomHold.getCheckoutDate())
                    .build();
            
            com.locanbeach.backend.dto.CouponDTO couponDTO = couponService.validateCoupon(validateReq);
            discountAmount = couponDTO.getDiscountAmount();
            finalTotalAmount = couponDTO.getFinalAmount();
            appliedCoupon = couponRepository.findById(couponDTO.getId()).orElse(null);
            
            if (appliedCoupon != null) {
                couponService.incrementCouponUsage(appliedCoupon);
            }
        }

        BigDecimal depositAmount = finalTotalAmount.multiply(new BigDecimal("0.3")); // 30% deposit

        Booking booking = new Booking();
        booking.setAccommodation(accommodation);
        booking.setGuestName(request.getGuestName());
        booking.setGuestPhone(request.getGuestPhone());
        booking.setGuestEmail(request.getGuestEmail());
        booking.setCheckinDate(roomHold.getCheckinDate());
        booking.setCheckoutDate(roomHold.getCheckoutDate());
        booking.setGuestsCount(request.getGuestsCount());
        booking.setNotes(request.getNotes());
        booking.setOriginalPrice(originalTotalAmount);
        booking.setDiscountAmount(discountAmount);
        booking.setTotalAmount(finalTotalAmount);
        booking.setCoupon(appliedCoupon);
        booking.setDepositAmount(depositAmount);
        booking.setStatus(BookingStatus.PENDING_DEPOSIT);

        booking = bookingRepository.save(booking);
        
        // Remove the hold since we created the booking
        roomHoldRepository.delete(roomHold);

        return BookingResponse.builder()
                .bookingId(booking.getId())
                .accommodationId(accommodation.getId())
                .accommodationCode(accommodation.getCode())
                .categoryId(accommodation.getCategory().getId())
                .categoryName(accommodation.getCategory().getName())
                .guestName(booking.getGuestName())
                .guestPhone(booking.getGuestPhone())
                .checkinDate(booking.getCheckinDate())
                .checkoutDate(booking.getCheckoutDate())
                .guestsCount(booking.getGuestsCount())
                .totalAmount(booking.getTotalAmount())
                .depositAmount(booking.getDepositAmount())
                .status(booking.getStatus())
                .build();
    }

    public org.springframework.data.domain.Page<BookingResponse> getBookings(
            String search, BookingStatus status, LocalDateTime startDate, LocalDateTime endDate, org.springframework.data.domain.Pageable pageable) {
        
        return bookingRepository.findBookingsWithFilters(search, status, startDate, endDate, pageable)
                .map(booking -> BookingResponse.builder()
                        .bookingId(booking.getId())
                        .accommodationId(booking.getAccommodation().getId())
                        .accommodationCode(booking.getAccommodation().getCode())
                        .categoryId(booking.getAccommodation().getCategory().getId())
                        .categoryName(booking.getAccommodation().getCategory().getName())
                        .guestName(booking.getGuestName())
                        .guestPhone(booking.getGuestPhone())
                        .checkinDate(booking.getCheckinDate())
                        .checkoutDate(booking.getCheckoutDate())
                        .guestsCount(booking.getGuestsCount())
                        .totalAmount(booking.getTotalAmount())
                        .depositAmount(booking.getDepositAmount())
                        .status(booking.getStatus())
                        .build());
    }
}
