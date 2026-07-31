package com.locanbeach.backend.dto;

import com.locanbeach.backend.entity.enums.ServiceGroup;
import com.locanbeach.backend.entity.enums.ServiceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    UUID id;

    @NotBlank(message = "Service name must not be blank")
    String name;

    @NotNull(message = "Service group is required")
    ServiceGroup group;

    String description;

    @PositiveOrZero(message = "Price must be greater than or equal to 0")
    BigDecimal price;

    String operatingHours;

    ServiceStatus status;

    @Builder.Default
    java.util.List<ImageDTO> images = new java.util.ArrayList<>();
}
