package com.locanbeach.backend.dto.response.staff;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffCategoryAvailabilityResponse {
    private UUID categoryId;
    private String categoryName;
    private String categoryCode;
    private BigDecimal basePrice;
    private Integer maxGuests;
    private Long totalRooms;
    private Long availableCount;
    private Long heldCount;
    private Long bookedCount;
    private List<String> images;
    private List<StaffRoomAvailabilityResponse> rooms;
}
