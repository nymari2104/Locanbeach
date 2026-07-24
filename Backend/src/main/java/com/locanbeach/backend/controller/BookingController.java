package com.locanbeach.backend.controller;

import com.locanbeach.backend.common.dto.ApiResponse;
import com.locanbeach.backend.dto.HoldSession;
import com.locanbeach.backend.dto.request.BookingConfirmRequest;
import com.locanbeach.backend.dto.request.RoomHoldRequest;
import com.locanbeach.backend.dto.response.BookingResponse;
import com.locanbeach.backend.dto.response.RoomHoldResponse;
import com.locanbeach.backend.entity.enums.BookingStatus;
import com.locanbeach.backend.service.BookingService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private static final String GUEST_COOKIE_NAME = "locan_guest_token";

    private final BookingService service;

    private String resolveOrCreateGuestToken(HttpServletRequest request, HttpServletResponse response) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (GUEST_COOKIE_NAME.equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().trim().isEmpty()) {
                    return cookie.getValue();
                }
            }
        }
        String newToken = UUID.randomUUID().toString();
        Cookie newCookie = new Cookie(GUEST_COOKIE_NAME, newToken);
        newCookie.setPath("/");
        newCookie.setMaxAge(86400); // 1 day
        newCookie.setHttpOnly(false); // Accessible to frontend js
        response.addCookie(newCookie);
        return newToken;
    }

    @GetMapping("/hold/session")
    public ResponseEntity<ApiResponse<HoldSession>> getHoldSession(HttpServletRequest request, HttpServletResponse response) {
        String token = resolveOrCreateGuestToken(request, response);
        return ResponseEntity.ok(ApiResponse.success("Lấy phiên giữ phòng thành công", service.getHoldSession(token)));
    }

    @PostMapping("/hold")
    public ResponseEntity<ApiResponse<RoomHoldResponse>> holdRoom(
            @Valid @RequestBody RoomHoldRequest body,
            HttpServletRequest request, 
            HttpServletResponse response) {
        String token = resolveOrCreateGuestToken(request, response);
        RoomHoldResponse holdRes = service.holdRoomWithToken(token, body);
        return new ResponseEntity<>(
                ApiResponse.success("Room held successfully for 7 minutes", holdRes),
                HttpStatus.CREATED);
    }

    @DeleteMapping("/hold/items/{itemId}")
    public ResponseEntity<ApiResponse<HoldSession>> removeHoldItem(
            @PathVariable String itemId,
            HttpServletRequest request,
            HttpServletResponse response) {
        String token = resolveOrCreateGuestToken(request, response);
        return ResponseEntity.ok(ApiResponse.success("Xóa phòng khỏi đơn giữ chỗ thành công", service.removeHoldItem(token, itemId)));
    }

    @DeleteMapping("/hold")
    public ResponseEntity<ApiResponse<Void>> releaseHoldSession(HttpServletRequest request, HttpServletResponse response) {
        String token = resolveOrCreateGuestToken(request, response);
        service.releaseHoldSession(token);
        return ResponseEntity.ok(ApiResponse.success("Giải phóng phiên giữ chỗ thành công", null));
    }

    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<BookingResponse>> confirmBooking(
            @Valid @RequestBody BookingConfirmRequest body,
            HttpServletRequest request,
            HttpServletResponse response) {
        String token = resolveOrCreateGuestToken(request, response);
        return new ResponseEntity<>(
                ApiResponse.success("Booking confirmed successfully", service.confirmBookingWithToken(token, body)),
                HttpStatus.CREATED);
    }

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
                ApiResponse.success("Get bookings successfully", service.getBookings(search, status, start, end, pageable)));
    }
}
