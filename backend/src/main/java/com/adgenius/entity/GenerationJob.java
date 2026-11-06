package com.adgenius.entity;

import com.adgenius.enums.JobStatus;
import com.adgenius.enums.JobType;
import com.adgenius.enums.VisualStyle;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "generation_jobs")
public class GenerationJob {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private JobType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private JobStatus status = JobStatus.PENDING;

    @Column(nullable = false, length = 32)
    private String provider;

    @Column(name = "provider_job_id", length = 191)
    private String providerJobId;

    @Column(columnDefinition = "TEXT")
    private String prompt;

    @Column(name = "negative_prompt", columnDefinition = "TEXT")
    private String negativePrompt;

    @Enumerated(EnumType.STRING)
    @Column(length = 64)
    private VisualStyle style;

    @Column(name = "aspect_ratio", length = 16)
    private String aspectRatio;

    private String resolution;

    @Column(name = "background_style", length = 64)
    private String backgroundStyle;

    private String model;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "camera_movement", length = 64)
    private String cameraMovement;

    @Column(name = "motion_intensity", length = 32)
    private String motionIntensity;

    @Column(name = "music_option", length = 64)
    private String musicOption;

    @Column(name = "variation_count", nullable = false)
    private int variationCount = 1;

    @Column(name = "credit_cost", nullable = false)
    private int creditCost;

    @Column(name = "credit_hold_key", length = 80)
    private String creditHoldKey;

    @Column(name = "credit_charged", nullable = false)
    private boolean creditCharged;

    @Column(name = "credit_refunded", nullable = false)
    private boolean creditRefunded;

    @Column(name = "demo_mode", nullable = false)
    private boolean demoMode;

    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    @Column(name = "result_json", columnDefinition = "TEXT")
    private String resultJson;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
