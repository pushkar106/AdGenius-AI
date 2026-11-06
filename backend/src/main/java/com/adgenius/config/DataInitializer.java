package com.adgenius.config;

import com.adgenius.entity.Role;
import com.adgenius.entity.User;
import com.adgenius.enums.AccountStatus;
import com.adgenius.enums.RoleName;
import com.adgenius.repository.RoleRepository;
import com.adgenius.repository.UserRepository;
import com.adgenius.service.CreditService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Slf4j
@Component
public class DataInitializer implements CommandLineRunner {
    private final AppProperties props;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final CreditService creditService;

    public DataInitializer(AppProperties props,
                           UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder,
                           CreditService creditService) {
        this.props = props;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.creditService = creditService;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.findByEmailIgnoreCase(props.getAdmin().getEmail()).isPresent()) {
            return;
        }
        Role superAdmin = roleRepository.findByName(RoleName.SUPER_ADMIN)
                .orElseThrow(() -> new IllegalStateException("SUPER_ADMIN role missing. Run Flyway migrations."));
        User admin = new User();
        admin.setEmail(props.getAdmin().getEmail().toLowerCase());
        admin.setFullName(props.getAdmin().getName());
        admin.setPasswordHash(passwordEncoder.encode(props.getAdmin().getPassword()));
        admin.setEmailVerified(true);
        admin.setStatus(AccountStatus.ACTIVE);
        admin.setRoles(Set.of(superAdmin));
        admin = userRepository.save(admin);
        creditService.createAccount(admin, 10_000);
        log.info("Bootstrapped SUPER_ADMIN account {}", admin.getEmail());
    }
}
