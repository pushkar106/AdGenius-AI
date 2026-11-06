package com.adgenius.controller;

import com.adgenius.dto.ApiResponse;
import com.adgenius.dto.PageResponse;
import com.adgenius.dto.ai.*;
import com.adgenius.enums.JobType;
import com.adgenius.security.SecurityUtils;
import com.adgenius.service.ContentStudioService;
import com.adgenius.service.GenerationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@Tag(name = "AI Generation")
public class AiController {
    private final GenerationService generationService;
    private final ContentStudioService contentStudioService;

    public AiController(GenerationService generationService, ContentStudioService contentStudioService) {
        this.generationService = generationService;
        this.contentStudioService = contentStudioService;
    }

    @PostMapping(value = "/images/generate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<JobResponse> generateImage(@Valid @ModelAttribute ImageGenerateRequest request,
                                                 @RequestParam(value = "reference", required = false) MultipartFile reference) {
        return ApiResponse.ok(generationService.enqueueImage(SecurityUtils.currentUserId(), request, reference));
    }

    @PostMapping(value = "/videos/generate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<JobResponse> generateVideo(@Valid @ModelAttribute VideoGenerateRequest request,
                                                 @RequestParam(value = "reference", required = false) MultipartFile reference) {
        return ApiResponse.ok(generationService.enqueueVideo(SecurityUtils.currentUserId(), request, reference));
    }

    @GetMapping("/jobs/{id}")
    public ApiResponse<JobResponse> job(@PathVariable Long id) {
        return ApiResponse.ok(generationService.get(SecurityUtils.currentUserId(), id));
    }

    @GetMapping("/jobs")
    public ApiResponse<PageResponse<JobResponse>> jobs(@RequestParam(required = false) JobType type,
                                                      @RequestParam(defaultValue = "0") int page,
                                                      @RequestParam(defaultValue = "12") int size) {
        return ApiResponse.ok(generationService.list(SecurityUtils.currentUserId(), type,
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @PostMapping("/jobs/{id}/retry")
    public ApiResponse<JobResponse> retry(@PathVariable Long id) {
        return ApiResponse.ok(generationService.retry(SecurityUtils.currentUserId(), id));
    }

    @GetMapping("/avatars")
    public ApiResponse<Object> avatars() {
        return ApiResponse.ok(contentStudioService.avatars());
    }

    @PostMapping("/content/generate")
    public ApiResponse<Map<String, Object>> content(@Valid @RequestBody ContentGenerateRequest request) {
        return ApiResponse.ok(contentStudioService.generate(SecurityUtils.currentUserId(), request));
    }
}
