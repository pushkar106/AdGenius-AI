package com.adgenius.dto.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContentGenerateRequest(
        Long productId,
        @NotBlank @Size(max = 160) String productName,
        @Size(max = 2000) String productDescription,
        String avatarId,
        String tone
) {}
