package com.adgenius.dto.user;

import com.adgenius.entity.User;
import com.adgenius.enums.AccountStatus;
import com.adgenius.enums.RoleName;

import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;

public record UserResponse(
        Long id,
        String email,
        String fullName,
        boolean emailVerified,
        AccountStatus status,
        String avatarUrl,
        String company,
        String timezone,
        Set<RoleName> roles,
        Instant createdAt,
        Instant lastLoginAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.isEmailVerified(),
                user.getStatus(),
                user.getAvatarUrl(),
                user.getCompany(),
                user.getTimezone(),
                user.getRoles().stream().map(r -> r.getName()).collect(Collectors.toSet()),
                user.getCreatedAt(),
                user.getLastLoginAt()
        );
    }
}
