package com.adgenius.entity;

import com.adgenius.enums.CreditTransactionType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "credit_transactions")
public class CreditTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private CreditAccount account;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private CreditTransactionType type;

    @Column(nullable = false)
    private int amount;

    @Column(name = "balance_after", nullable = false)
    private int balanceAfter;

    @Column(name = "reference_type", length = 64)
    private String referenceType;

    @Column(name = "reference_id", length = 64)
    private String referenceId;

    @Column(name = "idempotency_key", unique = true, length = 80)
    private String idempotencyKey;

    @Column(nullable = false)
    private String description;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
