package com.adgenius.repository;

import com.adgenius.entity.CreditTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Long> {
    Page<CreditTransaction> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Optional<CreditTransaction> findByIdempotencyKey(String idempotencyKey);
    boolean existsByIdempotencyKey(String idempotencyKey);
}
