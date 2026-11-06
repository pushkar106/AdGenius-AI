package com.adgenius.service;

import com.adgenius.config.AppProperties;
import com.adgenius.dto.auth.*;
import com.adgenius.dto.user.UserResponse;
import com.adgenius.entity.*;
import com.adgenius.enums.AccountStatus;
import com.adgenius.enums.RoleName;
import com.adgenius.exception.ApiException;
import com.adgenius.repository.*;
import com.adgenius.security.JwtService;
import com.adgenius.util.HashUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.Set;

@Service
public class AuthService {
    public static final String REFRESH_COOKIE = "adgenius_refresh";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final SubscriptionPlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AppProperties props;
    private final MailService mailService;
    private final CreditService creditService;
    private final ActivityService activityService;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       EmailVerificationTokenRepository emailVerificationTokenRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       SubscriptionPlanRepository planRepository,
                       SubscriptionRepository subscriptionRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AppProperties props,
                       MailService mailService,
                       CreditService creditService,
                       ActivityService activityService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.planRepository = planRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.props = props;
        this.mailService = mailService;
        this.creditService = creditService;
        this.activityService = activityService;
    }

    @Transactional
    public RegisterResult register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw ApiException.conflict("An account with this email already exists");
        }
        Role userRole = roleRepository.findByName(RoleName.USER)
                .orElseThrow(() -> ApiException.badRequest("USER role is not seeded"));
        User user = new User();
        user.setEmail(request.email().trim().toLowerCase());
        user.setFullName(request.fullName().trim());
        user.setCompany(request.company());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setEmailVerified(false);
        user.setStatus(AccountStatus.PENDING_VERIFICATION);
        user.setRoles(Set.of(userRole));
        user = userRepository.save(user);
        creditService.createAccount(user, props.getCredits().getFreeInitial());
        attachFreePlan(user);
        String rawToken = HashUtil.randomToken(32);
        EmailVerificationToken evt = new EmailVerificationToken();
        evt.setUser(user);
        evt.setTokenHash(HashUtil.sha256(rawToken));
        evt.setExpiresAt(Instant.now().plus(Duration.ofHours(24)));
        emailVerificationTokenRepository.save(evt);
        mailService.sendVerification(user.getEmail(), rawToken);
        activityService.log(user.getId(), user.getId(), "USER_REGISTERED", "USER", String.valueOf(user.getId()), null);
        return new RegisterResult(
                "Account created. Please verify your email.",
                true,
                mailService.isDevLike() && !mailService.isMailConfigured() ? rawToken : null
        );
    }

    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw ApiException.unauthorized("Invalid email or password");
        }
        if (user.getStatus() == AccountStatus.BLOCKED) {
            throw ApiException.forbidden("This account has been blocked");
        }
        if (user.getStatus() == AccountStatus.DELETED) {
            throw ApiException.unauthorized("Invalid email or password");
        }
        if (!user.isEmailVerified()) {
            throw ApiException.forbidden("Please verify your email before signing in");
        }
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);
        activityService.log(user.getId(), user.getId(), "USER_LOGIN", "USER", String.valueOf(user.getId()), null);
        return issueSession(user, response, HashUtil.randomToken(16));
    }

    @Transactional
    public AuthResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        String raw = readCookie(request, REFRESH_COOKIE);
        if (raw == null) throw ApiException.unauthorized("Refresh token missing");
        RefreshToken stored = refreshTokenRepository.findByTokenHash(HashUtil.sha256(raw))
                .orElseThrow(() -> ApiException.unauthorized("Invalid refresh token"));
        if (stored.isRevoked() || stored.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.revokeFamily(stored.getFamilyId());
            clearRefreshCookie(response);
            throw ApiException.unauthorized("Refresh token expired or reused");
        }
        stored.setRevoked(true);
        User user = stored.getUser();
        if (user.getStatus() != AccountStatus.ACTIVE && user.getStatus() != AccountStatus.PENDING_VERIFICATION) {
            throw ApiException.forbidden("Account is not allowed to refresh sessions");
        }
        String family = stored.getFamilyId();
        AuthResponse issued = issueSession(user, response, family);
        stored.setReplacedById(null);
        refreshTokenRepository.save(stored);
        return issued;
    }

    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response, Long userId) {
        String raw = readCookie(request, REFRESH_COOKIE);
        if (raw != null) {
            refreshTokenRepository.findByTokenHash(HashUtil.sha256(raw)).ifPresent(t -> {
                refreshTokenRepository.revokeFamily(t.getFamilyId());
            });
        }
        if (userId != null) {
            refreshTokenRepository.revokeAllForUser(userId);
        }
        clearRefreshCookie(response);
    }

    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken evt = emailVerificationTokenRepository.findByTokenHash(HashUtil.sha256(token))
                .orElseThrow(() -> ApiException.badRequest("Invalid verification token"));
        if (evt.getUsedAt() != null || evt.getExpiresAt().isBefore(Instant.now())) {
            throw ApiException.badRequest("Verification token is expired or already used");
        }
        User user = evt.getUser();
        user.setEmailVerified(true);
        if (user.getStatus() == AccountStatus.PENDING_VERIFICATION) {
            user.setStatus(AccountStatus.ACTIVE);
        }
        evt.setUsedAt(Instant.now());
        userRepository.save(user);
        emailVerificationTokenRepository.save(evt);
    }

    @Transactional
    public RegisterResult resendVerification(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> ApiException.notFound("No account found for that email"));
        if (user.isEmailVerified()) {
            return new RegisterResult("Email is already verified.", false, null);
        }
        String rawToken = HashUtil.randomToken(32);
        EmailVerificationToken evt = new EmailVerificationToken();
        evt.setUser(user);
        evt.setTokenHash(HashUtil.sha256(rawToken));
        evt.setExpiresAt(Instant.now().plus(Duration.ofHours(24)));
        emailVerificationTokenRepository.save(evt);
        mailService.sendVerification(user.getEmail(), rawToken);
        return new RegisterResult("Verification email sent.", true,
                mailService.isDevLike() && !mailService.isMailConfigured() ? rawToken : null);
    }

    @Transactional
    public RegisterResult forgotPassword(String email) {
        var maybe = userRepository.findByEmailIgnoreCase(email);
        if (maybe.isEmpty()) {
            return new RegisterResult("If an account exists, a reset email has been sent.", true, null);
        }
        User user = maybe.get();
        String rawToken = HashUtil.randomToken(32);
        PasswordResetToken prt = new PasswordResetToken();
        prt.setUser(user);
        prt.setTokenHash(HashUtil.sha256(rawToken));
        prt.setExpiresAt(Instant.now().plus(Duration.ofHours(2)));
        passwordResetTokenRepository.save(prt);
        mailService.sendPasswordReset(user.getEmail(), rawToken);
        return new RegisterResult("If an account exists, a reset email has been sent.", true,
                mailService.isDevLike() && !mailService.isMailConfigured() ? rawToken : null);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken prt = passwordResetTokenRepository.findByTokenHash(HashUtil.sha256(request.token()))
                .orElseThrow(() -> ApiException.badRequest("Invalid reset token"));
        if (prt.getUsedAt() != null || prt.getExpiresAt().isBefore(Instant.now())) {
            throw ApiException.badRequest("Reset token is expired or already used");
        }
        User user = prt.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        prt.setUsedAt(Instant.now());
        userRepository.save(user);
        passwordResetTokenRepository.save(prt);
        refreshTokenRepository.revokeAllForUser(user.getId());
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw ApiException.badRequest("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        refreshTokenRepository.revokeAllForUser(userId);
    }

    private AuthResponse issueSession(User user, HttpServletResponse response, String familyId) {
        String rawRefresh = HashUtil.randomToken(48);
        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setTokenHash(HashUtil.sha256(rawRefresh));
        token.setFamilyId(familyId);
        token.setExpiresAt(Instant.now().plusSeconds(props.getJwt().getRefreshTtlSeconds()));
        refreshTokenRepository.save(token);
        writeRefreshCookie(response, rawRefresh);
        var roles = user.getRoles().stream().map(r -> r.getName().name()).toList();
        String access = jwtService.createAccessToken(user.getId(), user.getEmail(), roles);
        return new AuthResponse(access, "Bearer", jwtService.accessTtlSeconds(), UserResponse.from(user));
    }

    private void attachFreePlan(User user) {
        SubscriptionPlan plan = planRepository.findByCode("FREE").orElse(null);
        if (plan == null) return;
        Subscription sub = new Subscription();
        sub.setUser(user);
        sub.setPlan(plan);
        sub.setStatus(com.adgenius.enums.SubscriptionStatus.ACTIVE);
        sub.setBillingCycle("MONTHLY");
        sub.setCurrentPeriodStart(Instant.now());
        sub.setCurrentPeriodEnd(Instant.now().plus(Duration.ofDays(30)));
        sub.setProvider("INTERNAL");
        subscriptionRepository.save(sub);
    }

    private void writeRefreshCookie(HttpServletResponse response, String raw) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, raw)
                .httpOnly(true)
                .secure(props.getCookie().isSecure())
                .sameSite(props.getCookie().getSameSite())
                .path("/api/v1/auth")
                .maxAge(props.getJwt().getRefreshTtlSeconds())
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true)
                .secure(props.getCookie().isSecure())
                .sameSite(props.getCookie().getSameSite())
                .path("/api/v1/auth")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String readCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> name.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    public record RegisterResult(String message, boolean emailVerificationRequired, String debugToken) {}
}
