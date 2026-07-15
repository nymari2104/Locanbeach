package com.locanbeach.backend.controller;

import com.locanbeach.backend.common.dto.ApiResponse;
import com.locanbeach.backend.common.exception.AppException;
import com.locanbeach.backend.common.exception.errorcode.GeneralErrorCode;
import com.locanbeach.backend.exception.errorcode.CategoryErrorCode;
import com.locanbeach.backend.exception.errorcode.ServiceErrorCode;
import com.locanbeach.backend.exception.errorcode.ComboErrorCode;
import com.locanbeach.backend.exception.errorcode.ImageErrorCode;
import com.locanbeach.backend.dto.response.ImageUploadResponse;
import com.locanbeach.backend.entity.AccommodationCategory;
import com.locanbeach.backend.entity.CategoryImage;
import com.locanbeach.backend.entity.ComboEvent;
import com.locanbeach.backend.entity.ComboImage;
import com.locanbeach.backend.entity.Service;
import com.locanbeach.backend.entity.ServiceImage;
import com.locanbeach.backend.repository.AccommodationCategoryRepository;
import com.locanbeach.backend.repository.CategoryImageRepository;
import com.locanbeach.backend.repository.ComboEventRepository;
import com.locanbeach.backend.repository.ComboImageRepository;
import com.locanbeach.backend.repository.ServiceImageRepository;
import com.locanbeach.backend.repository.ServiceRepository;
import com.locanbeach.backend.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/images")
@RequiredArgsConstructor
public class ImageUploadController {

    private final FileUploadService fileUploadService;
    private final AccommodationCategoryRepository categoryRepository;
    private final ServiceRepository serviceRepository;
    private final ComboEventRepository comboEventRepository;
    private final CategoryImageRepository categoryImageRepository;
    private final ServiceImageRepository serviceImageRepository;
    private final ComboImageRepository comboImageRepository;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ImageUploadResponse>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("targetType") String targetType,
            @RequestParam("targetId") UUID targetId,
            @RequestParam(value = "isCover", defaultValue = "false") Boolean isCover,
            @RequestParam(value = "sortOrder", defaultValue = "0") Integer sortOrder) {

        String url = fileUploadService.uploadFile(file);
        ImageUploadResponse response;

        switch (targetType.toUpperCase()) {
            case "CATEGORY":
                AccommodationCategory category = categoryRepository.findById(targetId)
                        .orElseThrow(() -> new AppException(CategoryErrorCode.CATEGORY_NOT_FOUND));
                CategoryImage catImage = new CategoryImage();
                catImage.setCategory(category);
                catImage.setUrl(url);
                catImage.setIsCover(isCover);
                catImage.setSortOrder(sortOrder);
                catImage = categoryImageRepository.save(catImage);
                
                response = ImageUploadResponse.builder()
                        .id(catImage.getId())
                        .url(url)
                        .isCover(isCover)
                        .sortOrder(sortOrder)
                        .build();
                break;
            case "SERVICE":
                Service service = serviceRepository.findById(targetId)
                        .orElseThrow(() -> new AppException(ServiceErrorCode.SERVICE_NOT_FOUND));
                ServiceImage srvImage = new ServiceImage();
                srvImage.setService(service);
                srvImage.setUrl(url);
                srvImage.setIsCover(isCover);
                srvImage.setSortOrder(sortOrder);
                srvImage = serviceImageRepository.save(srvImage);

                response = ImageUploadResponse.builder()
                        .id(srvImage.getId())
                        .url(url)
                        .isCover(isCover)
                        .sortOrder(sortOrder)
                        .build();
                break;
            case "COMBO":
                ComboEvent combo = comboEventRepository.findById(targetId)
                        .orElseThrow(() -> new AppException(ComboErrorCode.COMBO_NOT_FOUND));
                ComboImage comboImage = new ComboImage();
                comboImage.setCombo(combo);
                comboImage.setUrl(url);
                comboImage.setIsCover(isCover);
                comboImage.setSortOrder(sortOrder);
                comboImage = comboImageRepository.save(comboImage);

                response = ImageUploadResponse.builder()
                        .id(comboImage.getId())
                        .url(url)
                        .isCover(isCover)
                        .sortOrder(sortOrder)
                        .build();
                break;
            default:
                throw new AppException(GeneralErrorCode.INVALID_INPUT);
        }

        return new ResponseEntity<>(
                ApiResponse.success("Upload image successfully", response),
                HttpStatus.CREATED);
    }

    @org.springframework.web.bind.annotation.PatchMapping("/{targetType}/{imageId}")
    public ResponseEntity<ApiResponse<ImageUploadResponse>> updateImageMetadata(
            @PathVariable("targetType") String targetType,
            @PathVariable("imageId") UUID imageId,
            @RequestBody com.locanbeach.backend.dto.request.UpdateImageRequest request) {

        ImageUploadResponse response;
        switch (targetType.toUpperCase()) {
            case "CATEGORY":
                CategoryImage catImage = categoryImageRepository.findById(imageId)
                        .orElseThrow(() -> new AppException(ImageErrorCode.IMAGE_NOT_FOUND));
                if (request.getIsCover() != null) catImage.setIsCover(request.getIsCover());
                if (request.getSortOrder() != null) catImage.setSortOrder(request.getSortOrder());
                catImage = categoryImageRepository.save(catImage);
                response = ImageUploadResponse.builder()
                        .id(catImage.getId())
                        .url(catImage.getUrl())
                        .isCover(catImage.getIsCover())
                        .sortOrder(catImage.getSortOrder())
                        .build();
                break;
            case "SERVICE":
                ServiceImage srvImage = serviceImageRepository.findById(imageId)
                        .orElseThrow(() -> new AppException(ImageErrorCode.IMAGE_NOT_FOUND));
                if (request.getIsCover() != null) srvImage.setIsCover(request.getIsCover());
                if (request.getSortOrder() != null) srvImage.setSortOrder(request.getSortOrder());
                srvImage = serviceImageRepository.save(srvImage);
                response = ImageUploadResponse.builder()
                        .id(srvImage.getId())
                        .url(srvImage.getUrl())
                        .isCover(srvImage.getIsCover())
                        .sortOrder(srvImage.getSortOrder())
                        .build();
                break;
            case "COMBO":
                ComboImage comboImage = comboImageRepository.findById(imageId)
                        .orElseThrow(() -> new AppException(ImageErrorCode.IMAGE_NOT_FOUND));
                if (request.getIsCover() != null) comboImage.setIsCover(request.getIsCover());
                if (request.getSortOrder() != null) comboImage.setSortOrder(request.getSortOrder());
                comboImage = comboImageRepository.save(comboImage);
                response = ImageUploadResponse.builder()
                        .id(comboImage.getId())
                        .url(comboImage.getUrl())
                        .isCover(comboImage.getIsCover())
                        .sortOrder(comboImage.getSortOrder())
                        .build();
                break;
            default:
                throw new AppException(GeneralErrorCode.INVALID_INPUT);
        }
        return ResponseEntity.ok(ApiResponse.success("Update image metadata successfully", response));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{targetType}/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @PathVariable("targetType") String targetType,
            @PathVariable("imageId") UUID imageId) {

        String url = null;
        switch (targetType.toUpperCase()) {
            case "CATEGORY":
                CategoryImage catImage = categoryImageRepository.findById(imageId)
                        .orElseThrow(() -> new AppException(ImageErrorCode.IMAGE_NOT_FOUND));
                url = catImage.getUrl();
                categoryImageRepository.delete(catImage);
                break;
            case "SERVICE":
                ServiceImage srvImage = serviceImageRepository.findById(imageId)
                        .orElseThrow(() -> new AppException(ImageErrorCode.IMAGE_NOT_FOUND));
                url = srvImage.getUrl();
                serviceImageRepository.delete(srvImage);
                break;
            case "COMBO":
                ComboImage comboImage = comboImageRepository.findById(imageId)
                        .orElseThrow(() -> new AppException(ImageErrorCode.IMAGE_NOT_FOUND));
                url = comboImage.getUrl();
                comboImageRepository.delete(comboImage);
                break;
            default:
                throw new AppException(GeneralErrorCode.INVALID_INPUT);
        }

        if (url != null) {
            fileUploadService.deleteFile(url);
        }

        return ResponseEntity.ok(ApiResponse.success("Delete image successfully", null));
    }
}
