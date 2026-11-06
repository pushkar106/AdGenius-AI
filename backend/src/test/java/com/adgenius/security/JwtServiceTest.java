package com.adgenius.security;

import com.adgenius.config.AppProperties;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        AppProperties props = new AppProperties();
        props.getJwt().setAccessSecret("very-secure-jwt-secret-key-32chars-minimum!");
        props.getJwt().setRefreshSecret("very-secure-refresh-token-secret-32ch!");
        props.getJwt().setAccessTtlSeconds(900);
        props.getJwt().setRefreshTtlSeconds(1209600);
        jwtService = new JwtService(props);
    }

    @Test
    @DisplayName("Creates valid JWT access token and parses claims correctly")
    void testCreateAndParseToken() {
        Long userId = 42L;
        String email = "marketer@adgenius.ai";
        List<String> roles = List.of("ROLE_USER");

        String token = jwtService.createAccessToken(userId, email, roles);
        assertNotNull(token);
        assertFalse(token.isBlank());

        Claims claims = jwtService.parseAccess(token);
        assertEquals(String.valueOf(userId), claims.getSubject());
        assertEquals(email, claims.get("email", String.class));
        assertNotNull(claims.getExpiration());
        assertTrue(claims.getExpiration().getTime() > System.currentTimeMillis());
    }

    @Test
    @DisplayName("Throws exception when access key is shorter than 32 characters")
    void testShortKeyValidation() {
        AppProperties shortProps = new AppProperties();
        shortProps.getJwt().setAccessSecret("short");
        JwtService shortService = new JwtService(shortProps);

        assertThrows(IllegalStateException.class, () -> shortService.createAccessToken(1L, "a@b.com", List.of()));
    }
}
