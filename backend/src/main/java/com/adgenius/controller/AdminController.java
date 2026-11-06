package com.adgenius.controller;

import com.adgenius.dto.ApiResponse;
import com.adgenius.dto.PageResponse;
import com.adgenius.dto.user.UserResponse;
import com.adgenius.enums.JobStatus;
import com.adgenius.enums.RoleName;
import com.adgenius.security.SecurityUtils;
import com.adgenius.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Admin Operations")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get high-level admin metrics")
    public ApiResponse<Map<String, Object>> dashboard() {
        return ApiResponse.ok(adminService.dashboard());
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get system analytics and recent activity")
    public ApiResponse<Object> analytics() {
        return ApiResponse.ok(adminService.analytics());
    }

    @GetMapping("/users")
    @Operation(summary = "List and search platform users")
    public ApiResponse<PageResponse<UserResponse>> users(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        return ApiResponse.ok(adminService.users(q, PageRequest.of(page, size, sort)));
    }

    @PostMapping("/users/{id}/block")
    @Operation(summary = "Block or unblock a user")
    public ApiResponse<UserResponse> blockUser(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean blocked) {
        Long actorId = SecurityUtils.currentUserId();
        return ApiResponse.ok(adminService.block(actorId, id, blocked));
    }

    @PostMapping("/users/{id}/role")
    @Operation(summary = "Assign role (SUPER_ADMIN only)")
    public ApiResponse<UserResponse> assignRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        var principal = SecurityUtils.currentUser();
        RoleName role = RoleName.valueOf(body.getOrDefault("role", "USER"));
        return ApiResponse.ok(adminService.assignRole(principal, id, role));
    }

    @PostMapping("/users/{id}/credits")
    @Operation(summary = "Adjust user credit balance")
    public ApiResponse<Map<String, Object>> adjustCredits(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Long actorId = SecurityUtils.currentUserId();
        int amount = body.get("amount") instanceof Number num ? num.intValue() : Integer.parseInt(body.get("amount").toString());
        String reason = (String) body.getOrDefault("reason", "Admin manual credit adjustment");
        return ApiResponse.ok(adminService.adjustCredits(actorId, id, amount, reason));
    }

    @GetMapping("/jobs")
    @Operation(summary = "Monitor generation jobs")
    public ApiResponse<Object> jobs(
            @RequestParam(required = false) JobStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        return ApiResponse.ok(adminService.jobs(status, PageRequest.of(page, size, sort)));
    }

    @GetMapping("/logs")
    @Operation(summary = "View platform audit logs")
    public ApiResponse<Object> logs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(adminService.logs(PageRequest.of(page, size)));
    }
}
