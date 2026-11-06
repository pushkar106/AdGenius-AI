package com.adgenius.dto.product;

import com.adgenius.enums.AdCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProductRequest(
        @NotBlank @Size(max = 160) String name,
        @Size(max = 4000) String description,
        @NotNull AdCategory category,
        @Size(max = 120) String brand,
        @Size(max = 255) String targetAudience,
        @Size(max = 1024) String websiteUrl
) {}
