package com.locanbeach.backend.service;

import com.locanbeach.backend.common.exception.AppException;
import com.locanbeach.backend.dto.AccommodationCategoryDTO;
import com.locanbeach.backend.entity.AccommodationCategory;
import com.locanbeach.backend.exception.errorcode.AccommodationErrorCode;
import com.locanbeach.backend.repository.AccommodationCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccommodationCategoryService {

    private final AccommodationCategoryRepository repository;

    @Transactional(readOnly = true)
    public List<AccommodationCategoryDTO> getAllCategories() {
        return repository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AccommodationCategoryDTO getCategoryById(UUID id) {
        return repository.findById(id).map(this::convertToDto)
                .orElseThrow(() -> new AppException(
                        AccommodationErrorCode.CATEGORY_NOT_FOUND,
                        "Category not found with id: " + id));
    }

    @Transactional
    public AccommodationCategoryDTO createCategory(AccommodationCategoryDTO dto) {
        AccommodationCategory entity = new AccommodationCategory();
        BeanUtils.copyProperties(dto, entity, "id");
        return convertToDto(repository.save(entity));
    }

    @Transactional
    public AccommodationCategoryDTO updateCategory(UUID id, AccommodationCategoryDTO dto) {
        AccommodationCategory entity = repository.findById(id)
                .orElseThrow(() -> new AppException(
                        AccommodationErrorCode.CATEGORY_NOT_FOUND,
                        "Category not found with id: " + id));
        BeanUtils.copyProperties(dto, entity, "id");
        return convertToDto(repository.save(entity));
    }

    private AccommodationCategoryDTO convertToDto(AccommodationCategory entity) {
        AccommodationCategoryDTO dto = new AccommodationCategoryDTO();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }
}
