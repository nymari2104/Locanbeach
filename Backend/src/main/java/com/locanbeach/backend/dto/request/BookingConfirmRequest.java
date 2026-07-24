package com.locanbeach.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class BookingConfirmRequest {

    private UUID holdId; // Optional for backward compatibility / single hold

    @NotBlank(message = "Guest name is required")
    private String guestName;

    @NotBlank(message = "Guest phone is required")
    private String guestPhone;

    @Email(message = "Invalid email format")
    private String guestEmail;

    @NotNull(message = "Guests count is required")
    @Min(value = 1, message = "Guests count must be at least 1")
    private Integer guestsCount;

    private String notes;

    private String couponCode;
}
