package com.adgenius.repository;

import com.adgenius.entity.MediaAsset;
import com.adgenius.enums.MediaType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MediaAssetRepository extends JpaRepository<MediaAsset, Long> {
    Optional<MediaAsset> findByIdAndUserIdAndDeletedAtIsNull(Long id, Long userId);
    Page<MediaAsset> findByUserIdAndDeletedAtIsNull(Long userId, Pageable pageable);
    Page<MediaAsset> findByUserIdAndTypeAndDeletedAtIsNull(Long userId, MediaType type, Pageable pageable);
    long countByUserIdAndTypeAndDeletedAtIsNull(Long userId, MediaType type);
}
