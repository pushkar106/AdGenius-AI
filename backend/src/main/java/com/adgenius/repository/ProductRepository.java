package com.adgenius.repository;

import com.adgenius.entity.Product;
import com.adgenius.enums.AdCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByIdAndUserIdAndDeletedAtIsNull(Long id, Long userId);
    long countByUserIdAndDeletedAtIsNull(Long userId);

    @Query("SELECT p FROM Product p WHERE p.user.id = :userId AND p.deletedAt IS NULL " +
            "AND (:category IS NULL OR p.category = :category) " +
            "AND (:q IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Product> search(Long userId, AdCategory category, String q, Pageable pageable);
}
