package com.locanbeach.backend.controller;

import com.locanbeach.backend.common.dto.ApiResponse;
import com.locanbeach.backend.dto.AccommodationDTO;
import com.locanbeach.backend.service.AccommodationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/accommodations")
@RequiredArgsConstructor
public class AccommodationController {

    private final AccommodationService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AccommodationDTO>>> getAllAccommodations() {
        return ResponseEntity.ok(
                ApiResponse.success("Get all accommodations successfully", service.getAllAccommodations()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AccommodationDTO>> getAccommodationById(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.success("Get accommodation details successfully", service.getAccommodationById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AccommodationDTO>> createAccommodation(@RequestBody AccommodationDTO dto) {
        return new ResponseEntity<>(
                ApiResponse.success("Accommodation created successfully", service.createAccommodation(dto)),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AccommodationDTO>> updateAccommodation(
            @PathVariable UUID id, @RequestBody AccommodationDTO dto) {
        return ResponseEntity.ok(
                ApiResponse.success("Accommodation updated successfully", service.updateAccommodation(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAccommodation(@PathVariable UUID id) {
        service.deleteAccommodation(id);
        return ResponseEntity.ok(
                ApiResponse.success("Accommodation deleted successfully", null));
    }
}
