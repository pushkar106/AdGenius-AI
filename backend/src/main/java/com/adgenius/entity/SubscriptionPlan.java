package com.adgenius.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "subscription_plans")
public class SubscriptionPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 32)
    private String code;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(name = "monthly_price_paise", nullable = false)
    private int monthlyPricePaise;

    @Column(name = "yearly_price_paise", nullable = false)
    private int yearlyPricePaise;

    @Column(name = "monthly_credits", nullable = false)
    private int monthlyCredits;

    @Column(name = "image_cost", nullable = false)
    private int imageCost;

    @Column(name = "video_cost", nullable = false)
    private int videoCost;

    @Column(name = "max_products", nullable = false)
    private int maxProducts;

    @Column(name = "features_json", nullable = false, columnDefinition = "TEXT")
    private String featuresJson;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}
