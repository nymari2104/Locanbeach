package com.locanbeach.backend.dto.request.staff;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GuestInputDTO {
    
    private String id;
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    @NotBlank(message = "Identity card/CCCD is required")
    private String identityCard;
    
    private String phone;
    
    private String gender;
    
    private String dateOfBirth;
    
    private String address;
}
