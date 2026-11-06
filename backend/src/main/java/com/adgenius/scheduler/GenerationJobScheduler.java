package com.adgenius.scheduler;

import com.adgenius.enums.JobStatus;
import com.adgenius.repository.GenerationJobRepository;
import com.adgenius.service.GenerationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class GenerationJobScheduler {
    private final GenerationJobRepository jobRepository;
    private final GenerationService generationService;

    public GenerationJobScheduler(GenerationJobRepository jobRepository, GenerationService generationService) {
        this.jobRepository = jobRepository;
        this.generationService = generationService;
    }

    @Scheduled(fixedDelay = 2000)
    public void dispatchPendingJobs() {
        jobRepository.findByStatusIn(List.of(JobStatus.PENDING)).forEach(job -> generationService.processJob(job.getId()));
    }
}
