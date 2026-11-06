package com.adgenius.entity;

import com.adgenius.enums.AccountStatus;
import com.adgenius.enums.RoleName;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private AccountStatus status = AccountStatus.PENDING_VERIFICATION;

    @Column(name = "avatar_url", length = 1024)
    private String avatarUrl;

    private String company;

    private String timezone = "UTC";

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public boolean hasRole(RoleName roleName) {
        return roles.stream().anyMatch(r -> r.getName() == roleName);
    }

    public boolean isAdmin() {
        return hasRole(RoleName.ADMIN) || hasRole(RoleName.SUPER_ADMIN);
    }
}
