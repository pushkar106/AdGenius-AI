package com.adgenius.repository;

import com.adgenius.entity.CreditAccount;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface CreditAccountRepository extends JpaRepository<CreditAccount, Long> {
    Optional<CreditAccount> findByUserId(Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM CreditAccount c WHERE c.user.id = :userId")
    Optional<CreditAccount> findByUserIdForUpdate(Long userId);
}
