package com.adgenius.dto.user;

import java.util.List;

public record UserStatsResponse(
        long totalAds,
        long totalImages,
        long totalVideos,
        int remainingCredits,
        String planCode,
        List<MonthlyPoint> monthlyUsage,
        List<MonthlyPoint> creditConsumption
) {
    public record MonthlyPoint(String month, long value) {}
}
