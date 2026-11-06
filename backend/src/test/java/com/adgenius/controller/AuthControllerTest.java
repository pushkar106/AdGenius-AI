package com.adgenius.controller;

import com.adgenius.dto.auth.AuthResponse;
import com.adgenius.dto.auth.LoginRequest;
import com.adgenius.dto.auth.RegisterRequest;
import com.adgenius.dto.user.UserResponse;
import com.adgenius.enums.AccountStatus;
import com.adgenius.enums.RoleName;
import com.adgenius.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Test
    @DisplayName("POST /api/v1/auth/register returns 200 with result")
    void testRegisterSuccess() throws Exception {
        RegisterRequest req = new RegisterRequest("founder@brand.ai", "SecretPass123!", "Alex Founder", "Apex Brands");
        when(authService.register(any())).thenReturn(new AuthService.RegisterResult("Registered successfully", false, "demo-token-123"));

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.message").value("Registered successfully"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login returns 200 and access token")
    void testLoginSuccess() throws Exception {
        LoginRequest req = new LoginRequest("founder@brand.ai", "SecretPass123!");
        UserResponse u = new UserResponse(1L, "founder@brand.ai", "Alex Founder", true, AccountStatus.ACTIVE,
                null, "Apex Brands", "UTC", Set.of(RoleName.USER), Instant.now(), Instant.now());
        AuthResponse res = new AuthResponse("mock-jwt-token", "Bearer", 900L, u);

        when(authService.login(any(), any())).thenReturn(res);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("mock-jwt-token"))
                .andExpect(jsonPath("$.data.user.email").value("founder@brand.ai"));
    }
}
