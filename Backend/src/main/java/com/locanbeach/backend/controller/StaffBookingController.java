package com.locanbeach.backend.controller;

import com.locanbeach.backend.common.dto.ApiResponse;
import com.locanbeach.backend.dto.request.staff.AddBookingComboRequest;
import com.locanbeach.backend.dto.request.staff.AddBookingGuestRequest;
import com.locanbeach.backend.dto.request.staff.AddBookingServiceRequest;
import com.locanbeach.backend.dto.request.staff.ChangeBookingStatusRequest;
import com.locanbeach.backend.dto.response.BookingResponse;
import com.locanbeach.backend.entity.enums.BookingStatus;
import com.locanbeach.backend.service.StaffBookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/staff/bookings")
@RequiredArgsConstructor
public class StaffBookingController {

    private final StaffBookingService staffBookingService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getBookings(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Sort sort = direction.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime end = endDate != null ? endDate.atTime(23, 59, 59) : null;
        
        return ResponseEntity.ok(
                ApiResponse.success("Fetched bookings successfully", staffBookingService.getBookings(search, status, start, end, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.success("Fetched booking details successfully", staffBookingService.getBookingDetails(id)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> changeBookingStatus(
            @PathVariable UUID id, 
            @Valid @RequestBody ChangeBookingStatusRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Changed booking status successfully", staffBookingService.changeBookingStatus(id, request)));
    }

    @PostMapping("/{id}/check-in")
    public ResponseEntity<ApiResponse<BookingResponse>> checkIn(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.success("Checked in successfully", staffBookingService.checkIn(id)));
    }

    @PostMapping("/{id}/check-out")
    public ResponseEntity<ApiResponse<BookingResponse>> checkOut(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.success("Checked out successfully", staffBookingService.checkOut(id)));
    }

    @PostMapping("/{id}/guests")
    public ResponseEntity<ApiResponse<Void>> addGuest(
            @PathVariable UUID id, 
            @Valid @RequestBody AddBookingGuestRequest request) {
        staffBookingService.addGuest(id, request);
        return ResponseEntity.ok(ApiResponse.success("Added guest successfully", null));
    }

    @PostMapping("/{id}/services")
    public ResponseEntity<ApiResponse<Void>> addService(
            @PathVariable UUID id, 
            @Valid @RequestBody AddBookingServiceRequest request) {
        staffBookingService.addService(id, request);
        return ResponseEntity.ok(ApiResponse.success("Added service successfully", null));
    }

    @PostMapping("/{id}/combos")
    public ResponseEntity<ApiResponse<Void>> addCombo(
            @PathVariable UUID id, 
            @Valid @RequestBody AddBookingComboRequest request) {
        staffBookingService.addCombo(id, request);
        return ResponseEntity.ok(ApiResponse.success("Added combo successfully", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBooking(@PathVariable UUID id) {
        staffBookingService.deleteBooking(id);
        return ResponseEntity.ok(ApiResponse.success("Booking deleted successfully", null));
    }
}
