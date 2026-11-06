package com.adgenius.controller;

import com.adgenius.dto.ApiResponse;
import com.adgenius.entity.Payment;
import com.adgenius.repository.PaymentRepository;
import com.adgenius.security.SecurityUtils;
import com.adgenius.service.SubscriptionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Subscriptions")
public class SubscriptionController {
    private final SubscriptionService subscriptionService;
    private final PaymentRepository paymentRepository;

    public SubscriptionController(SubscriptionService subscriptionService, PaymentRepository paymentRepository) {
        this.subscriptionService = subscriptionService;
        this.paymentRepository = paymentRepository;
    }

    @GetMapping("/subscriptions/plans")
    public ApiResponse<Object> plans() {
        return ApiResponse.ok(subscriptionService.plans());
    }

    @GetMapping("/subscriptions/current")
    public ApiResponse<Map<String, Object>> current() {
        return ApiResponse.ok(subscriptionService.current(SecurityUtils.currentUserId()));
    }

    @PostMapping("/subscriptions/checkout")
    public ApiResponse<Map<String, Object>> checkout(@RequestBody Map<String, String> body) {
        return ApiResponse.ok(subscriptionService.checkout(
                SecurityUtils.currentUserId(),
                body.getOrDefault("planCode", "STARTER"),
                body.getOrDefault("cycle", "MONTHLY")
        ));
    }

    @PostMapping("/subscriptions/demo-confirm")
    public ApiResponse<Map<String, Object>> demoConfirm(@RequestBody Map<String, String> body) {
        return ApiResponse.ok(subscriptionService.demoConfirm(SecurityUtils.currentUserId(), body.get("orderId")));
    }

    @PostMapping("/subscriptions/verify")
    public ApiResponse<Map<String, Object>> verify(@RequestBody Map<String, String> body) {
        return ApiResponse.ok(subscriptionService.verifyCheckout(
                SecurityUtils.currentUserId(),
                body.get("orderId"),
                body.get("paymentId"),
                body.get("signature")
        ));
    }

    @GetMapping("/billing/history")
    public ApiResponse<Object> billing(@RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(paymentRepository.findByUserIdOrderByCreatedAtDesc(
                SecurityUtils.currentUserId(), PageRequest.of(page, size)).map(this::safePayment));
    }

    @PostMapping("/payments/webhooks/razorpay")
    public ApiResponse<Map<String, String>> webhook(@RequestBody String payload,
                                                    @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        subscriptionService.handleWebhook(payload, signature == null ? "" : signature);
        return ApiResponse.ok(Map.of("status", "ok"));
    }

    private Map<String, Object> safePayment(Payment p) {
        return Map.of(
                "id", p.getId(),
                "amountPaise", p.getAmountPaise(),
                "currency", p.getCurrency(),
                "status", p.getStatus(),
                "provider", p.getProvider(),
                "description", p.getDescription() == null ? "" : p.getDescription(),
                "createdAt", p.getCreatedAt()
        );
    }
}
