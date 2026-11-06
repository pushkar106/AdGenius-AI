package com.adgenius.controller;

import com.adgenius.dto.ApiResponse;
import com.adgenius.dto.auth.*;
import com.adgenius.security.SecurityUtils;
import com.adgenius.service.AuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ApiResponse<AuthService.RegisterResult> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok("Registered", authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        return ApiResponse.ok(authService.login(request, response));
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(HttpServletRequest request, HttpServletResponse response) {
        return ApiResponse.ok(authService.refresh(request, response));
    }

    @PostMapping("/logout")
    public ApiResponse<Map<String, String>> logout(HttpServletRequest request, HttpServletResponse response) {
        Long userId = null;
        try {
            userId = SecurityUtils.currentUserId();
        } catch (Exception ignored) {
        }
        authService.logout(request, response, userId);
        return ApiResponse.ok(Map.of("status", "logged_out"));
    }

    @PostMapping("/verify-email")
    public ApiResponse<Map<String, String>> verify(@Valid @RequestBody TokenRequest request) {
        authService.verifyEmail(request.token());
        return ApiResponse.ok(Map.of("status", "verified"));
    }

    @PostMapping("/resend-verification")
    public ApiResponse<AuthService.RegisterResult> resend(@Valid @RequestBody EmailRequest request) {
        return ApiResponse.ok(authService.resendVerification(request.email()));
    }

    @PostMapping("/forgot-password")
    public ApiResponse<AuthService.RegisterResult> forgot(@Valid @RequestBody EmailRequest request) {
        return ApiResponse.ok(authService.forgotPassword(request.email()));
    }

    @PostMapping("/reset-password")
    public ApiResponse<Map<String, String>> reset(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.ok(Map.of("status", "password_updated"));
    }
}
