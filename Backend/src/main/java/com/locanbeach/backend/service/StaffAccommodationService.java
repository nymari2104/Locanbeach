package com.locanbeach.backend.service;

import com.locanbeach.backend.common.exception.AppException;
import com.locanbeach.backend.exception.errorcode.AccommodationErrorCode;
import com.locanbeach.backend.dto.AccommodationDTO;
import com.locanbeach.backend.dto.request.staff.ChangeOperationalStatusRequest;
import com.locanbeach.backend.entity.Accommodation;
import com.locanbeach.backend.repository.AccommodationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffAccommodationService {

    private final AccommodationRepository accommodationRepository;

    public List<AccommodationDTO> getAllAccommodations() {
        return accommodationRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AccommodationDTO changeOperationalStatus(UUID id, ChangeOperationalStatusRequest request) {
        Accommodation accommodation = accommodationRepository.findById(id)
                .orElseThrow(() -> new AppException(AccommodationErrorCode.ACCOMMODATION_NOT_FOUND));
        
        accommodation.setOperationalStatus(request.getStatus());
        return mapToDTO(accommodationRepository.save(accommodation));
    }

    private AccommodationDTO mapToDTO(Accommodation accommodation) {
        AccommodationDTO dto = new AccommodationDTO();
        dto.setId(accommodation.getId());
        dto.setCategoryId(accommodation.getCategory().getId());
        dto.setCategoryName(accommodation.getCategory().getName());
        dto.setCode(accommodation.getCode());
        dto.setMetadata(accommodation.getMetadata());
        dto.setStatus(accommodation.getStatus());
        dto.setOperationalStatus(accommodation.getOperationalStatus());
        return dto;
    }
}
