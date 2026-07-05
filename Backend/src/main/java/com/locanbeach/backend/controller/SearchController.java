package com.locanbeach.backend.controller;

import com.locanbeach.backend.dto.request.SearchAvailableRequest;
import com.locanbeach.backend.common.dto.ApiResponse;
import com.locanbeach.backend.dto.response.SearchCategoryResultResponse;
import com.locanbeach.backend.service.SearchService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SearchController {

    SearchService searchService;

    @PostMapping("/accommodations")
    public ApiResponse<List<SearchCategoryResultResponse>> searchAvailable(@Valid @RequestBody SearchAvailableRequest request) {
        return ApiResponse.success("Tìm kiếm phòng trống thành công", searchService.searchAvailableCategories(request));
    }
}
