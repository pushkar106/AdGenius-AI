package com.adgenius.service;

import com.adgenius.dto.product.ProductRequest;
import com.adgenius.dto.product.ProductResponse;
import com.adgenius.entity.Product;
import com.adgenius.entity.User;
import com.adgenius.enums.AdCategory;
import com.adgenius.exception.ApiException;
import com.adgenius.repository.ProductRepository;
import com.adgenius.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ActivityService activityService;

    @InjectMocks
    private ProductService productService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("brand@adgenius.ai");
    }

    @Test
    @DisplayName("Creates a new product for the authenticated user")
    void testCreateProduct() {
        ProductRequest request = new ProductRequest("Aura Watch", "Luxury smartwatch", AdCategory.ELECTRONICS,
                "Aura", "Luxury Enthusiasts", "https://aurawatch.com");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productRepository.save(any(Product.class))).thenAnswer(i -> {
            Product p = i.getArgument(0);
            p.setId(10L);
            return p;
        });

        ProductResponse response = productService.create(1L, request);

        assertNotNull(response);
        assertEquals(10L, response.id());
        assertEquals("Aura Watch", response.name());
        assertEquals(AdCategory.ELECTRONICS, response.category());
        verify(activityService, times(1)).log(eq(1L), eq(1L), eq("PRODUCT_CREATED"), eq("PRODUCT"), eq("10"), isNull());
    }

    @Test
    @DisplayName("Throws NotFound ApiException when product is not owned by user")
    void testOwnershipValidation() {
        when(productRepository.findByIdAndUserIdAndDeletedAtIsNull(99L, 1L)).thenReturn(Optional.empty());

        assertThrows(ApiException.class, () -> productService.get(1L, 99L));
    }
}
