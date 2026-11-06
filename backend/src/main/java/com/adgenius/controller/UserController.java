package com.adgenius.controller;

import com.adgenius.dto.ApiResponse;
import com.adgenius.dto.auth.ChangePasswordRequest;
import com.adgenius.dto.user.UpdateProfileRequest;
import com.adgenius.dto.user.UserResponse;
import com.adgenius.dto.user.UserStatsResponse;
import com.adgenius.security.SecurityUtils;
import com.adgenius.service.AuthService;
import com.adgenius.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users")
public class UserController {
    private final UserService userService;
    private final AuthService authService;

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> me() {
        return ApiResponse.ok(userService.me(SecurityUtils.currentUserId()));
    }

    @PutMapping("/me")
    public ApiResponse<UserResponse> update(@Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.ok(userService.update(SecurityUtils.currentUserId(), request));
    }

    @GetMapping("/me/stats")
    public ApiResponse<UserStatsResponse> stats() {
        return ApiResponse.ok(userService.stats(SecurityUtils.currentUserId()));
    }

    @GetMapping("/me/activity")
    public ApiResponse<Object> activity() {
        return ApiResponse.ok(userService.recentActivity(SecurityUtils.currentUserId()));
    }

    @PostMapping("/me/password")
    public ApiResponse<Map<String, String>> password(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(SecurityUtils.currentUserId(), request);
        return ApiResponse.ok(Map.of("status", "updated"));
    }
}
