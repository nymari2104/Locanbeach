package com.locanbeach.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AmenityDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    UUID id;

    @NotBlank(message = "Amenity name must not be blank")
    String name;

    String icon;
}
