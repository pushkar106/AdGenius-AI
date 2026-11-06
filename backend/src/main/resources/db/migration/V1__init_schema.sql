CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(32) NOT NULL UNIQUE
);

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    avatar_url VARCHAR(1024),
    company VARCHAR(160),
    timezone VARCHAR(64) DEFAULT 'UTC',
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE INDEX idx_users_status ON users (status);
CREATE INDEX idx_users_created_at ON users (created_at);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles (id)
);

CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(128) NOT NULL,
    family_id VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    replaced_by_id BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_refresh_token_hash UNIQUE (token_hash),
    CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_refresh_user ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_family ON refresh_tokens (family_id);

CREATE TABLE email_verification_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(128) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_email_verify_hash UNIQUE (token_hash),
    CONSTRAINT fk_email_verify_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(128) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_password_reset_hash UNIQUE (token_hash),
    CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE subscription_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(80) NOT NULL,
    description VARCHAR(500) NOT NULL,
    monthly_price_paise INT NOT NULL,
    yearly_price_paise INT NOT NULL,
    monthly_credits INT NOT NULL,
    image_cost INT NOT NULL,
    video_cost INT NOT NULL,
    max_products INT NOT NULL,
    features_json TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_plan_code UNIQUE (code)
);

CREATE TABLE credit_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    balance INT NOT NULL DEFAULT 0,
    lifetime_granted INT NOT NULL DEFAULT 0,
    lifetime_spent INT NOT NULL DEFAULT 0,
    version BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_credit_account_user UNIQUE (user_id),
    CONSTRAINT fk_credit_account_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT chk_credit_balance_non_negative CHECK (balance >= 0)
);

CREATE TABLE credit_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    type VARCHAR(32) NOT NULL,
    amount INT NOT NULL,
    balance_after INT NOT NULL,
    reference_type VARCHAR(64),
    reference_id VARCHAR(64),
    idempotency_key VARCHAR(80),
    description VARCHAR(255) NOT NULL,
    created_by BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_credit_idempotency UNIQUE (idempotency_key),
    CONSTRAINT fk_credit_tx_account FOREIGN KEY (account_id) REFERENCES credit_accounts (id),
    CONSTRAINT fk_credit_tx_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_credit_tx_user_created ON credit_transactions (user_id, created_at);

CREATE TABLE subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plan_id BIGINT NOT NULL,
    status VARCHAR(32) NOT NULL,
    billing_cycle VARCHAR(16) NOT NULL DEFAULT 'MONTHLY',
    current_period_start DATETIME NOT NULL,
    current_period_end DATETIME NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    provider VARCHAR(32) NOT NULL DEFAULT 'RAZORPAY',
    provider_subscription_id VARCHAR(128),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sub_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_sub_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans (id)
);

CREATE INDEX idx_sub_user_status ON subscriptions (user_id, status);

CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    subscription_id BIGINT NULL,
    provider VARCHAR(32) NOT NULL,
    provider_order_id VARCHAR(128),
    provider_payment_id VARCHAR(128),
    amount_paise INT NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    status VARCHAR(32) NOT NULL,
    description VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_provider_payment UNIQUE (provider, provider_payment_id),
    CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_payment_sub FOREIGN KEY (subscription_id) REFERENCES subscriptions (id)
);

CREATE TABLE payment_webhook_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(32) NOT NULL,
    event_id VARCHAR(128) NOT NULL,
    event_type VARCHAR(80) NOT NULL,
    payload_hash VARCHAR(128) NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    processing_error VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    CONSTRAINT uk_webhook_event UNIQUE (provider, event_id)
);

CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(160) NOT NULL,
    description TEXT,
    category VARCHAR(64) NOT NULL,
    brand VARCHAR(120),
    target_audience VARCHAR(255),
    website_url VARCHAR(1024),
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_products_user ON products (user_id, deleted_at);
CREATE INDEX idx_products_category ON products (category);

CREATE TABLE media_assets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NULL,
    type VARCHAR(32) NOT NULL,
    storage_provider VARCHAR(16) NOT NULL,
    object_key VARCHAR(512) NOT NULL,
    content_type VARCHAR(128) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    byte_size BIGINT NOT NULL DEFAULT 0,
    width INT,
    height INT,
    duration_seconds INT,
    checksum VARCHAR(128),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_media_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_media_product FOREIGN KEY (product_id) REFERENCES products (id)
);

CREATE INDEX idx_media_user_type ON media_assets (user_id, type, deleted_at);

CREATE TABLE generation_jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NULL,
    type VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL,
    provider VARCHAR(32) NOT NULL,
    provider_job_id VARCHAR(191),
    prompt TEXT,
    negative_prompt TEXT,
    style VARCHAR(64),
    aspect_ratio VARCHAR(16),
    resolution VARCHAR(32),
    background_style VARCHAR(64),
    model VARCHAR(128),
    duration_seconds INT,
    camera_movement VARCHAR(64),
    motion_intensity VARCHAR(32),
    music_option VARCHAR(64),
    variation_count INT NOT NULL DEFAULT 1,
    credit_cost INT NOT NULL DEFAULT 0,
    credit_hold_key VARCHAR(80),
    credit_charged BOOLEAN NOT NULL DEFAULT FALSE,
    credit_refunded BOOLEAN NOT NULL DEFAULT FALSE,
    demo_mode BOOLEAN NOT NULL DEFAULT FALSE,
    error_message VARCHAR(1000),
    result_json TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    CONSTRAINT fk_job_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_job_product FOREIGN KEY (product_id) REFERENCES products (id)
);

CREATE INDEX idx_jobs_user_status ON generation_jobs (user_id, status, created_at);
CREATE INDEX idx_jobs_status ON generation_jobs (status);

CREATE TABLE advertisements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NULL,
    job_id BIGINT NULL,
    title VARCHAR(200) NOT NULL,
    headline VARCHAR(255),
    caption TEXT,
    call_to_action VARCHAR(160),
    hashtags VARCHAR(500),
    script_text TEXT,
    category VARCHAR(64),
    style VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'READY',
    demo_mode BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_ad_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_ad_product FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT fk_ad_job FOREIGN KEY (job_id) REFERENCES generation_jobs (id)
);

CREATE INDEX idx_ads_user ON advertisements (user_id, deleted_at, created_at);

CREATE TABLE advertisement_media (
    advertisement_id BIGINT NOT NULL,
    media_asset_id BIGINT NOT NULL,
    PRIMARY KEY (advertisement_id, media_asset_id),
    CONSTRAINT fk_ad_media_ad FOREIGN KEY (advertisement_id) REFERENCES advertisements (id),
    CONSTRAINT fk_ad_media_asset FOREIGN KEY (media_asset_id) REFERENCES media_assets (id)
);

CREATE TABLE favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    advertisement_id BIGINT NULL,
    media_asset_id BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_fav_ad FOREIGN KEY (advertisement_id) REFERENCES advertisements (id),
    CONSTRAINT fk_fav_media FOREIGN KEY (media_asset_id) REFERENCES media_assets (id)
);

CREATE UNIQUE INDEX uk_fav_ad ON favorites (user_id, advertisement_id);
CREATE UNIQUE INDEX uk_fav_media ON favorites (user_id, media_asset_id);

CREATE TABLE activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    actor_id BIGINT NULL,
    action VARCHAR(80) NOT NULL,
    entity_type VARCHAR(64),
    entity_id VARCHAR(64),
    metadata_json TEXT,
    ip_address VARCHAR(64),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_activity_created ON activity_logs (created_at);
CREATE INDEX idx_activity_user ON activity_logs (user_id, created_at);

CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(160) NOT NULL,
    message VARCHAR(500) NOT NULL,
    type VARCHAR(32) NOT NULL,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_notif_user ON notifications (user_id, read_at);
