package com.locanbeach.backend.controller;

import com.locanbeach.backend.common.dto.ApiResponse;
import com.locanbeach.backend.dto.AccommodationDTO;
import com.locanbeach.backend.dto.ComboEventDTO;
import com.locanbeach.backend.dto.ServiceDTO;
import com.locanbeach.backend.service.StaffLookupService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

import com.locanbeach.backend.dto.response.staff.StaffCategoryAvailabilityResponse;
import com.locanbeach.backend.service.StaffAccommodationService;

@RestController
@RequestMapping("/api/v1/staff")
@RequiredArgsConstructor
public class StaffLookupController {

    private final StaffLookupService staffLookupService;
    private final StaffAccommodationService staffAccommodationService;

    @GetMapping("/services")
    public ResponseEntity<ApiResponse<List<ServiceDTO>>> getServices() {
        return ResponseEntity.ok(
                ApiResponse.success("Fetched services successfully", staffLookupService.getServices()));
    }

    @GetMapping("/combos")
    public ResponseEntity<ApiResponse<List<ComboEventDTO>>> getCombos() {
        return ResponseEntity.ok(
                ApiResponse.success("Fetched combos successfully", staffLookupService.getCombos()));
    }

    @GetMapping("/accommodations/availability")
    public ResponseEntity<ApiResponse<List<StaffCategoryAvailabilityResponse>>> getAvailableAccommodations(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime checkinDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime checkoutDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        LocalDateTime start = checkinDate != null ? checkinDate : startDate;
        LocalDateTime end = checkoutDate != null ? checkoutDate : endDate;
        if (start == null) start = LocalDateTime.now();
        if (end == null) end = start.plusDays(1);

        return ResponseEntity.ok(
                ApiResponse.success("Fetched available accommodations", staffAccommodationService.getRoomAvailability(start, end)));
    }
}
