package com.adgenius.controller;

import com.adgenius.dto.ApiResponse;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/csrf")
public class CsrfController {
    @GetMapping
    public ApiResponse<Map<String, String>> csrf(CsrfToken token) {
        return ApiResponse.ok(Map.of("token", token.getToken(), "headerName", token.getHeaderName()));
    }
}
