package com.locanbeach.backend.dto.request.staff;

import com.locanbeach.backend.entity.enums.GuestIdType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AddBookingGuestRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    private LocalDate dob;
    private String gender;
    private String nationality;
    private GuestIdType idType;
    private String idNumber;
    private String phone;
    private String email;
    private boolean isPrimary;
}
