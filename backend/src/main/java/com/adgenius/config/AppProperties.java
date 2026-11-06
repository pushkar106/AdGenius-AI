package com.adgenius.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private String name = "AdGenius AI";
    private String baseUrl = "http://localhost:5173";
    private String apiBaseUrl = "http://localhost:8080";
    private final Cors cors = new Cors();
    private final Jwt jwt = new Jwt();
    private final Cookie cookie = new Cookie();
    private final Admin admin = new Admin();
    private final Mail mail = new Mail();
    private final OpenAi openai = new OpenAi();
    private final Replicate replicate = new Replicate();
    private final Aws aws = new Aws();
    private final Razorpay razorpay = new Razorpay();
    private final Credits credits = new Credits();
    private final Storage storage = new Storage();
    private final RateLimit rateLimit = new RateLimit();

    @Getter @Setter
    public static class Cors {
        private String allowedOrigins = "http://localhost:5173";
    }

    @Getter @Setter
    public static class Jwt {
        private String accessSecret;
        private String refreshSecret;
        private long accessTtlSeconds = 900;
        private long refreshTtlSeconds = 1_209_600;
    }

    @Getter @Setter
    public static class Cookie {
        private boolean secure = false;
        private String domain = "";
        private String sameSite = "Lax";
    }

    @Getter @Setter
    public static class Admin {
        private String email;
        private String password;
        private String name;
    }

    @Getter @Setter
    public static class Mail {
        private String from;
    }

    @Getter @Setter
    public static class OpenAi {
        private String apiKey = "";
        private String imageModel = "gpt-image-1";
        private String chatModel = "gpt-4o-mini";
        public boolean isConfigured() {
            return apiKey != null && !apiKey.isBlank();
        }
    }

    @Getter @Setter
    public static class Replicate {
        private String apiToken = "";
        private String videoModel = "stability-ai/stable-video-diffusion";
        public boolean isConfigured() {
            return apiToken != null && !apiToken.isBlank();
        }
    }

    @Getter @Setter
    public static class Aws {
        private String accessKey = "";
        private String secretKey = "";
        private String region = "ap-south-1";
        private String bucket = "";
        private String endpoint = "";
        public boolean isConfigured() {
            return accessKey != null && !accessKey.isBlank()
                    && secretKey != null && !secretKey.isBlank()
                    && bucket != null && !bucket.isBlank();
        }
    }

    @Getter @Setter
    public static class Razorpay {
        private String keyId = "";
        private String keySecret = "";
        private String webhookSecret = "";
        public boolean isConfigured() {
            return keyId != null && !keyId.isBlank() && keySecret != null && !keySecret.isBlank();
        }
    }

    @Getter @Setter
    public static class Credits {
        private int freeInitial = 50;
        private int imageCost = 2;
        private int videoCost = 10;
        private int contentCost = 1;
    }

    @Getter @Setter
    public static class Storage {
        private String localDir = "./data/media";
        private long maxUploadBytes = 10_485_760;
    }

    @Getter @Setter
    public static class RateLimit {
        private int authPerMinute = 10;
    }
}
