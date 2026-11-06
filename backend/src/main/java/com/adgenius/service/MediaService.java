package com.adgenius.service;

import com.adgenius.config.AppProperties;
import com.adgenius.dto.PageResponse;
import com.adgenius.dto.media.MediaResponse;
import com.adgenius.entity.MediaAsset;
import com.adgenius.entity.Product;
import com.adgenius.entity.User;
import com.adgenius.enums.MediaType;
import com.adgenius.exception.ApiException;
import com.adgenius.integration.aws.StorageService;
import com.adgenius.repository.MediaAssetRepository;
import com.adgenius.repository.UserRepository;
import com.adgenius.util.FileValidator;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
public class MediaService {
    private final MediaAssetRepository mediaAssetRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final AppProperties props;

    public MediaService(MediaAssetRepository mediaAssetRepository,
                        UserRepository userRepository,
                        StorageService storageService,
                        AppProperties props) {
        this.mediaAssetRepository = mediaAssetRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.props = props;
    }

    @Transactional
    public MediaAsset store(Long userId, Product product, byte[] bytes, String contentType, String fileName, MediaType type) {
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        String key = "users/" + userId + "/" + type.name().toLowerCase() + "/" + UUID.randomUUID() + "-" + sanitize(fileName);
        storageService.put(key, bytes, contentType);
        MediaAsset asset = new MediaAsset();
        asset.setUser(user);
        asset.setProduct(product);
        asset.setType(type);
        asset.setStorageProvider(storageService.provider());
        asset.setObjectKey(key);
        asset.setContentType(contentType);
        asset.setFileName(fileName);
        asset.setByteSize(bytes.length);
        return mediaAssetRepository.save(asset);
    }

    @Transactional
    public MediaResponse uploadReference(Long userId, Product product, MultipartFile file) {
        FileValidator.validateImage(file, props.getStorage().getMaxUploadBytes());
        try {
            MediaAsset asset = store(userId, product, file.getBytes(), file.getContentType(), file.getOriginalFilename(), MediaType.REFERENCE);
            return toResponse(asset);
        } catch (java.io.IOException e) {
            throw ApiException.badRequest("Unable to read uploaded file");
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<MediaResponse> list(Long userId, MediaType type, Pageable pageable) {
        var page = type == null
                ? mediaAssetRepository.findByUserIdAndDeletedAtIsNull(userId, pageable)
                : mediaAssetRepository.findByUserIdAndTypeAndDeletedAtIsNull(userId, type, pageable);
        return PageResponse.from(page.map(this::toResponse));
    }

    @Transactional
    public void delete(Long userId, Long id) {
        MediaAsset asset = owned(userId, id);
        asset.setDeletedAt(Instant.now());
        mediaAssetRepository.save(asset);
    }

    public MediaAsset owned(Long userId, Long id) {
        return mediaAssetRepository.findByIdAndUserIdAndDeletedAtIsNull(id, userId)
                .orElseThrow(() -> ApiException.notFound("Media not found"));
    }

    public MediaResponse toResponse(MediaAsset asset) {
        return MediaResponse.from(asset, storageService.presignedUrl(asset.getObjectKey(), Duration.ofMinutes(15)));
    }

    public byte[] bytes(MediaAsset asset) {
        return storageService.get(asset.getObjectKey());
    }

    private String sanitize(String name) {
        if (name == null) return "file.bin";
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
