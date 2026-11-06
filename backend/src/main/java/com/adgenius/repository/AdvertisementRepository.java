package com.adgenius.repository;

import com.adgenius.entity.Advertisement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface AdvertisementRepository extends JpaRepository<Advertisement, Long> {
    Optional<Advertisement> findByIdAndUserIdAndDeletedAtIsNull(Long id, Long userId);
    Page<Advertisement> findByUserIdAndDeletedAtIsNull(Long userId, Pageable pageable);
    List<Advertisement> findTop8ByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndDeletedAtIsNull(Long userId);
    long countByDeletedAtIsNull();
    long countByCreatedAtAfterAndDeletedAtIsNull(Instant after);
}
