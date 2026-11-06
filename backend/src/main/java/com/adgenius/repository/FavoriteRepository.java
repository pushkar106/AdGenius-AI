package com.adgenius.repository;

import com.adgenius.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    Optional<Favorite> findByUserIdAndAdvertisementId(Long userId, Long advertisementId);
    Optional<Favorite> findByUserIdAndMediaAssetId(Long userId, Long mediaAssetId);
    boolean existsByUserIdAndAdvertisementId(Long userId, Long advertisementId);
}
