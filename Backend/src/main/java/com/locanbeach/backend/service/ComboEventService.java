package com.locanbeach.backend.service;

import com.locanbeach.backend.common.exception.AppException;
import com.locanbeach.backend.exception.errorcode.ComboErrorCode;
import com.locanbeach.backend.dto.ComboEventDTO;
import com.locanbeach.backend.entity.ComboEvent;
import com.locanbeach.backend.repository.ComboEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComboEventService {

    private final ComboEventRepository repository;

    @Transactional(readOnly = true)
    public List<ComboEventDTO> getAllCombos() {
        return repository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ComboEventDTO getComboById(UUID id) {
        return repository.findById(id).map(this::convertToDto)
                .orElseThrow(() -> new AppException(
                        ComboErrorCode.COMBO_NOT_FOUND,
                        "Combo or Event not found with id: " + id));
    }

    @Transactional
    public ComboEventDTO createCombo(ComboEventDTO dto) {
        ComboEvent entity = new ComboEvent();
        BeanUtils.copyProperties(dto, entity, "id");
        return convertToDto(repository.save(entity));
    }

    @Transactional
    public ComboEventDTO updateCombo(UUID id, ComboEventDTO dto) {
        ComboEvent entity = repository.findById(id)
                .orElseThrow(() -> new AppException(
                        ComboErrorCode.COMBO_NOT_FOUND,
                        "Combo or Event not found with id: " + id));
        BeanUtils.copyProperties(dto, entity, "id");
        return convertToDto(repository.save(entity));
    }

    @Transactional
    public void deleteCombo(UUID id) {
        ComboEvent entity = repository.findById(id)
                .orElseThrow(() -> new AppException(
                        ComboErrorCode.COMBO_NOT_FOUND,
                        "Combo or Event not found with id: " + id));
        repository.delete(entity);
    }

    private ComboEventDTO convertToDto(ComboEvent entity) {
        ComboEventDTO dto = new ComboEventDTO();
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
