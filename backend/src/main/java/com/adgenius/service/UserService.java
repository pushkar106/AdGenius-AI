package com.adgenius.service;

import com.adgenius.dto.user.UpdateProfileRequest;
import com.adgenius.dto.user.UserResponse;
import com.adgenius.dto.user.UserStatsResponse;
import com.adgenius.entity.CreditAccount;
import com.adgenius.entity.Subscription;
import com.adgenius.entity.User;
import com.adgenius.enums.JobStatus;
import com.adgenius.enums.JobType;
import com.adgenius.enums.MediaType;
import com.adgenius.enums.SubscriptionStatus;
import com.adgenius.exception.ApiException;
import com.adgenius.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final AdvertisementRepository advertisementRepository;
    private final MediaAssetRepository mediaAssetRepository;
    private final CreditService creditService;
    private final SubscriptionRepository subscriptionRepository;
    private final ActivityLogRepository activityLogRepository;
    private final GenerationJobRepository jobRepository;

    public UserService(UserRepository userRepository,
                       AdvertisementRepository advertisementRepository,
                       MediaAssetRepository mediaAssetRepository,
                       CreditService creditService,
                       SubscriptionRepository subscriptionRepository,
                       ActivityLogRepository activityLogRepository,
                       GenerationJobRepository jobRepository) {
        this.userRepository = userRepository;
        this.advertisementRepository = advertisementRepository;
        this.mediaAssetRepository = mediaAssetRepository;
        this.creditService = creditService;
        this.subscriptionRepository = subscriptionRepository;
        this.activityLogRepository = activityLogRepository;
        this.jobRepository = jobRepository;
    }

    @Transactional(readOnly = true)
    public UserResponse me(Long userId) {
        return UserResponse.from(user(userId));
    }

    @Transactional
    public UserResponse update(Long userId, UpdateProfileRequest request) {
        User user = user(userId);
        if (request.fullName() != null) user.setFullName(request.fullName());
        if (request.company() != null) user.setCompany(request.company());
        if (request.timezone() != null) user.setTimezone(request.timezone());
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public UserStatsResponse stats(Long userId) {
        CreditAccount account = creditService.getAccount(userId);
        String plan = subscriptionRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(userId, SubscriptionStatus.ACTIVE)
                .map(Subscription::getPlan)
                .map(p -> p.getCode())
                .orElse("FREE");
        List<UserStatsResponse.MonthlyPoint> usage = new ArrayList<>();
        List<UserStatsResponse.MonthlyPoint> credits = new ArrayList<>();
        YearMonth now = YearMonth.now(ZoneOffset.UTC);
        for (int i = 5; i >= 0; i--) {
            YearMonth m = now.minusMonths(i);
            usage.add(new UserStatsResponse.MonthlyPoint(m.toString(), advertisementRepository.countByUserIdAndDeletedAtIsNull(userId) / 6));
            credits.add(new UserStatsResponse.MonthlyPoint(m.toString(), Math.max(0, account.getLifetimeSpent() / 6)));
        }
        return new UserStatsResponse(
                advertisementRepository.countByUserIdAndDeletedAtIsNull(userId),
                mediaAssetRepository.countByUserIdAndTypeAndDeletedAtIsNull(userId, MediaType.IMAGE),
                mediaAssetRepository.countByUserIdAndTypeAndDeletedAtIsNull(userId, MediaType.VIDEO),
                account.getBalance(),
                plan,
                usage,
                credits
        );
    }

    public Object recentActivity(Long userId) {
        return activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 10)).getContent();
    }

    public Object recentAds(Long userId) {
        return advertisementRepository.findTop8ByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(userId);
    }

    public long completedJobs(JobType type) {
        return jobRepository.countByTypeAndStatus(type, JobStatus.COMPLETED);
    }

    private User user(Long id) {
        return userRepository.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
    }
}
