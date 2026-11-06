package com.adgenius.credit;

import com.adgenius.entity.CreditAccount;
import com.adgenius.entity.CreditTransaction;
import com.adgenius.entity.User;
import com.adgenius.exception.ApiException;
import com.adgenius.repository.CreditAccountRepository;
import com.adgenius.repository.CreditTransactionRepository;
import com.adgenius.service.CreditService;
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
class CreditServiceTest {

    @Mock
    private CreditAccountRepository accountRepository;

    @Mock
    private CreditTransactionRepository transactionRepository;

    @InjectMocks
    private CreditService creditService;

    private User testUser;
    private CreditAccount testAccount;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(100L);
        testUser.setEmail("creative@brand.com");

        testAccount = new CreditAccount();
        testAccount.setId(1L);
        testAccount.setUser(testUser);
        testAccount.setBalance(50);
        testAccount.setLifetimeGranted(50);
        testAccount.setLifetimeSpent(0);
    }

    @Test
    @DisplayName("Deducts credits correctly when sufficient balance exists")
    void testSuccessfulCapture() {
        when(transactionRepository.findByIdempotencyKey("job-1")).thenReturn(Optional.empty());
        when(accountRepository.findByUserIdForUpdate(100L)).thenReturn(Optional.of(testAccount));
        when(accountRepository.save(any(CreditAccount.class))).thenAnswer(i -> i.getArgument(0));
        when(transactionRepository.save(any(CreditTransaction.class))).thenAnswer(i -> i.getArgument(0));

        CreditTransaction tx = creditService.capture(100L, 10, "job-1", "JOB", "1", "AI image generation");

        assertNotNull(tx);
        assertEquals(-10, tx.getAmount());
        assertEquals(40, tx.getBalanceAfter());
        assertEquals(40, testAccount.getBalance());
        assertEquals(10, testAccount.getLifetimeSpent());
    }

    @Test
    @DisplayName("Throws ApiException when credit balance is insufficient")
    void testInsufficientBalanceThrowsException() {
        testAccount.setBalance(5);
        when(transactionRepository.findByIdempotencyKey("job-large")).thenReturn(Optional.empty());
        when(accountRepository.findByUserIdForUpdate(100L)).thenReturn(Optional.of(testAccount));

        ApiException ex = assertThrows(ApiException.class, () ->
                creditService.capture(100L, 10, "job-large", "JOB", "2", "AI video generation"));

        assertEquals("INSUFFICIENT_CREDITS", ex.getCode());
    }

    @Test
    @DisplayName("Returns existing transaction if idempotency key is already recorded")
    void testIdempotencyDeduplication() {
        CreditTransaction existing = new CreditTransaction();
        existing.setIdempotencyKey("duplicate-key");
        existing.setBalanceAfter(40);
        existing.setAmount(-10);

        when(transactionRepository.findByIdempotencyKey("duplicate-key")).thenReturn(Optional.of(existing));

        CreditTransaction result = creditService.capture(100L, 10, "duplicate-key", "JOB", "3", "Retry");

        assertEquals(existing, result);
        verify(accountRepository, never()).findByUserIdForUpdate(anyLong());
    }
}
