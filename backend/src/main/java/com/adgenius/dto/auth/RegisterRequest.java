package com.adgenius.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Email @NotBlank String email,
        @NotBlank @Size(min = 10, max = 120) String fullName,
        @NotBlank @Size(min = 10, max = 72) String password,
        String company
) {}
