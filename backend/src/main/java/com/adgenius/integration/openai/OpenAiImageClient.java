package com.adgenius.integration.openai;

import com.adgenius.config.AppProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Component
public class OpenAiImageClient {
    private final AppProperties props;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public OpenAiImageClient(AppProperties props, ObjectMapper objectMapper) {
        this.props = props;
        this.objectMapper = objectMapper;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(20));
        factory.setReadTimeout(Duration.ofSeconds(120));
        this.restClient = RestClient.builder()
                .requestFactory(factory)
                .baseUrl("https://api.openai.com/v1")
                .build();
    }

    public boolean available() {
        return props.getOpenai().isConfigured();
    }

    public List<byte[]> generateImages(String prompt, String size, int n) {
        if (!available()) {
            throw new IllegalStateException("OpenAI is not configured");
        }
        Map<String, Object> body = Map.of(
                "model", props.getOpenai().getImageModel(),
                "prompt", prompt,
                "size", size == null ? "1024x1024" : size,
                "n", Math.min(Math.max(n, 1), 4)
        );
        String raw = restClient.post()
                .uri("/images/generations")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + props.getOpenai().getApiKey())
                .body(body)
                .retrieve()
                .body(String.class);
        try {
            JsonNode data = objectMapper.readTree(raw).path("data");
            List<byte[]> images = new ArrayList<>();
            for (JsonNode node : data) {
                if (node.hasNonNull("b64_json")) {
                    images.add(Base64.getDecoder().decode(node.get("b64_json").asText()));
                } else if (node.hasNonNull("url")) {
                    byte[] downloaded = restClient.get()
                            .uri(node.get("url").asText())
                            .retrieve()
                            .body(byte[].class);
                    if (downloaded != null) images.add(downloaded);
                }
            }
            if (images.isEmpty()) {
                throw new IllegalStateException("OpenAI returned no images");
            }
            return images;
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse OpenAI image response", e);
        }
    }

    public String generateText(String system, String user) {
        if (!available()) {
            throw new IllegalStateException("OpenAI is not configured");
        }
        Map<String, Object> body = Map.of(
                "model", props.getOpenai().getChatModel(),
                "messages", List.of(
                        Map.of("role", "system", "content", system),
                        Map.of("role", "user", "content", user)
                )
        );
        String raw = restClient.post()
                .uri("/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + props.getOpenai().getApiKey())
                .body(body)
                .retrieve()
                .body(String.class);
        try {
            return objectMapper.readTree(raw).path("choices").path(0).path("message").path("content").asText();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse OpenAI chat response", e);
        }
    }
}
