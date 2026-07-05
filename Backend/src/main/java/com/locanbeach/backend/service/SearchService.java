package com.locanbeach.backend.service;

import com.locanbeach.backend.dto.request.SearchAvailableRequest;
import com.locanbeach.backend.dto.response.SearchCategoryResultResponse;
import com.locanbeach.backend.entity.Accommodation;
import com.locanbeach.backend.entity.AccommodationCategory;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SearchService {

    AccommodationRepository accommodationRepository;

    @Transactional(readOnly = true)
    public List<SearchCategoryResultResponse> searchAvailableCategories(SearchAvailableRequest request) {
        if (!request.getCheckoutDate().isAfter(request.getCheckinDate())) {
            throw new AppException(GeneralErrorCode.INVALID_INPUT, "Check-out date must be after check-in date");
        }

        // 1. Lấy tất cả phòng trống (bất kể loại)
        List<Accommodation> availableAccommodations = accommodationRepository.findAvailableAccommodations(
                request.getCheckinDate(), request.getCheckoutDate()
        );

        // 2. Lọc theo categoryId nếu có
        if (request.getCategoryId() != null) {
            availableAccommodations = availableAccommodations.stream()
                    .filter(a -> a.getCategory().getId().equals(request.getCategoryId()))
                    .collect(Collectors.toList());
        }

        // 3. Lọc theo số khách nếu có
        if (request.getGuestsCount() != null) {
            availableAccommodations = availableAccommodations.stream()
                    .filter(a -> a.getCategory().getMaxGuests() >= request.getGuestsCount())
                    .collect(Collectors.toList());
        }

        // 4. Nhóm theo AccommodationCategory và đếm số lượng phòng
        Map<AccommodationCategory, Long> categoryCountMap = availableAccommodations.stream()
                .collect(Collectors.groupingBy(Accommodation::getCategory, Collectors.counting()));

        // 5. Chuyển đổi sang Response DTO
        return categoryCountMap.entrySet().stream()
                .map(entry -> {
                    AccommodationCategory category = entry.getKey();
                    long availableCount = entry.getValue();
                    return SearchCategoryResultResponse.builder()
                            .categoryId(category.getId())
                            .categoryName(category.getName())
                            .categoryCode(category.getCode())
                            .description(category.getDescription())
                            .basePrice(category.getBasePrice())
                            .maxGuests(category.getMaxGuests())
                            .areaSqm(category.getAreaSqm())
                            .availableRoomsCount(availableCount)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
