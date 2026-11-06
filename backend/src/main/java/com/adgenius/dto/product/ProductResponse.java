package com.adgenius.dto.product;

import com.adgenius.entity.Product;
import com.adgenius.enums.AdCategory;

import java.time.Instant;

public record ProductResponse(
        Long id,
        String name,
        String description,
        AdCategory category,
        String brand,
        String targetAudience,
        String websiteUrl,
        Instant createdAt,
        Instant updatedAt
) {
    public static ProductResponse from(Product p) {
        return new ProductResponse(p.getId(), p.getName(), p.getDescription(), p.getCategory(),
                p.getBrand(), p.getTargetAudience(), p.getWebsiteUrl(), p.getCreatedAt(), p.getUpdatedAt());
    }
}
