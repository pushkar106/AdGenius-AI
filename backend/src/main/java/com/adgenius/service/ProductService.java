package com.adgenius.service;

import com.adgenius.dto.PageResponse;
import com.adgenius.dto.product.ProductRequest;
import com.adgenius.dto.product.ProductResponse;
import com.adgenius.entity.Product;
import com.adgenius.entity.User;
import com.adgenius.enums.AdCategory;
import com.adgenius.exception.ApiException;
import com.adgenius.repository.ProductRepository;
import com.adgenius.repository.UserRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;

    public ProductService(ProductRepository productRepository, UserRepository userRepository, ActivityService activityService) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
    }

    @Transactional
    public ProductResponse create(Long userId, ProductRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        Product product = new Product();
        product.setUser(user);
        apply(product, request);
        product = productRepository.save(product);
        activityService.log(userId, userId, "PRODUCT_CREATED", "PRODUCT", String.valueOf(product.getId()), null);
        return ProductResponse.from(product);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> list(Long userId, AdCategory category, String q, Pageable pageable) {
        String query = (q == null || q.isBlank()) ? null : q.trim();
        return PageResponse.from(productRepository.search(userId, category, query, pageable).map(ProductResponse::from));
    }

    @Transactional(readOnly = true)
    public ProductResponse get(Long userId, Long id) {
        return ProductResponse.from(owned(userId, id));
    }

    @Transactional
    public ProductResponse update(Long userId, Long id, ProductRequest request) {
        Product product = owned(userId, id);
        apply(product, request);
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public void delete(Long userId, Long id) {
        Product product = owned(userId, id);
        product.setDeletedAt(Instant.now());
        productRepository.save(product);
        activityService.log(userId, userId, "PRODUCT_DELETED", "PRODUCT", String.valueOf(id), null);
    }

    public Product owned(Long userId, Long id) {
        return productRepository.findByIdAndUserIdAndDeletedAtIsNull(id, userId)
                .orElseThrow(() -> ApiException.notFound("Product not found"));
    }

    private void apply(Product product, ProductRequest request) {
        product.setName(request.name().trim());
        product.setDescription(request.description());
        product.setCategory(request.category());
        product.setBrand(request.brand());
        product.setTargetAudience(request.targetAudience());
        product.setWebsiteUrl(request.websiteUrl());
    }
}
