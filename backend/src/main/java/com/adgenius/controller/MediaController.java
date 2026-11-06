package com.adgenius.controller;

import com.adgenius.dto.ApiResponse;
import com.adgenius.dto.PageResponse;
import com.adgenius.dto.media.MediaResponse;
import com.adgenius.entity.MediaAsset;
import com.adgenius.enums.MediaType;
import com.adgenius.security.SecurityUtils;
import com.adgenius.service.MediaService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/media")
@Tag(name = "Media")
public class MediaController {
    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping
    public ApiResponse<PageResponse<MediaResponse>> list(@RequestParam(required = false) MediaType type,
                                                        @RequestParam(defaultValue = "0") int page,
                                                        @RequestParam(defaultValue = "24") int size) {
        return ApiResponse.ok(mediaService.list(SecurityUtils.currentUserId(), type,
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @PostMapping(consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<MediaResponse> upload(@RequestParam("file") MultipartFile file) {
        return ApiResponse.ok(mediaService.uploadReference(SecurityUtils.currentUserId(), null, file));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        mediaService.delete(SecurityUtils.currentUserId(), id);
        return ApiResponse.ok(null);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {
        MediaAsset asset = mediaService.owned(SecurityUtils.currentUserId(), id);
        byte[] bytes = mediaService.bytes(asset);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(asset.getFileName()).build().toString())
                .contentType(org.springframework.http.MediaType.parseMediaType(asset.getContentType()))
                .body(bytes);
    }
}
