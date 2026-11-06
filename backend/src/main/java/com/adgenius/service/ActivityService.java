package com.adgenius.service;

import com.adgenius.entity.ActivityLog;
import com.adgenius.repository.ActivityLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class ActivityService {
    private final ActivityLogRepository repository;

    public ActivityService(ActivityLogRepository repository) {
        this.repository = repository;
    }

    public void log(Long userId, Long actorId, String action, String entityType, String entityId, String metadata) {
        ActivityLog log = new ActivityLog();
        log.setUserId(userId);
        log.setActorId(actorId);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setMetadataJson(metadata);
        log.setIpAddress(clientIp());
        repository.save(log);
    }

    private String clientIp() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) return null;
            HttpServletRequest req = attrs.getRequest();
            String forwarded = req.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                return forwarded.split(",")[0].trim();
            }
            return req.getRemoteAddr();
        } catch (Exception e) {
            return null;
        }
    }
}
