package com.locanbeach.backend.dto.request.staff;

import jakarta.validation.Valid;
import lombok.Data;
import java.util.List;

@Data
public class CheckInRequest {
    
    @Valid
    private List<GuestInputDTO> guests;
    
}
