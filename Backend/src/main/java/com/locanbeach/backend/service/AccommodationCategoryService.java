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
    private final com.locanbeach.backend.repository.AmenityRepository amenityRepository;

    @Transactional(readOnly = true)
    public List<AccommodationCategoryDTO> getAllCategories() {
        return repository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AccommodationCategoryDTO getCategoryById(UUID id) {
        return repository.findById(id).map(this::convertToDto)
                .orElseThrow(() -> new AppException(
                        com.locanbeach.backend.exception.errorcode.CategoryErrorCode.CATEGORY_NOT_FOUND,
                        "Category not found with id: " + id));
    }

    @Transactional
    public AccommodationCategoryDTO createCategory(AccommodationCategoryDTO dto) {
        AccommodationCategory entity = new AccommodationCategory();
        BeanUtils.copyProperties(dto, entity, "id", "amenities", "images");

        if (repository.existsByCode(dto.getCode())) {
            throw new AppException(com.locanbeach.backend.exception.errorcode.CategoryErrorCode.CATEGORY_CODE_ALREADY_EXISTS);
        }

        if (dto.getAmenityIds() != null && !dto.getAmenityIds().isEmpty()) {
            List<com.locanbeach.backend.entity.Amenity> amenities = amenityRepository.findAllById(dto.getAmenityIds());
            entity.setAmenities(new java.util.HashSet<>(amenities));
        }
        return convertToDto(repository.save(entity));
    }

    @Transactional
    public AccommodationCategoryDTO updateCategory(UUID id, AccommodationCategoryDTO dto) {
        AccommodationCategory entity = repository.findById(id)
                .orElseThrow(() -> new AppException(
                        com.locanbeach.backend.exception.errorcode.CategoryErrorCode.CATEGORY_NOT_FOUND,
                        "Category not found with id: " + id));

        if (dto.getCode() != null && !dto.getCode().equals(entity.getCode()) && repository.existsByCode(dto.getCode())) {
            throw new AppException(com.locanbeach.backend.exception.errorcode.CategoryErrorCode.CATEGORY_CODE_ALREADY_EXISTS);
        }

        BeanUtils.copyProperties(dto, entity, "id", "amenities", "images");
        if (dto.getAmenityIds() != null) {
            if (dto.getAmenityIds().isEmpty()) {
                entity.getAmenities().clear();
            } else {
                List<com.locanbeach.backend.entity.Amenity> amenities = amenityRepository.findAllById(dto.getAmenityIds());
                entity.setAmenities(new java.util.HashSet<>(amenities));
            }
        }
        return convertToDto(repository.save(entity));
    }

    @Transactional
    public void deleteCategory(UUID id) {
        AccommodationCategory entity = repository.findById(id)
                .orElseThrow(() -> new AppException(
                        com.locanbeach.backend.exception.errorcode.CategoryErrorCode.CATEGORY_NOT_FOUND,
                        "Category not found with id: " + id));
        repository.delete(entity);
    }

    private AccommodationCategoryDTO convertToDto(AccommodationCategory entity) {
        AccommodationCategoryDTO dto = new AccommodationCategoryDTO();
        BeanUtils.copyProperties(entity, dto);
        if (entity.getImages() != null) {
            dto.setImages(entity.getImages().stream().map(img -> com.locanbeach.backend.dto.ImageDTO.builder()
                    .id(img.getId())
                    .url(img.getUrl())
                    .isCover(img.getIsCover())
                    .sortOrder(img.getSortOrder())
                    .build()).collect(Collectors.toList()));
        }
        if (entity.getAmenities() != null) {
            dto.setAmenities(entity.getAmenities().stream().map(a -> {
                com.locanbeach.backend.dto.AmenityDTO amenityDto = new com.locanbeach.backend.dto.AmenityDTO();
                amenityDto.setId(a.getId());
                amenityDto.setName(a.getName());
                amenityDto.setIcon(a.getIcon());
                return amenityDto;
            }).collect(Collectors.toList()));

            dto.setAmenityIds(entity.getAmenities().stream()
                    .map(com.locanbeach.backend.entity.Amenity::getId)
                    .collect(Collectors.toSet()));
        }
        return dto;
    }
}
