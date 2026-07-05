package com.locanbeach.backend.dto;

import com.locanbeach.backend.entity.enums.AccommodationStatus;
import com.locanbeach.backend.entity.enums.OperationalStatus;
import lombok.Data;

import java.util.UUID;

@Data
public class AccommodationDTO {
    private UUID id;
    private UUID categoryId;
    private String categoryName; // Read-only info from Category
    private String code;
    private String metadata;
    private AccommodationStatus status;
    private OperationalStatus operationalStatus;
}
