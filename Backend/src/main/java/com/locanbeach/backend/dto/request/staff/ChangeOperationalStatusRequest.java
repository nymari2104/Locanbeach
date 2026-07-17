package com.locanbeach.backend.dto.request.staff;

import com.locanbeach.backend.entity.enums.OperationalStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class ChangeOperationalStatusRequest {

    @NotNull(message = "Operational status is required")
    private OperationalStatus status;

    private UUID lastCleanedById;
}
