package com.locanbeach.backend.dto.response;

import com.locanbeach.backend.entity.enums.UserRole;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class LoginResponse {
    private String accessToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private UUID userId;
    private String username;
    private String fullName;
    private UserRole role;
}
