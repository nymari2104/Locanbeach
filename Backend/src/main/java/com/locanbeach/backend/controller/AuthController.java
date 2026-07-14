package com.locanbeach.backend.controller;

import com.locanbeach.backend.common.dto.ApiResponse;
import com.locanbeach.backend.dto.request.LoginRequest;
import com.locanbeach.backend.dto.response.LoginResponse;
import com.locanbeach.backend.entity.User;
import com.locanbeach.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/v1/auth/login
     * Đăng nhập và nhận JWT token
     */
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success("Đăng nhập thành công", authService.login(request));
    }

    /**
     * GET /api/v1/auth/me
     * Lấy thông tin user đang đăng nhập (cần JWT)
     */
    @GetMapping("/me")
    public ApiResponse<LoginResponse> me(@AuthenticationPrincipal User user) {
        LoginResponse response = LoginResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
        return ApiResponse.success("Lấy thông tin thành công", response);
    }
}
