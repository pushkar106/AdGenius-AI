package com.adgenius.dto.auth;

import com.adgenius.dto.user.UserResponse;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        UserResponse user
) {}
