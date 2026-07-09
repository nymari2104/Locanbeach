package com.locanbeach.backend.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SearchAvailableRequest {

    @NotNull(message = "Check-in date is required")
    java.time.LocalDateTime checkinDate;

    @NotNull(message = "Check-out date is required")
    java.time.LocalDateTime checkoutDate;

    @Min(value = 1, message = "Guests count must be at least 1")
    Integer guestsCount;

    UUID categoryId; // Optional filter by specific category

    java.math.BigDecimal minPrice;

    java.math.BigDecimal maxPrice;

    com.locanbeach.backend.entity.enums.AccommodationType type;

    java.util.List<UUID> amenityIds;
}
