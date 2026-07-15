package com.locanbeach.backend.service;

import com.locanbeach.backend.common.exception.AppException;
import com.locanbeach.backend.exception.errorcode.AmenityErrorCode;
import com.locanbeach.backend.dto.AmenityDTO;
import com.locanbeach.backend.entity.Amenity;
import com.locanbeach.backend.repository.AmenityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AmenityService {

    private final AmenityRepository repository;

    @Transactional(readOnly = true)
    public List<AmenityDTO> getAllAmenities() {
        return repository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AmenityDTO getAmenityById(UUID id) {
        return repository.findById(id).map(this::convertToDto)
                .orElseThrow(() -> new AppException(
                        AmenityErrorCode.AMENITY_NOT_FOUND,
                        "Amenity not found with id: " + id));
    }

    @Transactional
    public AmenityDTO createAmenity(AmenityDTO dto) {
        Amenity entity = new Amenity();
        BeanUtils.copyProperties(dto, entity, "id");
        return convertToDto(repository.save(entity));
    }

    @Transactional
    public AmenityDTO updateAmenity(UUID id, AmenityDTO dto) {
        Amenity entity = repository.findById(id)
                .orElseThrow(() -> new AppException(
                        AmenityErrorCode.AMENITY_NOT_FOUND,
                        "Amenity not found with id: " + id));
        BeanUtils.copyProperties(dto, entity, "id");
        return convertToDto(repository.save(entity));
    }

    @Transactional
    public void deleteAmenity(UUID id) {
        if (!repository.existsById(id)) {
            throw new AppException(
                    AmenityErrorCode.AMENITY_NOT_FOUND,
                    "Amenity not found with id: " + id);
        }
        repository.deleteById(id);
    }

    private AmenityDTO convertToDto(Amenity entity) {
        AmenityDTO dto = new AmenityDTO();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }
}
