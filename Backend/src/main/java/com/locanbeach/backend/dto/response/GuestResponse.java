package com.locanbeach.backend.dto.response;

import com.locanbeach.backend.entity.enums.GuestIdType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestResponse {
    private UUID id;
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
