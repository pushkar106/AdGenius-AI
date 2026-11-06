package com.adgenius.integration.razorpay;

import com.adgenius.config.AppProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Map;

@Component
public class RazorpayClient {
    private final AppProperties props;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public RazorpayClient(AppProperties props, ObjectMapper objectMapper) {
        this.props = props;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().baseUrl("https://api.razorpay.com/v1").build();
    }

    public boolean available() {
        return props.getRazorpay().isConfigured();
    }

    public JsonNode createOrder(int amountPaise, String receipt, String notes) {
        if (!available()) throw new IllegalStateException("Razorpay is not configured");
        String raw = restClient.post()
                .uri("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", basicAuth())
                .body(Map.of(
                        "amount", amountPaise,
                        "currency", "INR",
                        "receipt", receipt,
                        "notes", Map.of("meta", notes == null ? "" : notes)
                ))
                .retrieve()
                .body(String.class);
        try {
            return objectMapper.readTree(raw);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to create Razorpay order", e);
        }
    }

    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        String payload = orderId + "|" + paymentId;
        return hmac(payload, props.getRazorpay().getKeySecret()).equals(signature);
    }

    public boolean verifyWebhookSignature(String payload, String signature) {
        String secret = props.getRazorpay().getWebhookSecret();
        if (secret == null || secret.isBlank()) return false;
        return hmac(payload, secret).equals(signature);
    }

    private String hmac(String payload, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Unable to compute HMAC", e);
        }
    }

    private String basicAuth() {
        String pair = props.getRazorpay().getKeyId() + ":" + props.getRazorpay().getKeySecret();
        return "Basic " + Base64.getEncoder().encodeToString(pair.getBytes(StandardCharsets.UTF_8));
    }
}
