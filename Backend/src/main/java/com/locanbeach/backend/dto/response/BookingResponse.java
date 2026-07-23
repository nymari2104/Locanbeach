package com.locanbeach.backend.dto.response;

import com.locanbeach.backend.entity.enums.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class BookingResponse {
    private UUID bookingId;
    private UUID accommodationId;
    private String accommodationCode;
    private UUID categoryId;
    private String categoryName;
    private String guestName;
    private String guestPhone;
    private java.time.LocalDateTime checkinDate;
    private java.time.LocalDateTime checkoutDate;
    private Integer guestsCount;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal originalPrice;
    private BigDecimal depositAmount;
    private BookingStatus status;
}
