package com.locanbeach.backend.dto;

import com.locanbeach.backend.entity.enums.AccommodationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccommodationCategoryDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private UUID id;
    private String name;
    private String code;
    private AccommodationType type;
    private String description;
    private BigDecimal basePrice;
    private Integer maxGuests;
    private BigDecimal areaSqm;
    @Builder.Default
    private java.util.List<ImageDTO> images = new java.util.ArrayList<>();
    @Builder.Default
    private java.util.Set<UUID> amenityIds = new java.util.HashSet<>();
    @Builder.Default
    private java.util.List<AmenityDTO> amenities = new java.util.ArrayList<>();
}
