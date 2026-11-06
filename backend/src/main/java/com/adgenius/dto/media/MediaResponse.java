package com.adgenius.dto.media;

import com.adgenius.entity.MediaAsset;
import com.adgenius.enums.MediaType;

import java.time.Instant;

public record MediaResponse(
        Long id,
        MediaType type,
        String fileName,
        String contentType,
        long byteSize,
        String url,
        boolean demoAsset,
        Instant createdAt
) {
    public static MediaResponse from(MediaAsset asset, String url) {
        boolean demo = asset.getObjectKey() != null && asset.getObjectKey().contains("/demo/");
        return new MediaResponse(asset.getId(), asset.getType(), asset.getFileName(), asset.getContentType(),
                asset.getByteSize(), url, demo, asset.getCreatedAt());
    }
}
