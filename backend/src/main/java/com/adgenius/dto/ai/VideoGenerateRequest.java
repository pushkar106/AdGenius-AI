package com.adgenius.dto.ai;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record VideoGenerateRequest(
        Long productId,
        Long sourceMediaId,
        String model,
        Integer durationSeconds,
        @Size(max = 2000) String animationInstructions,
        String cameraMovement,
        String motionIntensity,
        String musicOption
) {}
