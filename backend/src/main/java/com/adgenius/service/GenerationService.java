package com.adgenius.service;

import com.adgenius.config.AppProperties;
import com.adgenius.dto.PageResponse;
import com.adgenius.dto.ai.ImageGenerateRequest;
import com.adgenius.dto.ai.JobResponse;
import com.adgenius.dto.ai.VideoGenerateRequest;
import com.adgenius.entity.*;
import com.adgenius.enums.JobStatus;
import com.adgenius.enums.JobType;
import com.adgenius.enums.MediaType;
import com.adgenius.enums.VisualStyle;
import com.adgenius.exception.ApiException;
import com.adgenius.integration.openai.OpenAiImageClient;
import com.adgenius.integration.replicate.ReplicateVideoClient;
import com.adgenius.repository.AdvertisementRepository;
import com.adgenius.repository.GenerationJobRepository;
import com.adgenius.repository.UserRepository;
import com.adgenius.util.DemoAssetFactory;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class GenerationService {
    private final GenerationJobRepository jobRepository;
    private final AdvertisementRepository advertisementRepository;
    private final UserRepository userRepository;
    private final ProductService productService;
    private final MediaService mediaService;
    private final CreditService creditService;
    private final ActivityService activityService;
    private final OpenAiImageClient openAiImageClient;
    private final ReplicateVideoClient replicateVideoClient;
    private final AppProperties props;
    private final ObjectMapper objectMapper;

    public GenerationService(GenerationJobRepository jobRepository,
                             AdvertisementRepository advertisementRepository,
                             UserRepository userRepository,
                             ProductService productService,
                             MediaService mediaService,
                             CreditService creditService,
                             ActivityService activityService,
                             OpenAiImageClient openAiImageClient,
                             ReplicateVideoClient replicateVideoClient,
                             AppProperties props,
                             ObjectMapper objectMapper) {
        this.jobRepository = jobRepository;
        this.advertisementRepository = advertisementRepository;
        this.userRepository = userRepository;
        this.productService = productService;
        this.mediaService = mediaService;
        this.creditService = creditService;
        this.activityService = activityService;
        this.openAiImageClient = openAiImageClient;
        this.replicateVideoClient = replicateVideoClient;
        this.props = props;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public JobResponse enqueueImage(Long userId, ImageGenerateRequest request, MultipartFile reference) {
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        Product product = request.productId() == null ? null : productService.owned(userId, request.productId());
        if (reference != null && !reference.isEmpty()) {
            mediaService.uploadReference(userId, product, reference);
        }
        int variations = request.variations() == null ? 1 : request.variations();
        int cost = props.getCredits().getImageCost() * variations;
        GenerationJob job = baseJob(user, product, JobType.IMAGE, cost);
        job.setProvider(openAiImageClient.available() ? "OPENAI" : "DEMO");
        job.setDemoMode(!openAiImageClient.available());
        job.setPrompt(buildImagePrompt(request));
        job.setStyle(request.style());
        job.setAspectRatio(request.aspectRatio() == null ? "1:1" : request.aspectRatio());
        job.setResolution(request.resolution() == null ? "1024x1024" : request.resolution());
        job.setBackgroundStyle(request.backgroundStyle());
        job.setVariationCount(variations);
        job.setCreditHoldKey("job-image-" + UUID.randomUUID());
        job = jobRepository.save(job);
        creditService.capture(userId, cost, job.getCreditHoldKey(), "JOB", String.valueOf(job.getId()), "Image generation hold");
        job.setCreditCharged(true);
        jobRepository.save(job);
        activityService.log(userId, userId, "IMAGE_JOB_CREATED", "JOB", String.valueOf(job.getId()), null);
        return JobResponse.from(job, null);
    }

    @Transactional
    public JobResponse enqueueVideo(Long userId, VideoGenerateRequest request, MultipartFile reference) {
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        Product product = request.productId() == null ? null : productService.owned(userId, request.productId());
        if (request.sourceMediaId() == null && (reference == null || reference.isEmpty())) {
            throw ApiException.badRequest("A source image is required for video generation");
        }
        if (reference != null && !reference.isEmpty()) {
            mediaService.uploadReference(userId, product, reference);
        } else {
            mediaService.owned(userId, request.sourceMediaId());
        }
        int cost = props.getCredits().getVideoCost();
        GenerationJob job = baseJob(user, product, JobType.VIDEO, cost);
        job.setProvider(replicateVideoClient.available() ? "REPLICATE" : "DEMO");
        job.setDemoMode(!replicateVideoClient.available());
        job.setPrompt(request.animationInstructions());
        job.setModel(request.model() == null ? props.getReplicate().getVideoModel() : request.model());
        job.setDurationSeconds(request.durationSeconds() == null ? 4 : request.durationSeconds());
        job.setCameraMovement(request.cameraMovement());
        job.setMotionIntensity(request.motionIntensity());
        job.setMusicOption(request.musicOption());
        job.setCreditHoldKey("job-video-" + UUID.randomUUID());
        job = jobRepository.save(job);
        creditService.capture(userId, cost, job.getCreditHoldKey(), "JOB", String.valueOf(job.getId()), "Video generation hold");
        job.setCreditCharged(true);
        jobRepository.save(job);
        activityService.log(userId, userId, "VIDEO_JOB_CREATED", "JOB", String.valueOf(job.getId()), null);
        return JobResponse.from(job, null);
    }

    @Transactional(readOnly = true)
    public JobResponse get(Long userId, Long id) {
        GenerationJob job = jobRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> ApiException.notFound("Job not found"));
        Long adId = advertisementRepository.findAll().stream()
                .filter(a -> a.getJob() != null && a.getJob().getId().equals(job.getId()) && a.getDeletedAt() == null)
                .map(Advertisement::getId)
                .findFirst().orElse(null);
        return JobResponse.from(job, adId);
    }

    @Transactional(readOnly = true)
    public PageResponse<JobResponse> list(Long userId, JobType type, Pageable pageable) {
        var page = type == null
                ? jobRepository.findByUserId(userId, pageable)
                : jobRepository.findByUserIdAndType(userId, type, pageable);
        return PageResponse.from(page.map(j -> JobResponse.from(j, null)));
    }

    @Transactional
    public JobResponse retry(Long userId, Long id) {
        GenerationJob job = jobRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> ApiException.notFound("Job not found"));
        if (job.getStatus() != JobStatus.FAILED) {
            throw ApiException.badRequest("Only failed jobs can be retried");
        }
        if (!job.isCreditCharged()) {
            creditService.capture(userId, job.getCreditCost(), job.getCreditHoldKey() + "-retry",
                    "JOB", String.valueOf(job.getId()), "Retry generation");
            job.setCreditCharged(true);
            job.setCreditRefunded(false);
        }
        job.setStatus(JobStatus.PENDING);
        job.setErrorMessage(null);
        job.setStartedAt(null);
        job.setCompletedAt(null);
        jobRepository.save(job);
        return JobResponse.from(job, null);
    }

    @Async("generationExecutor")
    public void processJob(Long jobId) {
        GenerationJob job = jobRepository.findById(jobId).orElse(null);
        if (job == null || job.getStatus().isTerminal()) return;
        job.setStatus(JobStatus.PROCESSING);
        job.setStartedAt(Instant.now());
        jobRepository.save(job);
        try {
            if (job.getType() == JobType.IMAGE) {
                completeImage(job);
            } else if (job.getType() == JobType.VIDEO) {
                completeVideo(job);
            }
        } catch (Exception ex) {
            failAndRefund(job, safeMessage(ex));
        }
    }

    private void completeImage(GenerationJob job) throws Exception {
        List<byte[]> images = new ArrayList<>();
        if (job.isDemoMode() || !openAiImageClient.available()) {
            job.setDemoMode(true);
            job.setProvider("DEMO");
            for (int i = 0; i < job.getVariationCount(); i++) {
                images.add(DemoAssetFactory.demoPoster(job.getPrompt(), "Sample still " + (i + 1) + " · not a live model output"));
            }
        } else {
            images.addAll(openAiImageClient.generateImages(job.getPrompt(), job.getResolution(), job.getVariationCount()));
        }
        Advertisement ad = newAd(job, "Product image ad", job.getPrompt());
        for (int i = 0; i < images.size(); i++) {
            MediaAsset asset = mediaService.store(job.getUser().getId(), job.getProduct(), images.get(i),
                    "image/png", "image-v" + (i + 1) + ".png", MediaType.IMAGE);
            if (job.isDemoMode()) {
                asset.setObjectKey(asset.getObjectKey().replace("/image/", "/demo/image/"));
            }
            ad.getMedia().add(asset);
        }
        advertisementRepository.save(ad);
        job.setStatus(JobStatus.COMPLETED);
        job.setCompletedAt(Instant.now());
        job.setResultJson("{\"advertisementId\":" + ad.getId() + "}");
        jobRepository.save(job);
    }

    private void completeVideo(GenerationJob job) throws Exception {
        byte[] videoBytes;
        String contentType;
        String fileName;
        if (job.isDemoMode() || !replicateVideoClient.available()) {
            job.setDemoMode(true);
            job.setProvider("DEMO");
            videoBytes = DemoAssetFactory.demoPoster(job.getPrompt() == null ? "Cinematic product motion" : job.getPrompt(),
                    "Demo video still-frame — configure Replicate for live video");
            contentType = "image/png";
            fileName = "demo-video-frame.png";
        } else {
            String predictionId = replicateVideoClient.startPrediction(null, job.getPrompt(), job.getDurationSeconds());
            job.setProviderJobId(predictionId);
            jobRepository.save(job);
            JsonNode prediction = waitForReplicate(predictionId);
            String outputUrl = firstUrl(prediction.path("output"));
            if (outputUrl == null) throw new IllegalStateException("Replicate completed without an output URL");
            videoBytes = replicateVideoClient.download(outputUrl);
            contentType = "video/mp4";
            fileName = "promo.mp4";
        }
        Advertisement ad = newAd(job, "Promotional video", job.getPrompt());
        MediaAsset asset = mediaService.store(job.getUser().getId(), job.getProduct(), videoBytes, contentType, fileName, MediaType.VIDEO);
        ad.getMedia().add(asset);
        advertisementRepository.save(ad);
        job.setStatus(JobStatus.COMPLETED);
        job.setCompletedAt(Instant.now());
        job.setResultJson("{\"advertisementId\":" + ad.getId() + "}");
        jobRepository.save(job);
    }

    private JsonNode waitForReplicate(String id) throws InterruptedException {
        for (int i = 0; i < 40; i++) {
            JsonNode node = replicateVideoClient.getPrediction(id);
            String status = node.path("status").asText();
            if ("succeeded".equals(status)) return node;
            if ("failed".equals(status) || "canceled".equals(status)) {
                throw new IllegalStateException(node.path("error").asText("Replicate job failed"));
            }
            Thread.sleep(3000);
        }
        throw new IllegalStateException("Timed out waiting for Replicate");
    }

    private String firstUrl(JsonNode output) {
        if (output == null || output.isMissingNode() || output.isNull()) return null;
        if (output.isTextual()) return output.asText();
        if (output.isArray() && output.size() > 0) return output.get(0).asText();
        return null;
    }

    private void failAndRefund(GenerationJob job, String message) {
        job.setStatus(JobStatus.FAILED);
        job.setErrorMessage(message);
        job.setCompletedAt(Instant.now());
        jobRepository.save(job);
        if (job.isCreditCharged() && !job.isCreditRefunded()) {
            creditService.refund(job.getUser().getId(), job.getCreditCost(),
                    job.getCreditHoldKey() + "-refund", "JOB", String.valueOf(job.getId()),
                    "Refund for failed generation");
            job.setCreditRefunded(true);
            jobRepository.save(job);
        }
    }

    private Advertisement newAd(GenerationJob job, String title, String caption) {
        Advertisement ad = new Advertisement();
        ad.setUser(job.getUser());
        ad.setProduct(job.getProduct());
        ad.setJob(job);
        ad.setTitle(title);
        ad.setCaption(caption);
        ad.setCategory(job.getProduct() == null ? null : job.getProduct().getCategory().name());
        ad.setStyle(job.getStyle() == null ? null : job.getStyle().name());
        ad.setStatus("READY");
        ad.setDemoMode(job.isDemoMode());
        return ad;
    }

    private GenerationJob baseJob(User user, Product product, JobType type, int cost) {
        GenerationJob job = new GenerationJob();
        job.setUser(user);
        job.setProduct(product);
        job.setType(type);
        job.setStatus(JobStatus.PENDING);
        job.setCreditCost(cost);
        return job;
    }

    private String buildImagePrompt(ImageGenerateRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("Professional product advertisement photograph of ").append(request.productName());
        if (request.productDescription() != null) sb.append(". ").append(request.productDescription());
        if (request.category() != null) sb.append(". Category: ").append(request.category());
        VisualStyle style = request.style() == null ? VisualStyle.PREMIUM_COMMERCIAL : request.style();
        sb.append(". Visual style: ").append(style.name().toLowerCase().replace('_', ' '));
        if (request.backgroundStyle() != null) sb.append(". Background: ").append(request.backgroundStyle());
        if (request.customPrompt() != null && !request.customPrompt().isBlank()) {
            sb.append(". Additional direction: ").append(request.customPrompt());
        }
        sb.append(". High-end commercial lighting, sharp focus, no watermarks, no unreadable text.");
        return sb.toString();
    }

    private String safeMessage(Exception ex) {
        String m = ex.getMessage();
        if (m == null) return "Generation failed";
        return m.length() > 900 ? m.substring(0, 900) : m;
    }
}
