package com.adgenius.service;

import com.adgenius.dto.PageResponse;
import com.adgenius.dto.user.UserResponse;
import com.adgenius.entity.Role;
import com.adgenius.entity.User;
import com.adgenius.enums.AccountStatus;
import com.adgenius.enums.JobStatus;
import com.adgenius.enums.JobType;
import com.adgenius.enums.PaymentStatus;
import com.adgenius.enums.RoleName;
import com.adgenius.exception.ApiException;
import com.adgenius.repository.*;
import com.adgenius.security.UserPrincipal;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Set;

@Service
public class AdminService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AdvertisementRepository advertisementRepository;
    private final GenerationJobRepository jobRepository;
    private final PaymentRepository paymentRepository;
    private final CreditService creditService;
    private final ActivityLogRepository activityLogRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public AdminService(UserRepository userRepository,
                        RoleRepository roleRepository,
                        AdvertisementRepository advertisementRepository,
                        GenerationJobRepository jobRepository,
                        PaymentRepository paymentRepository,
                        CreditService creditService,
                        ActivityLogRepository activityLogRepository,
                        RefreshTokenRepository refreshTokenRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.advertisementRepository = advertisementRepository;
        this.jobRepository = jobRepository;
        this.paymentRepository = paymentRepository;
        this.creditService = creditService;
        this.activityLogRepository = activityLogRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public Map<String, Object> dashboard() {
        return Map.of(
                "totalUsers", userRepository.count(),
                "activeUsers", userRepository.countByStatus(AccountStatus.ACTIVE),
                "blockedUsers", userRepository.countByStatus(AccountStatus.BLOCKED),
                "totalAds", advertisementRepository.countByDeletedAtIsNull(),
                "completedImages", jobRepository.countByTypeAndStatus(JobType.IMAGE, JobStatus.COMPLETED),
                "completedVideos", jobRepository.countByTypeAndStatus(JobType.VIDEO, JobStatus.COMPLETED),
                "failedJobs", jobRepository.countByStatus(JobStatus.FAILED),
                "revenuePaise", paymentRepository.sumAmountByStatus(PaymentStatus.PAID)
        );
    }

    public PageResponse<UserResponse> users(String q, Pageable pageable) {
        String query = (q == null || q.isBlank()) ? null : q.trim();
        return PageResponse.from(userRepository.search(query, pageable).map(UserResponse::from));
    }

    @Transactional
    public UserResponse block(Long actorId, Long userId, boolean blocked) {
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        if (user.hasRole(RoleName.SUPER_ADMIN)) {
            throw ApiException.forbidden("SUPER_ADMIN accounts cannot be blocked here");
        }
        user.setStatus(blocked ? AccountStatus.BLOCKED : AccountStatus.ACTIVE);
        if (blocked) {
            refreshTokenRepository.revokeAllForUser(userId);
        }
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse assignRole(UserPrincipal actor, Long userId, RoleName roleName) {
        if (!actor.hasRole(RoleName.SUPER_ADMIN)) {
            throw ApiException.forbidden("Only SUPER_ADMIN can assign roles");
        }
        if (roleName == RoleName.SUPER_ADMIN) {
            throw ApiException.forbidden("Cannot grant SUPER_ADMIN via this endpoint");
        }
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        Role role = roleRepository.findByName(roleName).orElseThrow();
        user.setRoles(Set.of(role));
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public Map<String, Object> adjustCredits(Long actorId, Long userId, int amount, String reason) {
        var tx = creditService.grant(userId, amount, "admin-" + actorId + "-" + userId + "-" + System.currentTimeMillis(),
                reason == null ? "Admin adjustment" : reason, actorId);
        return Map.of("balanceAfter", tx.getBalanceAfter(), "amount", tx.getAmount());
    }

    public Object jobs(JobStatus status, Pageable pageable) {
        if (status == null) {
            return PageResponse.from(jobRepository.findAll(pageable));
        }
        return PageResponse.from(jobRepository.findByStatus(status, pageable));
    }

    public Object logs(Pageable pageable) {
        return PageResponse.from(activityLogRepository.findAllByOrderByCreatedAtDesc(pageable));
    }

    public Object analytics() {
        return Map.of(
                "dashboard", dashboard(),
                "recentLogs", activityLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 20)).getContent()
        );
    }
}
