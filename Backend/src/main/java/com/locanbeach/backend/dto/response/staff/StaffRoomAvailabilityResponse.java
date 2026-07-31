package com.locanbeach.backend.dto.response.staff;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffRoomAvailabilityResponse {
    private UUID id;
    private String code;
    private String status; // "AVAILABLE", "HELD", "BOOKED", "DIRTY"
    private LocalDateTime holdExpiresAt;
    private String guestName;
    private UUID bookingId;
}
