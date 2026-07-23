package com.locanbeach.backend.controller;

import com.locanbeach.backend.common.dto.ApiResponse;
import com.locanbeach.backend.dto.CouponDTO;
import com.locanbeach.backend.dto.ValidateCouponRequest;
import com.locanbeach.backend.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<CouponDTO>> validateCoupon(@Valid @RequestBody ValidateCouponRequest request) {
        CouponDTO result = couponService.validateCoupon(request);
        return ResponseEntity.ok(ApiResponse.success("Áp dụng mã giảm giá thành công", result));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CouponDTO>>> getAllCoupons() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách mã giảm giá thành công", couponService.getAllCoupons()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CouponDTO>> getCouponById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết mã giảm giá thành công", couponService.getCouponById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CouponDTO>> createCoupon(@Valid @RequestBody CouponDTO dto) {
        CouponDTO created = couponService.createCoupon(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo mã giảm giá thành công", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CouponDTO>> updateCoupon(@PathVariable UUID id, @Valid @RequestBody CouponDTO dto) {
        CouponDTO updated = couponService.updateCoupon(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật mã giảm giá thành công", updated));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<CouponDTO>> toggleCouponStatus(@PathVariable UUID id) {
        CouponDTO updated = couponService.toggleCouponStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Thay đổi trạng thái mã thành công", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable UUID id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa mã giảm giá thành công", null));
    }
}
