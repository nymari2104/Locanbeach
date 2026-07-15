package com.locanbeach.backend.service;

import com.locanbeach.backend.common.exception.AppException;
import com.locanbeach.backend.common.exception.errorcode.GeneralErrorCode;
import com.locanbeach.backend.dto.ServiceDTO;
import com.locanbeach.backend.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceService {

    private final ServiceRepository repository;

    @Transactional(readOnly = true)
    public List<ServiceDTO> getAllServices() {
        return repository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ServiceDTO getServiceById(UUID id) {
        return repository.findById(id).map(this::convertToDto)
                .orElseThrow(() -> new AppException(
                        com.locanbeach.backend.exception.errorcode.ServiceErrorCode.SERVICE_NOT_FOUND,
                        "Service not found with id: " + id));
    }

    @Transactional
    public ServiceDTO createService(ServiceDTO dto) {
        if (repository.existsByName(dto.getName())) {
            throw new AppException(com.locanbeach.backend.exception.errorcode.ServiceErrorCode.SERVICE_NAME_ALREADY_EXISTS);
        }
        com.locanbeach.backend.entity.Service entity = new com.locanbeach.backend.entity.Service();
        BeanUtils.copyProperties(dto, entity, "id");
        return convertToDto(repository.save(entity));
    }

    @Transactional
    public ServiceDTO updateService(UUID id, ServiceDTO dto) {
        com.locanbeach.backend.entity.Service entity = repository.findById(id)
                .orElseThrow(() -> new AppException(
                        com.locanbeach.backend.exception.errorcode.ServiceErrorCode.SERVICE_NOT_FOUND,
                        "Service not found with id: " + id));

        if (dto.getName() != null && !dto.getName().equals(entity.getName()) && repository.existsByName(dto.getName())) {
            throw new AppException(com.locanbeach.backend.exception.errorcode.ServiceErrorCode.SERVICE_NAME_ALREADY_EXISTS);
        }

        BeanUtils.copyProperties(dto, entity, "id");
        return convertToDto(repository.save(entity));
    }

    @Transactional
    public void deleteService(UUID id) {
        com.locanbeach.backend.entity.Service entity = repository.findById(id)
                .orElseThrow(() -> new AppException(
                        com.locanbeach.backend.exception.errorcode.ServiceErrorCode.SERVICE_NOT_FOUND,
                        "Service not found with id: " + id));
        repository.delete(entity);
    }

    private ServiceDTO convertToDto(com.locanbeach.backend.entity.Service entity) {
        ServiceDTO dto = new ServiceDTO();
        BeanUtils.copyProperties(entity, dto);
        if (entity.getImages() != null) {
            dto.setImages(entity.getImages().stream().map(img -> com.locanbeach.backend.dto.ImageDTO.builder()
                    .id(img.getId())
                    .url(img.getUrl())
                    .isCover(img.getIsCover())
                    .sortOrder(img.getSortOrder())
                    .build()).collect(Collectors.toList()));
        }
        return dto;
    }
}
