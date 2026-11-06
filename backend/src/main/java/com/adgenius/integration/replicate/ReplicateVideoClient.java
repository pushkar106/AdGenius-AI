package com.adgenius.integration.replicate;

import com.adgenius.config.AppProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Component
public class ReplicateVideoClient {
    private final AppProperties props;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public ReplicateVideoClient(AppProperties props, ObjectMapper objectMapper) {
        this.props = props;
        this.objectMapper = objectMapper;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(20));
        factory.setReadTimeout(Duration.ofSeconds(60));
        this.restClient = RestClient.builder()
                .requestFactory(factory)
                .baseUrl("https://api.replicate.com/v1")
                .build();
    }

    public boolean available() {
        return props.getReplicate().isConfigured();
    }

    public String startPrediction(String imageUrl, String prompt, Integer durationSeconds) {
        if (!available()) {
            throw new IllegalStateException("Replicate is not configured");
        }
        Map<String, Object> input = new HashMap<>();
        input.put("image", imageUrl);
        if (prompt != null && !prompt.isBlank()) input.put("prompt", prompt);
        if (durationSeconds != null) input.put("fps", 6);
        Map<String, Object> body = Map.of(
                "version", props.getReplicate().getVideoModel(),
                "input", input
        );
        String raw = restClient.post()
                .uri("/predictions")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + props.getReplicate().getApiToken())
                .body(body)
                .retrieve()
                .body(String.class);
        try {
            JsonNode node = objectMapper.readTree(raw);
            return node.path("id").asText();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to start Replicate prediction", e);
        }
    }

    public JsonNode getPrediction(String id) {
        String raw = restClient.get()
                .uri("/predictions/{id}", id)
                .header("Authorization", "Bearer " + props.getReplicate().getApiToken())
                .retrieve()
                .body(String.class);
        try {
            return objectMapper.readTree(raw);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to poll Replicate prediction", e);
        }
    }

    public byte[] download(String url) {
        return restClient.get().uri(url).retrieve().body(byte[].class);
    }
}
