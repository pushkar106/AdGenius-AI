package com.adgenius.controller;

import com.adgenius.dto.ApiResponse;
import com.adgenius.dto.PageResponse;
import com.adgenius.entity.CreditTransaction;
import com.adgenius.security.SecurityUtils;
import com.adgenius.service.CreditService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/credits")
@Tag(name = "Credits")
public class CreditController {
    private final CreditService creditService;

    public CreditController(CreditService creditService) {
        this.creditService = creditService;
    }

    @GetMapping("/balance")
    public ApiResponse<Map<String, Object>> balance() {
        var account = creditService.getAccount(SecurityUtils.currentUserId());
        return ApiResponse.ok(Map.of(
                "balance", account.getBalance(),
                "lifetimeGranted", account.getLifetimeGranted(),
                "lifetimeSpent", account.getLifetimeSpent()
        ));
    }

    @GetMapping("/transactions")
    public ApiResponse<PageResponse<CreditTransaction>> transactions(@RequestParam(defaultValue = "0") int page,
                                                                    @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(creditService.history(SecurityUtils.currentUserId(), PageRequest.of(page, size)));
    }
}
