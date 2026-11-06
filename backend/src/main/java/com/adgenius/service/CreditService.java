package com.adgenius.service;

import com.adgenius.dto.PageResponse;
import com.adgenius.entity.CreditAccount;
import com.adgenius.entity.CreditTransaction;
import com.adgenius.entity.User;
import com.adgenius.enums.CreditTransactionType;
import com.adgenius.exception.ApiException;
import com.adgenius.repository.CreditAccountRepository;
import com.adgenius.repository.CreditTransactionRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class CreditService {
    private final CreditAccountRepository accountRepository;
    private final CreditTransactionRepository transactionRepository;

    public CreditService(CreditAccountRepository accountRepository,
                         CreditTransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public CreditAccount createAccount(User user, int initialCredits) {
        CreditAccount account = new CreditAccount();
        account.setUser(user);
        account.setBalance(0);
        account.setLifetimeGranted(0);
        account.setLifetimeSpent(0);
        account = accountRepository.save(account);
        if (initialCredits > 0) {
            apply(user.getId(), CreditTransactionType.GRANT, initialCredits,
                    "account-open-" + user.getId(), "USER", String.valueOf(user.getId()),
                    "Welcome credits", user.getId());
        }
        return account;
    }

    @Transactional(readOnly = true)
    public CreditAccount getAccount(Long userId) {
        return accountRepository.findByUserId(userId)
                .orElseThrow(() -> ApiException.notFound("Credit account not found"));
    }

    @Transactional
    public CreditTransaction capture(Long userId, int amount, String idempotencyKey, String refType, String refId, String description) {
        if (amount <= 0) throw ApiException.badRequest("Credit amount must be positive");
        return apply(userId, CreditTransactionType.HOLD_CAPTURE, -amount, idempotencyKey, refType, refId, description, userId);
    }

    @Transactional
    public CreditTransaction refund(Long userId, int amount, String idempotencyKey, String refType, String refId, String description) {
        if (amount <= 0) throw ApiException.badRequest("Refund amount must be positive");
        return apply(userId, CreditTransactionType.REFUND, amount, idempotencyKey, refType, refId, description, userId);
    }

    @Transactional
    public CreditTransaction grant(Long userId, int amount, String idempotencyKey, String description, Long actorId) {
        if (amount == 0) throw ApiException.badRequest("Adjustment cannot be zero");
        CreditTransactionType type = amount > 0 ? CreditTransactionType.ADMIN_ADJUST : CreditTransactionType.ADMIN_ADJUST;
        return apply(userId, type, amount, idempotencyKey, "ADMIN", String.valueOf(actorId), description, actorId);
    }

    @Transactional
    public CreditTransaction planGrant(Long userId, int amount, String idempotencyKey, String description) {
        return apply(userId, CreditTransactionType.PLAN_GRANT, amount, idempotencyKey, "PLAN", null, description, userId);
    }

    private CreditTransaction apply(Long userId, CreditTransactionType type, int signedAmount,
                                    String idempotencyKey, String refType, String refId,
                                    String description, Long actorId) {
        if (idempotencyKey != null) {
            var existing = transactionRepository.findByIdempotencyKey(idempotencyKey);
            if (existing.isPresent()) {
                return existing.get();
            }
        }
        CreditAccount account = accountRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> ApiException.notFound("Credit account not found"));
        int next = account.getBalance() + signedAmount;
        if (next < 0) {
            throw ApiException.unprocessable("INSUFFICIENT_CREDITS", "Not enough credits for this operation");
        }
        account.setBalance(next);
        if (signedAmount > 0) {
            account.setLifetimeGranted(account.getLifetimeGranted() + signedAmount);
        } else {
            account.setLifetimeSpent(account.getLifetimeSpent() + Math.abs(signedAmount));
        }
        account.setUpdatedAt(Instant.now());
        accountRepository.save(account);

        CreditTransaction tx = new CreditTransaction();
        tx.setAccount(account);
        tx.setUserId(userId);
        tx.setType(type);
        tx.setAmount(signedAmount);
        tx.setBalanceAfter(next);
        tx.setReferenceType(refType);
        tx.setReferenceId(refId);
        tx.setIdempotencyKey(idempotencyKey);
        tx.setDescription(description);
        tx.setCreatedBy(actorId);
        return transactionRepository.save(tx);
    }

    public PageResponse<CreditTransaction> history(Long userId, Pageable pageable) {
        return PageResponse.from(transactionRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable));
    }
}
