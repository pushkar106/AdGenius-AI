package com.adgenius.repository;

import com.adgenius.entity.Payment;
import com.adgenius.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByProviderAndProviderOrderId(String provider, String providerOrderId);
    Optional<Payment> findByProviderAndProviderPaymentId(String provider, String providerPaymentId);
    Page<Payment> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.amountPaise), 0) FROM Payment p WHERE p.status = :status")
    long sumAmountByStatus(PaymentStatus status);
}
