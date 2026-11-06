package com.adgenius.service;

import com.adgenius.config.AppProperties;
import com.adgenius.entity.Payment;
import com.adgenius.entity.PaymentWebhookEvent;
import com.adgenius.entity.Subscription;
import com.adgenius.entity.SubscriptionPlan;
import com.adgenius.entity.User;
import com.adgenius.enums.PaymentStatus;
import com.adgenius.enums.SubscriptionStatus;
import com.adgenius.exception.ApiException;
import com.adgenius.integration.razorpay.RazorpayClient;
import com.adgenius.repository.*;
import com.adgenius.util.HashUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class SubscriptionService {
    private final SubscriptionPlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentWebhookEventRepository webhookEventRepository;
    private final UserRepository userRepository;
    private final RazorpayClient razorpayClient;
    private final CreditService creditService;
    private final AppProperties props;
    private final ObjectMapper objectMapper;
    private final ActivityService activityService;

    public SubscriptionService(SubscriptionPlanRepository planRepository,
                               SubscriptionRepository subscriptionRepository,
                               PaymentRepository paymentRepository,
                               PaymentWebhookEventRepository webhookEventRepository,
                               UserRepository userRepository,
                               RazorpayClient razorpayClient,
                               CreditService creditService,
                               AppProperties props,
                               ObjectMapper objectMapper,
                               ActivityService activityService) {
        this.planRepository = planRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.paymentRepository = paymentRepository;
        this.webhookEventRepository = webhookEventRepository;
        this.userRepository = userRepository;
        this.razorpayClient = razorpayClient;
        this.creditService = creditService;
        this.props = props;
        this.objectMapper = objectMapper;
        this.activityService = activityService;
    }

    public List<SubscriptionPlan> plans() {
        return planRepository.findByActiveTrueOrderByMonthlyPricePaiseAsc();
    }

    public Map<String, Object> current(Long userId) {
        Subscription sub = subscriptionRepository.findFirstByUserIdOrderByCreatedAtDesc(userId).orElse(null);
        return Map.of(
                "subscription", sub == null ? Map.of() : Map.of(
                        "id", sub.getId(),
                        "status", sub.getStatus(),
                        "planCode", sub.getPlan().getCode(),
                        "planName", sub.getPlan().getName(),
                        "billingCycle", sub.getBillingCycle(),
                        "currentPeriodEnd", sub.getCurrentPeriodEnd(),
                        "cancelAtPeriodEnd", sub.isCancelAtPeriodEnd()
                ),
                "demoPayments", !razorpayClient.available()
        );
    }

    @Transactional
    public Map<String, Object> checkout(Long userId, String planCode, String cycle) {
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        SubscriptionPlan plan = planRepository.findByCode(planCode)
                .orElseThrow(() -> ApiException.notFound("Plan not found"));
        if ("FREE".equals(plan.getCode())) {
            activate(user, plan, "MONTHLY", "INTERNAL", null);
            return Map.of("status", "ACTIVE", "demoMode", !razorpayClient.available(), "message", "Moved to Free plan");
        }
        int amount = "YEARLY".equalsIgnoreCase(cycle) ? plan.getYearlyPricePaise() : plan.getMonthlyPricePaise();
        if (amount <= 0) {
            throw ApiException.badRequest("This plan requires a custom enterprise quote");
        }
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setProvider(razorpayClient.available() ? "RAZORPAY" : "DEMO");
        payment.setAmountPaise(amount);
        payment.setCurrency("INR");
        payment.setStatus(PaymentStatus.CREATED);
        payment.setDescription(plan.getCode() + " " + cycle);
        payment = paymentRepository.save(payment);

        if (!razorpayClient.available()) {
            payment.setProviderOrderId("demo_order_" + payment.getId());
            payment.setStatus(PaymentStatus.PENDING);
            paymentRepository.save(payment);
            return Map.of(
                    "demoMode", true,
                    "orderId", payment.getProviderOrderId(),
                    "amountPaise", amount,
                    "currency", "INR",
                    "planCode", plan.getCode(),
                    "keyId", "demo",
                    "note", "DEMO PAYMENT MODE. Confirm via /api/v1/subscriptions/demo-confirm. No real charge is made."
            );
        }
        JsonNode order = razorpayClient.createOrder(amount, "rcpt_" + payment.getId(), plan.getCode());
        payment.setProviderOrderId(order.path("id").asText());
        payment.setStatus(PaymentStatus.PENDING);
        paymentRepository.save(payment);
        return Map.of(
                "demoMode", false,
                "orderId", payment.getProviderOrderId(),
                "amountPaise", amount,
                "currency", "INR",
                "planCode", plan.getCode(),
                "keyId", props.getRazorpay().getKeyId()
        );
    }

    @Transactional
    public Map<String, Object> demoConfirm(Long userId, String orderId) {
        if (razorpayClient.available()) {
            throw ApiException.badRequest("Demo confirmation is disabled when Razorpay is configured");
        }
        Payment payment = paymentRepository.findByProviderAndProviderOrderId("DEMO", orderId)
                .orElseThrow(() -> ApiException.notFound("Demo order not found"));
        if (!payment.getUser().getId().equals(userId)) {
            throw ApiException.forbidden("This order does not belong to you");
        }
        if (payment.getStatus() == PaymentStatus.PAID) {
            return Map.of("status", "PAID", "idempotent", true);
        }
        fulfill(payment, "demo_pay_" + UUID.randomUUID());
        return Map.of("status", "PAID", "demoMode", true);
    }

    @Transactional
    public Map<String, Object> verifyCheckout(Long userId, String orderId, String paymentId, String signature) {
        if (!razorpayClient.verifyPaymentSignature(orderId, paymentId, signature)) {
            throw ApiException.badRequest("Invalid payment signature");
        }
        Payment payment = paymentRepository.findByProviderAndProviderOrderId("RAZORPAY", orderId)
                .orElseThrow(() -> ApiException.notFound("Order not found"));
        if (!payment.getUser().getId().equals(userId)) {
            throw ApiException.forbidden("This order does not belong to you");
        }
        if (payment.getStatus() == PaymentStatus.PAID) {
            return Map.of("status", "PAID", "idempotent", true);
        }
        fulfill(payment, paymentId);
        return Map.of("status", "PAID");
    }

    @Transactional
    public void handleWebhook(String payload, String signature) {
        if (razorpayClient.available() && !razorpayClient.verifyWebhookSignature(payload, signature)) {
            throw ApiException.unauthorized("Invalid webhook signature");
        }
        try {
            JsonNode root = objectMapper.readTree(payload);
            String eventId = root.path("id").asText(HashUtil.sha256(payload).substring(0, 32));
            String eventType = root.path("event").asText("unknown");
            if (webhookEventRepository.existsByProviderAndEventId("RAZORPAY", eventId)) {
                return;
            }
            PaymentWebhookEvent event = new PaymentWebhookEvent();
            event.setProvider("RAZORPAY");
            event.setEventId(eventId);
            event.setEventType(eventType);
            event.setPayloadHash(HashUtil.sha256(payload));
            webhookEventRepository.save(event);
            if (eventType.contains("payment.captured") || eventType.equals("order.paid")) {
                JsonNode entity = root.path("payload").path("payment").path("entity");
                String orderId = entity.path("order_id").asText();
                String paymentId = entity.path("id").asText();
                paymentRepository.findByProviderAndProviderOrderId("RAZORPAY", orderId).ifPresent(p -> {
                    if (p.getStatus() != PaymentStatus.PAID) {
                        fulfill(p, paymentId);
                    }
                });
            }
            event.setProcessed(true);
            event.setProcessedAt(Instant.now());
            webhookEventRepository.save(event);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw ApiException.badRequest("Unable to process webhook");
        }
    }

    private void fulfill(Payment payment, String providerPaymentId) {
        payment.setProviderPaymentId(providerPaymentId);
        payment.setStatus(PaymentStatus.PAID);
        paymentRepository.save(payment);
        String[] parts = payment.getDescription() == null ? new String[]{"STARTER", "MONTHLY"} : payment.getDescription().split(" ");
        String planCode = parts[0];
        String cycle = parts.length > 1 ? parts[1] : "MONTHLY";
        SubscriptionPlan plan = planRepository.findByCode(planCode).orElseThrow();
        Subscription sub = activate(payment.getUser(), plan, cycle, payment.getProvider(), null);
        payment.setSubscription(sub);
        paymentRepository.save(payment);
        creditService.planGrant(payment.getUser().getId(), plan.getMonthlyCredits(),
                "plan-grant-" + payment.getId(), "Credits from " + plan.getCode());
        activityService.log(payment.getUser().getId(), payment.getUser().getId(), "SUBSCRIPTION_ACTIVATED",
                "PLAN", plan.getCode(), null);
    }

    private Subscription activate(User user, SubscriptionPlan plan, String cycle, String provider, String providerSubId) {
        subscriptionRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), SubscriptionStatus.ACTIVE)
                .ifPresent(existing -> {
                    existing.setStatus(SubscriptionStatus.CANCELED);
                    existing.setUpdatedAt(Instant.now());
                    subscriptionRepository.save(existing);
                });
        Subscription sub = new Subscription();
        sub.setUser(user);
        sub.setPlan(plan);
        sub.setStatus(SubscriptionStatus.ACTIVE);
        sub.setBillingCycle(cycle);
        sub.setCurrentPeriodStart(Instant.now());
        sub.setCurrentPeriodEnd(Instant.now().plus("YEARLY".equalsIgnoreCase(cycle) ? Duration.ofDays(365) : Duration.ofDays(30)));
        sub.setProvider(provider);
        sub.setProviderSubscriptionId(providerSubId);
        return subscriptionRepository.save(sub);
    }
}
