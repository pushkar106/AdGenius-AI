package com.adgenius.repository;

import com.adgenius.entity.User;
import com.adgenius.enums.AccountStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    long countByStatus(AccountStatus status);

    @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL AND " +
            "(:q IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<User> search(String q, Pageable pageable);
}
