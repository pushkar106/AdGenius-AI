package com.adgenius.service;

import com.adgenius.config.AppProperties;
import com.adgenius.dto.ai.ContentGenerateRequest;
import com.adgenius.exception.ApiException;
import com.adgenius.integration.openai.OpenAiImageClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ContentStudioService {
    private static final List<Map<String, String>> AVATARS = List.of(
            Map.of("id", "nova", "name", "Nova", "style", "Cinematic presenter"),
            Map.of("id", "arjun", "name", "Arjun", "style", "Founder-led explainer"),
            Map.of("id", "mira", "name", "Mira", "style", "Lifestyle host"),
            Map.of("id", "kai", "name", "Kai", "style", "Product demo specialist")
    );

    private final OpenAiImageClient openAiImageClient;
    private final CreditService creditService;
    private final AppProperties props;
    private final ObjectMapper objectMapper;
    private final ProductService productService;

    public ContentStudioService(OpenAiImageClient openAiImageClient,
                                CreditService creditService,
                                AppProperties props,
                                ObjectMapper objectMapper,
                                ProductService productService) {
        this.openAiImageClient = openAiImageClient;
        this.creditService = creditService;
        this.props = props;
        this.objectMapper = objectMapper;
        this.productService = productService;
    }

    public List<Map<String, String>> avatars() {
        return AVATARS;
    }

    @Transactional
    public Map<String, Object> generate(Long userId, ContentGenerateRequest request) {
        if (request.productId() != null) {
            productService.owned(userId, request.productId());
        }
        int cost = props.getCredits().getContentCost();
        String key = "content-" + userId + "-" + System.currentTimeMillis();
        creditService.capture(userId, cost, key, "CONTENT", request.productName(), "Avatar studio copy generation");
        boolean demo = !openAiImageClient.available();
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("demoMode", demo);
        payload.put("avatarId", request.avatarId() == null ? "nova" : request.avatarId());
        payload.put("provider", demo ? "DEMO" : "OPENAI");
        if (demo) {
            payload.put("headline", "Make " + request.productName() + " impossible to ignore");
            payload.put("description", "A premium hero description for " + request.productName()
                    + (request.productDescription() == null ? "." : ": " + request.productDescription()));
            payload.put("script", "Open on the product in cinematic light. Voiceover: Discover "
                    + request.productName() + " — designed for people who want more than ordinary.");
            payload.put("caption", "Meet " + request.productName() + ". Crafted to convert.");
            payload.put("callToAction", "Shop the drop");
            payload.put("hashtags", "#AdGeniusAI #ProductLaunch #CreativeStudio");
            payload.put("note", "DEMO MODE: labeled sample copy. Configure OPENAI_API_KEY for live generation.");
            return payload;
        }
        try {
            String raw = openAiImageClient.generateText(
                    "You write high-converting product ad copy. Return strict JSON with keys headline, description, script, caption, callToAction, hashtags.",
                    "Product: " + request.productName() + "\nDescription: " + request.productDescription()
                            + "\nTone: " + (request.tone() == null ? "premium" : request.tone())
                            + "\nAvatar: " + request.avatarId());
            JsonNode node = objectMapper.readTree(extractJson(raw));
            payload.put("headline", node.path("headline").asText());
            payload.put("description", node.path("description").asText());
            payload.put("script", node.path("script").asText());
            payload.put("caption", node.path("caption").asText());
            payload.put("callToAction", node.path("callToAction").asText());
            payload.put("hashtags", node.path("hashtags").asText());
            return payload;
        } catch (Exception e) {
            creditService.refund(userId, cost, key + "-refund", "CONTENT", request.productName(), "Refund failed content generation");
            throw ApiException.unprocessable("PROVIDER_ERROR", "Content generation failed");
        }
    }

    private String extractJson(String raw) {
        int start = raw.indexOf('{');
        int end = raw.lastIndexOf('}');
        if (start >= 0 && end > start) return raw.substring(start, end + 1);
        return raw;
    }
}
