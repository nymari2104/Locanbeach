package com.locanbeach.backend.service;

import com.locanbeach.backend.common.exception.AppException;
import com.locanbeach.backend.dto.AccommodationDTO;
import com.locanbeach.backend.entity.Accommodation;
import com.locanbeach.backend.entity.AccommodationCategory;
import com.locanbeach.backend.entity.enums.OperationalStatus;
import com.locanbeach.backend.exception.errorcode.AccommodationErrorCode;
import com.locanbeach.backend.repository.AccommodationCategoryRepository;
import com.locanbeach.backend.repository.AccommodationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccommodationService {

    private final AccommodationRepository accommodationRepository;
    private final AccommodationCategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<AccommodationDTO> getAllAccommodations() {
        return accommodationRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AccommodationDTO getAccommodationById(UUID id) {
        return accommodationRepository.findById(id).map(this::convertToDto)
                .orElseThrow(() -> new AppException(
                        AccommodationErrorCode.ACCOMMODATION_NOT_FOUND,
                        "Accommodation not found with id: " + id));
    }

    @Transactional
    public AccommodationDTO createAccommodation(AccommodationDTO dto) {
        if (accommodationRepository.existsByCode(dto.getCode())) {
            throw new AppException(AccommodationErrorCode.ACCOMMODATION_CODE_ALREADY_EXISTS);
        }

        Accommodation entity = new Accommodation();
        BeanUtils.copyProperties(dto, entity, "id", "categoryId", "categoryName");

        if (dto.getStatus() == null) {
            entity.setStatus(com.locanbeach.backend.entity.enums.AccommodationStatus.ACTIVE);
        }
        if (dto.getOperationalStatus() == null) {
            entity.setOperationalStatus(OperationalStatus.VACANT);
        }

        AccommodationCategory category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new AppException(
                        com.locanbeach.backend.exception.errorcode.CategoryErrorCode.CATEGORY_NOT_FOUND,
                        "Category not found with id: " + dto.getCategoryId()));
        entity.setCategory(category);

        return convertToDto(accommodationRepository.save(entity));
    }

    @Transactional
    public void deleteAccommodation(UUID id) {
        Accommodation entity = accommodationRepository.findById(id)
                .orElseThrow(() -> new AppException(
                        AccommodationErrorCode.ACCOMMODATION_NOT_FOUND,
                        "Accommodation not found with id: " + id));
        accommodationRepository.delete(entity);
    }

    private AccommodationDTO convertToDto(Accommodation entity) {
        AccommodationDTO dto = new AccommodationDTO();
        BeanUtils.copyProperties(entity, dto);
        if (entity.getCategory() != null) {
            dto.setCategoryId(entity.getCategory().getId());
            dto.setCategoryName(entity.getCategory().getName());
        }
        return dto;
    }
}
