package com.adgenius.repository;

import com.adgenius.entity.Subscription;
import com.adgenius.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findFirstByUserIdAndStatusOrderByCreatedAtDesc(Long userId, SubscriptionStatus status);
    Optional<Subscription> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
    long countByStatus(SubscriptionStatus status);
}
