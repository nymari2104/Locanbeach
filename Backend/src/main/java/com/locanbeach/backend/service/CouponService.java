package com.locanbeach.backend.service;

import com.locanbeach.backend.common.exception.AppException;
import com.locanbeach.backend.dto.CouponDTO;
import com.locanbeach.backend.dto.ValidateCouponRequest;
import com.locanbeach.backend.entity.Coupon;
import com.locanbeach.backend.entity.enums.DiscountType;
import com.locanbeach.backend.exception.errorcode.CouponErrorCode;
import com.locanbeach.backend.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponService {

    private final CouponRepository couponRepository;

    @Transactional(readOnly = true)
    public CouponDTO validateCoupon(ValidateCouponRequest request) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(request.getCode().trim())
                .orElseThrow(() -> new AppException(CouponErrorCode.COUPON_NOT_FOUND));

        if (Boolean.FALSE.equals(coupon.getIsActive())) {
            throw new AppException(CouponErrorCode.COUPON_INACTIVE);
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(coupon.getStartDate())) {
            throw new AppException(CouponErrorCode.COUPON_NOT_STARTED);
        }
        if (now.isAfter(coupon.getEndDate())) {
            throw new AppException(CouponErrorCode.COUPON_EXPIRED);
        }

        if (coupon.getMaxUsage() != null && coupon.getCurrentUsage() >= coupon.getMaxUsage()) {
            throw new AppException(CouponErrorCode.COUPON_USAGE_LIMIT_EXCEEDED);
        }

        // Validate Length of stay
        if (request.getCheckinDate() != null && request.getCheckoutDate() != null) {
            long nights = ChronoUnit.DAYS.between(request.getCheckinDate().toLocalDate(), request.getCheckoutDate().toLocalDate());
            if (nights <= 0) nights = 1;
            if (coupon.getMinLengthOfStay() != null && nights < coupon.getMinLengthOfStay()) {
                throw new AppException(CouponErrorCode.MIN_LENGTH_OF_STAY_NOT_MET);
            }
        }

        BigDecimal totalAmount = request.getTotalAmount() != null ? request.getTotalAmount() : BigDecimal.ZERO;

        // Validate Minimum Booking Amount
        if (coupon.getMinBookingAmount() != null && totalAmount.compareTo(coupon.getMinBookingAmount()) < 0) {
            throw new AppException(CouponErrorCode.MIN_BOOKING_AMOUNT_NOT_MET);
        }

        // Calculate Discount
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (totalAmount.compareTo(BigDecimal.ZERO) > 0) {
            if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
                discountAmount = totalAmount.multiply(coupon.getDiscountValue())
                        .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                if (coupon.getMaxDiscountAmount() != null && discountAmount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                    discountAmount = coupon.getMaxDiscountAmount();
                }
            } else if (coupon.getDiscountType() == DiscountType.FIXED_AMOUNT) {
                discountAmount = coupon.getDiscountValue();
                if (discountAmount.compareTo(totalAmount) > 0) {
                    discountAmount = totalAmount;
                }
            }
        }

        BigDecimal finalAmount = totalAmount.subtract(discountAmount);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        CouponDTO dto = mapToDTO(coupon);
        dto.setDiscountAmount(discountAmount);
        dto.setFinalAmount(finalAmount);
        return dto;
    }

    @Transactional
    public void incrementCouponUsage(Coupon coupon) {
        if (coupon != null) {
            coupon.setCurrentUsage((coupon.getCurrentUsage() != null ? coupon.getCurrentUsage() : 0) + 1);
            couponRepository.save(coupon);
        }
    }

    @Transactional(readOnly = true)
    public List<CouponDTO> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CouponDTO getCouponById(UUID id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(CouponErrorCode.COUPON_NOT_FOUND));
        return mapToDTO(coupon);
    }

    @Transactional
    public CouponDTO createCoupon(CouponDTO dto) {
        if (couponRepository.existsByCodeIgnoreCase(dto.getCode().trim())) {
            throw new AppException(CouponErrorCode.COUPON_CODE_ALREADY_EXISTS);
        }

        Coupon coupon = Coupon.builder()
                .code(dto.getCode().trim().toUpperCase())
                .description(dto.getDescription())
                .discountType(dto.getDiscountType())
                .discountValue(dto.getDiscountValue())
                .minBookingAmount(dto.getMinBookingAmount())
                .maxDiscountAmount(dto.getMaxDiscountAmount())
                .minLengthOfStay(dto.getMinLengthOfStay() != null ? dto.getMinLengthOfStay() : 1)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .maxUsage(dto.getMaxUsage())
                .currentUsage(0)
                .maxUsagePerUser(dto.getMaxUsagePerUser() != null ? dto.getMaxUsagePerUser() : 1)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();

        return mapToDTO(couponRepository.save(coupon));
    }

    @Transactional
    public CouponDTO updateCoupon(UUID id, CouponDTO dto) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(CouponErrorCode.COUPON_NOT_FOUND));

        if (!coupon.getCode().equalsIgnoreCase(dto.getCode().trim()) && couponRepository.existsByCodeIgnoreCase(dto.getCode().trim())) {
            throw new AppException(CouponErrorCode.COUPON_CODE_ALREADY_EXISTS);
        }

        coupon.setCode(dto.getCode().trim().toUpperCase());
        coupon.setDescription(dto.getDescription());
        coupon.setDiscountType(dto.getDiscountType());
        coupon.setDiscountValue(dto.getDiscountValue());
        coupon.setMinBookingAmount(dto.getMinBookingAmount());
        coupon.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        coupon.setMinLengthOfStay(dto.getMinLengthOfStay() != null ? dto.getMinLengthOfStay() : 1);
        coupon.setStartDate(dto.getStartDate());
        coupon.setEndDate(dto.getEndDate());
        coupon.setMaxUsage(dto.getMaxUsage());
        if (dto.getIsActive() != null) {
            coupon.setIsActive(dto.getIsActive());
        }

        return mapToDTO(couponRepository.save(coupon));
    }

    @Transactional
    public CouponDTO toggleCouponStatus(UUID id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(CouponErrorCode.COUPON_NOT_FOUND));
        coupon.setIsActive(!Boolean.TRUE.equals(coupon.getIsActive()));
        return mapToDTO(couponRepository.save(coupon));
    }

    @Transactional
    public void deleteCoupon(UUID id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(CouponErrorCode.COUPON_NOT_FOUND));
        couponRepository.delete(coupon);
    }

    private CouponDTO mapToDTO(Coupon coupon) {
        return CouponDTO.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .minBookingAmount(coupon.getMinBookingAmount())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .minLengthOfStay(coupon.getMinLengthOfStay())
                .startDate(coupon.getStartDate())
                .endDate(coupon.getEndDate())
                .maxUsage(coupon.getMaxUsage())
                .currentUsage(coupon.getCurrentUsage())
                .maxUsagePerUser(coupon.getMaxUsagePerUser())
                .isActive(coupon.getIsActive())
                .createdAt(coupon.getCreatedAt())
                .build();
    }
}
