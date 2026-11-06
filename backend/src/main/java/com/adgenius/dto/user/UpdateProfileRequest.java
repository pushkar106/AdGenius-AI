package com.adgenius.dto.user;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(min = 2, max = 120) String fullName,
        @Size(max = 160) String company,
        @Size(max = 64) String timezone
) {}
