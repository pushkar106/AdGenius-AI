package com.adgenius.security;

import com.adgenius.config.AppProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {
    private final AppProperties props;
    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    public AuthRateLimitFilter(AppProperties props, ObjectMapper objectMapper) {
        this.props = props;
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !path.startsWith("/api/v1/auth/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String key = request.getRemoteAddr() + ":" + request.getRequestURI();
        Window window = windows.compute(key, (k, existing) -> {
            long now = Instant.now().getEpochSecond();
            if (existing == null || now - existing.start >= 60) {
                return new Window(now, new AtomicInteger(1));
            }
            existing.count.incrementAndGet();
            return existing;
        });
        if (window.count.get() > props.getRateLimit().getAuthPerMinute()) {
            response.setStatus(429);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            objectMapper.writeValue(response.getWriter(), Map.of(
                    "success", false,
                    "code", "RATE_LIMITED",
                    "message", "Too many authentication attempts. Please wait a minute."
            ));
            return;
        }
        filterChain.doFilter(request, response);
    }

    private record Window(long start, AtomicInteger count) {}
}
