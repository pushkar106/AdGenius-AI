package com.adgenius.dto.ai;

import com.adgenius.enums.AdCategory;
import com.adgenius.enums.VisualStyle;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ImageGenerateRequest(
        Long productId,
        @NotBlank @Size(max = 160) String productName,
        @Size(max = 2000) String productDescription,
        AdCategory category,
        VisualStyle style,
        String aspectRatio,
        String resolution,
        String backgroundStyle,
        @Size(max = 2000) String customPrompt,
        @Min(1) @Max(4) Integer variations
) {}
