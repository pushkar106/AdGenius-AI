package com.adgenius.security;

import com.adgenius.entity.User;
import com.adgenius.enums.AccountStatus;
import com.adgenius.enums.RoleName;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserPrincipal implements UserDetails {
    private final Long id;
    private final String email;
    private final String passwordHash;
    private final AccountStatus status;
    private final boolean emailVerified;
    private final List<GrantedAuthority> authorities;

    public UserPrincipal(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.passwordHash = user.getPasswordHash();
        this.status = user.getStatus();
        this.emailVerified = user.isEmailVerified();
        this.authorities = user.getRoles().stream()
                .map(r -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + r.getName().name()))
                .toList();
    }

    public Long getId() {
        return id;
    }

    public boolean hasRole(RoleName role) {
        return authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_" + role.name()));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonLocked() {
        return status != AccountStatus.BLOCKED && status != AccountStatus.DELETED;
    }

    @Override
    public boolean isEnabled() {
        return status == AccountStatus.ACTIVE || status == AccountStatus.PENDING_VERIFICATION;
    }
}
