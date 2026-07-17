package com.locanbeach.backend.controller;

import com.locanbeach.backend.common.dto.ApiResponse;
import com.locanbeach.backend.dto.AccommodationDTO;
import com.locanbeach.backend.dto.request.staff.ChangeOperationalStatusRequest;
import com.locanbeach.backend.dto.response.UserResponse;
import com.locanbeach.backend.service.StaffAccommodationService;
import com.locanbeach.backend.service.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/staff/accommodations")
@RequiredArgsConstructor
public class StaffAccommodationController {

    private final StaffAccommodationService staffAccommodationService;
    private final StaffService staffService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AccommodationDTO>>> getAllAccommodations() {
        return ResponseEntity.ok(
                ApiResponse.success("Fetched accommodations successfully", staffAccommodationService.getAllAccommodations()));
    }

    @PutMapping("/{id}/operational-status")
    public ResponseEntity<ApiResponse<AccommodationDTO>> changeOperationalStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ChangeOperationalStatusRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Changed operational status successfully", staffAccommodationService.changeOperationalStatus(id, request)));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getHousekeepers() {
        return ResponseEntity.ok(
                ApiResponse.success("Fetched housekeepers successfully", staffService.getHousekeepers()));
    }
}
