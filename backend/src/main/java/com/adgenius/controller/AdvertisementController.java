package com.adgenius.controller;

import com.adgenius.dto.ApiResponse;
import com.adgenius.dto.PageResponse;
import com.adgenius.dto.ad.AdvertisementResponse;
import com.adgenius.security.SecurityUtils;
import com.adgenius.service.AdvertisementService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/advertisements")
@Tag(name = "Advertisements")
public class AdvertisementController {
    private final AdvertisementService advertisementService;

    public AdvertisementController(AdvertisementService advertisementService) {
        this.advertisementService = advertisementService;
    }

    @GetMapping
    public ApiResponse<PageResponse<AdvertisementResponse>> list(@RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(defaultValue = "12") int size) {
        return ApiResponse.ok(advertisementService.list(SecurityUtils.currentUserId(),
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/{id}")
    public ApiResponse<AdvertisementResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(advertisementService.get(SecurityUtils.currentUserId(), id));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        advertisementService.delete(SecurityUtils.currentUserId(), id);
        return ApiResponse.ok(null);
    }

    @PostMapping("/{id}/favorite")
    public ApiResponse<AdvertisementResponse> favorite(@PathVariable Long id) {
        return ApiResponse.ok(advertisementService.toggleFavorite(SecurityUtils.currentUserId(), id));
    }
}
