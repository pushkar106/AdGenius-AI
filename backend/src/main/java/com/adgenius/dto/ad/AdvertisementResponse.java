package com.adgenius.dto.ad;

import com.adgenius.dto.media.MediaResponse;
import com.adgenius.entity.Advertisement;

import java.time.Instant;
import java.util.List;

public record AdvertisementResponse(
        Long id,
        Long productId,
        Long jobId,
        String title,
        String headline,
        String caption,
        String callToAction,
        String hashtags,
        String scriptText,
        String category,
        String style,
        String status,
        boolean demoMode,
        boolean favorite,
        Instant createdAt,
        List<MediaResponse> media
) {
    public static AdvertisementResponse from(Advertisement ad, boolean favorite, List<MediaResponse> media) {
        return new AdvertisementResponse(
                ad.getId(),
                ad.getProduct() == null ? null : ad.getProduct().getId(),
                ad.getJob() == null ? null : ad.getJob().getId(),
                ad.getTitle(),
                ad.getHeadline(),
                ad.getCaption(),
                ad.getCallToAction(),
                ad.getHashtags(),
                ad.getScriptText(),
                ad.getCategory(),
                ad.getStyle(),
                ad.getStatus(),
                ad.isDemoMode(),
                favorite,
                ad.getCreatedAt(),
                media
        );
    }
}
