package com.adgenius.security;

import com.adgenius.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {
    private final AppProperties props;

    public JwtService(AppProperties props) {
        this.props = props;
    }

    public String createAccessToken(Long userId, String email, List<String> roles) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(props.getJwt().getAccessTtlSeconds());
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("roles", roles)
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(accessKey())
                .compact();
    }

    public Claims parseAccess(String token) {
        return Jwts.parser().verifyWith(accessKey()).build().parseSignedClaims(token).getPayload();
    }

    public long accessTtlSeconds() {
        return props.getJwt().getAccessTtlSeconds();
    }

    private SecretKey accessKey() {
        byte[] bytes = props.getJwt().getAccessSecret().getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT_ACCESS_SECRET must be at least 32 characters");
        }
        return Keys.hmacShaKeyFor(bytes);
    }
}
