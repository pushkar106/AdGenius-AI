package com.adgenius.dto.ai;

import com.adgenius.entity.GenerationJob;
import com.adgenius.enums.JobStatus;
import com.adgenius.enums.JobType;

import java.time.Instant;

public record JobResponse(
        Long id,
        JobType type,
        JobStatus status,
        String provider,
        boolean demoMode,
        int creditCost,
        String prompt,
        String errorMessage,
        Instant createdAt,
        Instant updatedAt,
        Instant completedAt,
        Long advertisementId
) {
    public static JobResponse from(GenerationJob job, Long advertisementId) {
        return new JobResponse(
                job.getId(),
                job.getType(),
                job.getStatus(),
                job.getProvider(),
                job.isDemoMode(),
                job.getCreditCost(),
                job.getPrompt(),
                job.getErrorMessage(),
                job.getCreatedAt(),
                job.getUpdatedAt(),
                job.getCompletedAt(),
                advertisementId
        );
    }
}
