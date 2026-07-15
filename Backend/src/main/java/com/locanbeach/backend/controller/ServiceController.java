package com.locanbeach.backend.controller;

import com.locanbeach.backend.common.dto.ApiResponse;
import com.locanbeach.backend.dto.ServiceDTO;
import com.locanbeach.backend.service.ServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceDTO>>> getAllServices() {
        return ResponseEntity.ok(
                ApiResponse.success("Get all services successfully", service.getAllServices()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceDTO>> getServiceById(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.success("Get service details successfully", service.getServiceById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ServiceDTO>> createService(@Valid @RequestBody ServiceDTO dto) {
        return new ResponseEntity<>(
                ApiResponse.success("Service created successfully", service.createService(dto)),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceDTO>> updateService(@PathVariable UUID id, @Valid @RequestBody ServiceDTO dto) {
        return ResponseEntity.ok(
                ApiResponse.success("Service updated successfully", service.updateService(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable UUID id) {
        service.deleteService(id);
        return ResponseEntity.ok(
                ApiResponse.success("Service deleted successfully", null));
    }
}
