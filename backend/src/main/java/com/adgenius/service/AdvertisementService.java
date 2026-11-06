package com.adgenius.service;

import com.adgenius.dto.PageResponse;
import com.adgenius.dto.ad.AdvertisementResponse;
import com.adgenius.entity.Advertisement;
import com.adgenius.entity.Favorite;
import com.adgenius.entity.User;
import com.adgenius.exception.ApiException;
import com.adgenius.repository.AdvertisementRepository;
import com.adgenius.repository.FavoriteRepository;
import com.adgenius.repository.UserRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.stream.Collectors;

@Service
public class AdvertisementService {
    private final AdvertisementRepository advertisementRepository;
    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final MediaService mediaService;

    public AdvertisementService(AdvertisementRepository advertisementRepository,
                                FavoriteRepository favoriteRepository,
                                UserRepository userRepository,
                                MediaService mediaService) {
        this.advertisementRepository = advertisementRepository;
        this.favoriteRepository = favoriteRepository;
        this.userRepository = userRepository;
        this.mediaService = mediaService;
    }

    @Transactional(readOnly = true)
    public PageResponse<AdvertisementResponse> list(Long userId, Pageable pageable) {
        return PageResponse.from(advertisementRepository.findByUserIdAndDeletedAtIsNull(userId, pageable)
                .map(ad -> toResponse(userId, ad)));
    }

    @Transactional(readOnly = true)
    public AdvertisementResponse get(Long userId, Long id) {
        return toResponse(userId, owned(userId, id));
    }

    @Transactional
    public void delete(Long userId, Long id) {
        Advertisement ad = owned(userId, id);
        ad.setDeletedAt(Instant.now());
        advertisementRepository.save(ad);
    }

    @Transactional
    public AdvertisementResponse toggleFavorite(Long userId, Long id) {
        Advertisement ad = owned(userId, id);
        var existing = favoriteRepository.findByUserIdAndAdvertisementId(userId, id);
        if (existing.isPresent()) {
            favoriteRepository.delete(existing.get());
        } else {
            User user = userRepository.findById(userId).orElseThrow();
            Favorite fav = new Favorite();
            fav.setUser(user);
            fav.setAdvertisement(ad);
            favoriteRepository.save(fav);
        }
        return toResponse(userId, ad);
    }

    public Advertisement owned(Long userId, Long id) {
        return advertisementRepository.findByIdAndUserIdAndDeletedAtIsNull(id, userId)
                .orElseThrow(() -> ApiException.notFound("Advertisement not found"));
    }

    public AdvertisementResponse toResponse(Long userId, Advertisement ad) {
        boolean fav = favoriteRepository.existsByUserIdAndAdvertisementId(userId, ad.getId());
        var media = ad.getMedia().stream().map(mediaService::toResponse).collect(Collectors.toList());
        return AdvertisementResponse.from(ad, fav, media);
    }
}
