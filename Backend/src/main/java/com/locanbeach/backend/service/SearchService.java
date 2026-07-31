package com.locanbeach.backend.service;

import com.locanbeach.backend.dto.AccommodationCategoryDTO;
import com.locanbeach.backend.dto.request.SearchAvailableRequest;
import com.locanbeach.backend.dto.response.SearchCategoryResultResponse;
import com.locanbeach.backend.entity.Accommodation;
import com.locanbeach.backend.common.exception.AppException;
import com.locanbeach.backend.common.exception.errorcode.GeneralErrorCode;
import com.locanbeach.backend.repository.AccommodationRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SearchService {

    AccommodationRepository accommodationRepository;
    AccommodationCategoryService accommodationCategoryService;

    @Transactional(readOnly = true)
    public List<SearchCategoryResultResponse> searchAvailableCategories(SearchAvailableRequest request) {
        if (request.getCheckinDate().toLocalDate().isBefore(java.time.LocalDate.now())) {
            throw new AppException(GeneralErrorCode.INVALID_INPUT, "Check-in date must be today or in the future");
        }

        if (!request.getCheckoutDate().isAfter(request.getCheckinDate())) {
            throw new AppException(GeneralErrorCode.INVALID_INPUT, "Check-out date must be after check-in date");
        }

        // 1. Lấy tất cả phòng trống (bất kể loại)
        List<Accommodation> availableAccommodations = accommodationRepository.findAvailableAccommodations(
                request.getCheckinDate(), request.getCheckoutDate(), java.time.LocalDateTime.now()
        );

        // 2. Nhóm theo Category ID (UUID) và đếm số lượng phòng trống.
        // a.getCategory().getId() chỉ đọc FK từ entity, KHÔNG kích hoạt query DB
        Map<UUID, Long> categoryCountMap = availableAccommodations.stream()
                .collect(Collectors.groupingBy(a -> a.getCategory().getId(), Collectors.counting()));

        // 3. Chuyển đổi sang DTO và lọc bằng dữ liệu từ Valkey Cache
        return categoryCountMap.entrySet().stream()
                .map(entry -> {
                    UUID categoryId = entry.getKey();
                    long availableCount = entry.getValue();

                    // Lấy DTO từ Valkey Cache (hoặc DB 1 lần nếu cache miss)
                    AccommodationCategoryDTO cachedCat = accommodationCategoryService.getCategoryById(categoryId);
                    if (cachedCat == null) return null;

                    // Lọc theo categoryId
                    if (request.getCategoryId() != null && !cachedCat.getId().equals(request.getCategoryId())) {
                        return null;
                    }

                    // Lọc theo số khách
                    if (request.getGuestsCount() != null && (cachedCat.getMaxGuests() == null || cachedCat.getMaxGuests() < request.getGuestsCount())) {
                        return null;
                    }

                    // Lọc theo khoảng giá tối thiểu
                    if (request.getMinPrice() != null && (cachedCat.getBasePrice() == null || cachedCat.getBasePrice().compareTo(request.getMinPrice()) < 0)) {
                        return null;
                    }

                    // Lọc theo khoảng giá tối đa
                    if (request.getMaxPrice() != null && (cachedCat.getBasePrice() == null || cachedCat.getBasePrice().compareTo(request.getMaxPrice()) > 0)) {
                        return null;
                    }

                    // Lọc theo loại hình (ROOM, CAMPING, GLAMPING)
                    if (request.getType() != null && cachedCat.getType() != request.getType()) {
                        return null;
                    }

                    // Lọc theo tiện ích
                    if (request.getAmenityIds() != null && !request.getAmenityIds().isEmpty()) {
                        if (cachedCat.getAmenityIds() == null || !cachedCat.getAmenityIds().containsAll(request.getAmenityIds())) {
                            return null;
                        }
                    }

                    return SearchCategoryResultResponse.builder()
                            .categoryId(cachedCat.getId())
                            .categoryName(cachedCat.getName())
                            .categoryCode(cachedCat.getCode())
                            .description(cachedCat.getDescription())
                            .basePrice(cachedCat.getBasePrice())
                            .maxGuests(cachedCat.getMaxGuests())
                            .areaSqm(cachedCat.getAreaSqm())
                            .availableRoomsCount(availableCount)
                            .images(cachedCat.getImages() != null ? cachedCat.getImages() : java.util.Collections.emptyList())
                            .amenities(cachedCat.getAmenities() != null ? cachedCat.getAmenities() : java.util.Collections.emptyList())
                            .build();
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}
