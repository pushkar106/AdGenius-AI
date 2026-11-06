package com.adgenius.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "advertisements")
public class Advertisement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id")
    private GenerationJob job;

    @Column(nullable = false, length = 200)
    private String title;

    private String headline;

    @Column(columnDefinition = "TEXT")
    private String caption;

    @Column(name = "call_to_action", length = 160)
    private String callToAction;

    @Column(length = 500)
    private String hashtags;

    @Column(name = "script_text", columnDefinition = "TEXT")
    private String scriptText;

    private String category;
    private String style;

    @Column(nullable = false, length = 32)
    private String status = "READY";

    @Column(name = "demo_mode", nullable = false)
    private boolean demoMode;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @ManyToMany
    @JoinTable(name = "advertisement_media",
            joinColumns = @JoinColumn(name = "advertisement_id"),
            inverseJoinColumns = @JoinColumn(name = "media_asset_id"))
    private Set<MediaAsset> media = new HashSet<>();
}
