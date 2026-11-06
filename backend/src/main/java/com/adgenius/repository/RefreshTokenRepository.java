package com.adgenius.repository;

import com.adgenius.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);
    List<RefreshToken> findByFamilyId(String familyId);

    @Modifying
    @Query("UPDATE RefreshToken t SET t.revoked = true WHERE t.user.id = :userId AND t.revoked = false")
    int revokeAllForUser(Long userId);

    @Modifying
    @Query("UPDATE RefreshToken t SET t.revoked = true WHERE t.familyId = :familyId AND t.revoked = false")
    int revokeFamily(String familyId);
}
