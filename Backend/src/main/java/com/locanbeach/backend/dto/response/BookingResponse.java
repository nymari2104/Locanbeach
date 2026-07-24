package com.locanbeach.backend.dto.response;

import com.locanbeach.backend.entity.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private UUID bookingId;
    private UUID accommodationId;
    private String accommodationCode;
    private UUID categoryId;
    private String categoryName;
    private String guestName;
    private String guestPhone;
    private String guestEmail;
    private LocalDateTime checkinDate;
    private LocalDateTime checkoutDate;
    private Integer guestsCount;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal originalPrice;
    private BigDecimal depositAmount;
    private BookingStatus status;
    private LocalDateTime createdAt;
}
