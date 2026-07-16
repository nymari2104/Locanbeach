package com.locanbeach.backend.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class RoomHoldRequest {

    @NotNull(message = "Category ID is required")
    private UUID categoryId;

    @NotNull(message = "Check-in date is required")
    private java.time.LocalDateTime checkinDate;

    @NotNull(message = "Check-out date is required")
    @Future(message = "Check-out date must be in the future")
    private java.time.LocalDateTime checkoutDate;
}
