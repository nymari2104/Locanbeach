package com.locanbeach.backend.controller;

import com.locanbeach.backend.common.dto.ApiResponse;
import com.locanbeach.backend.dto.ComboEventDTO;
import com.locanbeach.backend.service.ComboEventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/combos")
@RequiredArgsConstructor
public class ComboEventController {

    private final ComboEventService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ComboEventDTO>>> getAllCombos() {
        return ResponseEntity.ok(
                ApiResponse.success("Get all combos and events successfully", service.getAllCombos()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ComboEventDTO>> getComboById(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.success("Get combo or event details successfully", service.getComboById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ComboEventDTO>> createCombo(@Valid @RequestBody ComboEventDTO dto) {
        return new ResponseEntity<>(
                ApiResponse.success("Combo or event created successfully", service.createCombo(dto)),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ComboEventDTO>> updateCombo(@PathVariable UUID id, @Valid @RequestBody ComboEventDTO dto) {
        return ResponseEntity.ok(
                ApiResponse.success("Combo or event updated successfully", service.updateCombo(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCombo(@PathVariable UUID id) {
        service.deleteCombo(id);
        return ResponseEntity.ok(
                ApiResponse.success("Combo deleted successfully", null));
    }
}
