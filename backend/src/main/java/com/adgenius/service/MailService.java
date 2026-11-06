package com.adgenius.service;

import com.adgenius.config.AppProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Slf4j
@Service
public class MailService {
    private final AppProperties props;
    private final Environment environment;
    private final JavaMailSender mailSender;

    public MailService(AppProperties props, Environment environment, JavaMailSender mailSender) {
        this.props = props;
        this.environment = environment;
        this.mailSender = mailSender;
    }

    public boolean isMailConfigured() {
        String host = environment.getProperty("spring.mail.host", "");
        return host != null && !host.isBlank();
    }

    public boolean isDevLike() {
        return Arrays.stream(environment.getActiveProfiles())
                .anyMatch(p -> p.equals("dev") || p.equals("test") || p.equals("local"));
    }

    public void send(String to, String subject, String body) {
        if (!isMailConfigured()) {
            log.info("[DEMO MAIL] To={} Subject={} Body={}", to, subject, body);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(props.getMail().getFrom());
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    public void sendVerification(String to, String token) {
        String link = props.getBaseUrl() + "/verify-email?token=" + token;
        send(to, "Verify your AdGenius AI account",
                "Welcome to AdGenius AI.\n\nConfirm your email: " + link + "\nThis link expires in 24 hours.");
    }

    public void sendPasswordReset(String to, String token) {
        String link = props.getBaseUrl() + "/reset-password?token=" + token;
        send(to, "Reset your AdGenius AI password",
                "We received a password reset request.\n\nReset your password: " + link + "\nIf you did not request this, ignore this email.");
    }
}
