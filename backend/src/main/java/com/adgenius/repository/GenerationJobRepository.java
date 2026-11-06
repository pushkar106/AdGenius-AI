package com.adgenius.repository;

import com.adgenius.entity.GenerationJob;
import com.adgenius.enums.JobStatus;
import com.adgenius.enums.JobType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GenerationJobRepository extends JpaRepository<GenerationJob, Long> {
    Optional<GenerationJob> findByIdAndUserId(Long id, Long userId);
    Page<GenerationJob> findByUserId(Long userId, Pageable pageable);
    Page<GenerationJob> findByUserIdAndType(Long userId, JobType type, Pageable pageable);
    List<GenerationJob> findByStatusIn(List<JobStatus> statuses);
    long countByTypeAndStatus(JobType type, JobStatus status);
    long countByStatus(JobStatus status);
    Page<GenerationJob> findByStatus(JobStatus status, Pageable pageable);
}
