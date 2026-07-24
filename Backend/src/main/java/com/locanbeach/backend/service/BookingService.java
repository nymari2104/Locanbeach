package com.locanbeach.backend.service;

import com.locanbeach.backend.common.exception.AppException;
import com.locanbeach.backend.dto.CouponDTO;
import com.locanbeach.backend.dto.HoldItem;
import com.locanbeach.backend.dto.HoldSession;
import com.locanbeach.backend.dto.ValidateCouponRequest;
import com.locanbeach.backend.dto.request.BookingConfirmRequest;
import com.locanbeach.backend.dto.request.RoomHoldRequest;
import com.locanbeach.backend.dto.response.BookingResponse;
import com.locanbeach.backend.dto.response.RoomHoldResponse;
import com.locanbeach.backend.entity.Accommodation;
import com.locanbeach.backend.entity.Booking;
import com.locanbeach.backend.entity.Coupon;
import com.locanbeach.backend.entity.RoomHold;
import com.locanbeach.backend.entity.enums.BookingStatus;
import com.locanbeach.backend.exception.errorcode.BookingErrorCode;
import com.locanbeach.backend.repository.AccommodationRepository;
import com.locanbeach.backend.repository.BookingRepository;
import com.locanbeach.backend.repository.CouponRepository;
import com.locanbeach.backend.repository.RoomHoldRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final AccommodationRepository accommodationRepository;
    private final RoomHoldRepository roomHoldRepository;
    private final BookingRepository bookingRepository;
    private final CouponService couponService;
    private final CouponRepository couponRepository;

    // In-memory hold session store per guest token
    private final Map<String, HoldSession> holdSessionStore = new ConcurrentHashMap<>();

    @Transactional(readOnly = true)
    public HoldSession getHoldSession(String guestToken) {
        HoldSession session = holdSessionStore.get(guestToken);
        if (session == null) {
            return HoldSession.builder()
                    .guestToken(guestToken)
                    .items(new ArrayList<>())
                    .totalAmount(BigDecimal.ZERO)
                    .depositAmount(BigDecimal.ZERO)
                    .build();
        }

        // Clean expired items
        cleanExpiredItems(session);
        recalculateSession(session);
        return session;
    }

    @Transactional
    public RoomHoldResponse holdRoom(RoomHoldRequest request) {
        return holdRoomWithToken(null, request);
    }

    @Transactional
    public RoomHoldResponse holdRoomWithToken(String guestToken, RoomHoldRequest request) {
        if (request.getCheckinDate().toLocalDate().isBefore(LocalDate.now())) {
            throw new AppException(BookingErrorCode.INVALID_CHECKIN_STATUS, "Check-in date must be today or in the future");
        }

        if (!request.getCheckoutDate().isAfter(request.getCheckinDate())) {
            throw new AppException(BookingErrorCode.INVALID_CHECKIN_STATUS, "Check-out date must be after check-in date");
        }

        // Lock 1 available accommodation
        Accommodation accommodation = accommodationRepository.findAvailableAccommodationWithLock(
                request.getCategoryId(), request.getCheckinDate(), request.getCheckoutDate());

        if (accommodation == null) {
            throw new AppException(BookingErrorCode.NO_AVAILABLE_ROOM);
        }

        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(7); // 7 minutes timer

        RoomHold roomHold = new RoomHold();
        roomHold.setAccommodation(accommodation);
        roomHold.setCheckinDate(request.getCheckinDate());
        roomHold.setCheckoutDate(request.getCheckoutDate());
        roomHold.setExpiresAt(expiresAt);

        roomHold = roomHoldRepository.save(roomHold);

        // If guestToken provided, update multi-room HoldSession
        if (guestToken != null && !guestToken.trim().isEmpty()) {
            HoldSession session = holdSessionStore.computeIfAbsent(guestToken, token -> HoldSession.builder()
                    .guestToken(token)
                    .items(new ArrayList<>())
                    .build());

            cleanExpiredItems(session);

            long days = ChronoUnit.DAYS.between(
                    request.getCheckinDate().toLocalDate(),
                    request.getCheckoutDate().toLocalDate());
            if (days <= 0) days = 1;

            BigDecimal itemTotal = accommodation.getCategory().getBasePrice().multiply(BigDecimal.valueOf(days));

            HoldItem item = HoldItem.builder()
                    .itemId(roomHold.getId().toString())
                    .categoryId(accommodation.getCategory().getId())
                    .categoryName(accommodation.getCategory().getName())
                    .categoryCode(accommodation.getCategory().getCode())
                    .accommodationId(accommodation.getId())
                    .accommodationCode(accommodation.getCode())
                    .checkinDate(request.getCheckinDate())
                    .checkoutDate(request.getCheckoutDate())
                    .numNights(days)
                    .pricePerNight(accommodation.getCategory().getBasePrice())
                    .itemTotalAmount(itemTotal)
                    .build();

            session.getItems().add(item);
            session.setExpiresAt(expiresAt);
            session.setExpiresAtTimestamp(expiresAt.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
            recalculateSession(session);
        }

        return RoomHoldResponse.builder()
                .holdId(roomHold.getId())
                .expiresAt(expiresAt)
                .build();
    }

    @Transactional
    public HoldSession removeHoldItem(String guestToken, String itemId) {
        HoldSession session = holdSessionStore.get(guestToken);
        if (session != null) {
            Iterator<HoldItem> iterator = session.getItems().iterator();
            while (iterator.hasNext()) {
                HoldItem item = iterator.next();
                if (item.getItemId().equalsIgnoreCase(itemId)) {
                    iterator.remove();
                    try {
                        roomHoldRepository.deleteById(UUID.fromString(itemId));
                    } catch (Exception e) {
                        log.warn("Could not delete room hold entity for item {}: {}", itemId, e.getMessage());
                    }
                    break;
                }
            }
            recalculateSession(session);
        }
        return getHoldSession(guestToken);
    }

    @Transactional
    public void releaseHoldSession(String guestToken) {
        HoldSession session = holdSessionStore.remove(guestToken);
        if (session != null) {
            for (HoldItem item : session.getItems()) {
                try {
                    roomHoldRepository.deleteById(UUID.fromString(item.getItemId()));
                } catch (Exception e) {
                    log.warn("Failed releasing hold item {}: {}", item.getItemId(), e.getMessage());
                }
            }
        }
    }

    @Transactional
    public BookingResponse confirmBooking(BookingConfirmRequest request) {
        return confirmBookingWithToken(null, request);
    }

    @Transactional
    public BookingResponse confirmBookingWithToken(String guestToken, BookingConfirmRequest request) {
        HoldSession session = guestToken != null ? holdSessionStore.get(guestToken) : null;

        // Fallback for single holdId
        if (session == null || session.getItems().isEmpty()) {
            if (request.getHoldId() == null) {
                throw new AppException(BookingErrorCode.HOLD_NOT_FOUND);
            }
            return confirmSingleHoldBooking(request);
        }

        // Multi-room session confirmation!
        cleanExpiredItems(session);
        if (session.getItems().isEmpty()) {
            throw new AppException(BookingErrorCode.HOLD_EXPIRED);
        }

        BigDecimal originalTotalAmount = BigDecimal.ZERO;
        List<Booking> createdBookings = new ArrayList<>();

        for (HoldItem item : session.getItems()) {
            originalTotalAmount = originalTotalAmount.add(item.getItemTotalAmount());
        }

        BigDecimal finalTotalAmount = originalTotalAmount;
        BigDecimal discountAmount = BigDecimal.ZERO;
        Coupon appliedCoupon = null;

        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            ValidateCouponRequest validateReq = ValidateCouponRequest.builder()
                    .code(request.getCouponCode())
                    .totalAmount(originalTotalAmount)
                    .checkinDate(session.getItems().get(0).getCheckinDate())
                    .checkoutDate(session.getItems().get(0).getCheckoutDate())
                    .build();

            CouponDTO couponDTO = couponService.validateCoupon(validateReq);
            discountAmount = couponDTO.getDiscountAmount();
            finalTotalAmount = couponDTO.getFinalAmount();
            appliedCoupon = couponRepository.findById(couponDTO.getId()).orElse(null);

            if (appliedCoupon != null) {
                couponService.incrementCouponUsage(appliedCoupon);
            }
        }

        BigDecimal depositAmount = finalTotalAmount.multiply(new BigDecimal("0.3")); // 30% deposit

        Booking firstBooking = null;

        for (HoldItem item : session.getItems()) {
            Accommodation accommodation = accommodationRepository.findById(item.getAccommodationId())
                    .orElseThrow(() -> new AppException(BookingErrorCode.NO_AVAILABLE_ROOM));

            Booking booking = new Booking();
            booking.setAccommodation(accommodation);
            booking.setGuestName(request.getGuestName());
            booking.setGuestPhone(request.getGuestPhone());
            booking.setGuestEmail(request.getGuestEmail());
            booking.setCheckinDate(item.getCheckinDate());
            booking.setCheckoutDate(item.getCheckoutDate());
            booking.setGuestsCount(request.getGuestsCount());
            booking.setNotes(request.getNotes());
            booking.setOriginalPrice(item.getItemTotalAmount());
            booking.setDiscountAmount(discountAmount);
            booking.setDepositAmount(depositAmount);
            booking.setTotalAmount(finalTotalAmount);

            if (appliedCoupon != null) {
                booking.setCoupon(appliedCoupon);
            }

            booking.setStatus(BookingStatus.PENDING_DEPOSIT);

            Booking saved = bookingRepository.save(booking);
            createdBookings.add(saved);

            if (firstBooking == null) {
                firstBooking = saved;
            }

            // Cleanup RoomHold
            try {
                roomHoldRepository.deleteById(UUID.fromString(item.getItemId()));
            } catch (Exception e) {
                log.warn("Error releasing room hold {}: {}", item.getItemId(), e.getMessage());
            }
        }

        // Clear session
        holdSessionStore.remove(guestToken);

        return mapToBookingResponse(firstBooking != null ? firstBooking : createdBookings.get(0));
    }

    private BookingResponse confirmSingleHoldBooking(BookingConfirmRequest request) {
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
        Coupon appliedCoupon = null;

        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            ValidateCouponRequest validateReq = ValidateCouponRequest.builder()
                    .code(request.getCouponCode())
                    .totalAmount(originalTotalAmount)
                    .checkinDate(roomHold.getCheckinDate())
                    .checkoutDate(roomHold.getCheckoutDate())
                    .build();

            CouponDTO couponDTO = couponService.validateCoupon(validateReq);
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
        booking.setDepositAmount(depositAmount);
        booking.setTotalAmount(finalTotalAmount);

        if (appliedCoupon != null) {
            booking.setCoupon(appliedCoupon);
        }

        booking.setStatus(BookingStatus.PENDING_DEPOSIT);

        bookingRepository.save(booking);
        roomHoldRepository.delete(roomHold);

        return mapToBookingResponse(booking);
    }

    private void cleanExpiredItems(HoldSession session) {
        if (session == null || session.getItems() == null) return;
        LocalDateTime now = LocalDateTime.now();
        Iterator<HoldItem> iterator = session.getItems().iterator();
        while (iterator.hasNext()) {
            HoldItem item = iterator.next();
            try {
                RoomHold roomHold = roomHoldRepository.findById(UUID.fromString(item.getItemId())).orElse(null);
                if (roomHold == null || roomHold.getExpiresAt().isBefore(now)) {
                    iterator.remove();
                    if (roomHold != null) {
                        roomHoldRepository.delete(roomHold);
                    }
                }
            } catch (Exception e) {
                iterator.remove();
            }
        }
    }

    private void recalculateSession(HoldSession session) {
        BigDecimal total = BigDecimal.ZERO;
        for (HoldItem item : session.getItems()) {
            total = total.add(item.getItemTotalAmount());
        }
        session.setTotalAmount(total);
        session.setDepositAmount(total.multiply(new BigDecimal("0.3")));
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<BookingResponse> getBookings(
            String search, BookingStatus status, LocalDateTime startDate, LocalDateTime endDate, org.springframework.data.domain.Pageable pageable) {
        return bookingRepository.findBookingsWithFilters(search, status, startDate, endDate, pageable)
                .map(this::mapToBookingResponse);
    }

    private BookingResponse mapToBookingResponse(Booking booking) {
        return BookingResponse.builder()
                .bookingId(booking.getId())
                .accommodationId(booking.getAccommodation().getId())
                .accommodationCode(booking.getAccommodation().getCode())
                .categoryId(booking.getAccommodation().getCategory().getId())
                .categoryName(booking.getAccommodation().getCategory().getName())
                .guestName(booking.getGuestName())
                .guestPhone(booking.getGuestPhone())
                .guestEmail(booking.getGuestEmail())
                .checkinDate(booking.getCheckinDate())
                .checkoutDate(booking.getCheckoutDate())
                .guestsCount(booking.getGuestsCount())
                .originalPrice(booking.getOriginalPrice())
                .discountAmount(booking.getDiscountAmount())
                .totalAmount(booking.getTotalAmount())
                .depositAmount(booking.getDepositAmount())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
