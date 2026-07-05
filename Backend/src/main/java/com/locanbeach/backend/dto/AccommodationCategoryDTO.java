package com.locanbeach.backend.dto;

import com.locanbeach.backend.entity.enums.AccommodationType;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class AccommodationCategoryDTO {
    private UUID id;
    private String name;
    private String code;
    private AccommodationType type;
    private String description;
    private BigDecimal basePrice;
    private Integer maxGuests;
    private BigDecimal areaSqm;
}
