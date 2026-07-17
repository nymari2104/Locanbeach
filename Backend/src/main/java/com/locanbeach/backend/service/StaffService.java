package com.locanbeach.backend.service;

import com.locanbeach.backend.dto.response.UserResponse;
import com.locanbeach.backend.entity.enums.UserRole;
import com.locanbeach.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final UserRepository userRepository;

    public List<UserResponse> getHousekeepers() {
        return userRepository.findByRoleAndIsActiveTrue(UserRole.STAFF).stream()
                .map(user -> UserResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .fullName(user.getFullName())
                        .build())
                .collect(Collectors.toList());
    }
}
