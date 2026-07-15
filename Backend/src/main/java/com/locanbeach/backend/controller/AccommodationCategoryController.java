package com.locanbeach.backend.controller;

import com.locanbeach.backend.common.dto.ApiResponse;
import com.locanbeach.backend.dto.AccommodationCategoryDTO;
import com.locanbeach.backend.service.AccommodationCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class AccommodationCategoryController {

    private final AccommodationCategoryService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AccommodationCategoryDTO>>> getAllCategories() {
        return ResponseEntity.ok(
                ApiResponse.success("Get all categories successfully", service.getAllCategories()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AccommodationCategoryDTO>> getCategoryById(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.success("Get category details successfully", service.getCategoryById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AccommodationCategoryDTO>> createCategory(@RequestBody AccommodationCategoryDTO dto) {
        return new ResponseEntity<>(
                ApiResponse.success("Category created successfully", service.createCategory(dto)),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AccommodationCategoryDTO>> updateCategory(@PathVariable UUID id, @RequestBody AccommodationCategoryDTO dto) {
        return ResponseEntity.ok(
                ApiResponse.success("Category updated successfully", service.updateCategory(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable UUID id) {
        service.deleteCategory(id);
        return ResponseEntity.ok(
                ApiResponse.success("Category deleted successfully", null));
    }
}
