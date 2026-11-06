package com.adgenius.controller;

import com.adgenius.dto.ApiResponse;
import com.adgenius.dto.PageResponse;
import com.adgenius.dto.product.ProductRequest;
import com.adgenius.dto.product.ProductResponse;
import com.adgenius.enums.AdCategory;
import com.adgenius.security.SecurityUtils;
import com.adgenius.service.ProductService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/products")
@Tag(name = "Products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ApiResponse<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        return ApiResponse.ok(productService.create(SecurityUtils.currentUserId(), request));
    }

    @GetMapping
    public ApiResponse<PageResponse<ProductResponse>> list(
            @RequestParam(required = false) AdCategory category,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        Sort s = parseSort(sort);
        return ApiResponse.ok(productService.list(SecurityUtils.currentUserId(), category, q, PageRequest.of(page, size, s)));
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(productService.get(SecurityUtils.currentUserId(), id));
    }

    @PutMapping("/{id}")
    public ApiResponse<ProductResponse> update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ApiResponse.ok(productService.update(SecurityUtils.currentUserId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        productService.delete(SecurityUtils.currentUserId(), id);
        return ApiResponse.ok(null);
    }

    static Sort parseSort(String sort) {
        String[] parts = sort.split(",");
        if (parts.length == 2 && parts[1].equalsIgnoreCase("asc")) {
            return Sort.by(parts[0]).ascending();
        }
        return Sort.by(parts[0]).descending();
    }
}
