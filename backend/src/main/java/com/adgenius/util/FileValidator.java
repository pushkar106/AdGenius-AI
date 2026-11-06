package com.adgenius.util;

import com.adgenius.exception.ApiException;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

public final class FileValidator {
    private static final Set<String> IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    private FileValidator() {}

    public static void validateImage(MultipartFile file, long maxBytes) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("An image file is required");
        }
        if (file.getSize() > maxBytes) {
            throw ApiException.badRequest("File exceeds the maximum allowed size");
        }
        String type = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (!IMAGE_TYPES.contains(type)) {
            throw ApiException.badRequest("Only JPEG, PNG, and WebP images are allowed");
        }
        String name = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        if (!(name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png") || name.endsWith(".webp") || name.isBlank())) {
            throw ApiException.badRequest("Unsupported image extension");
        }
    }
}
