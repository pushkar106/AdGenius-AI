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
@Table(name = "payment_webhook_events")
public class PaymentWebhookEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 32)
    private String provider;

    @Column(name = "event_id", nullable = false, length = 128)
    private String eventId;

    @Column(name = "event_type", nullable = false, length = 80)
    private String eventType;

    @Column(name = "payload_hash", nullable = false, length = 128)
    private String payloadHash;

    @Column(nullable = false)
    private boolean processed;

    @Column(name = "processing_error", length = 500)
    private String processingError;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "processed_at")
    private Instant processedAt;
}
