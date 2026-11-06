INSERT INTO roles (name) VALUES ('SUPER_ADMIN'), ('ADMIN'), ('USER');

INSERT INTO subscription_plans (code, name, description, monthly_price_paise, yearly_price_paise, monthly_credits, image_cost, video_cost, max_products, features_json, active)
VALUES
('FREE', 'Free', 'Explore AdGenius AI with starter credits and watermarks in demo-friendly limits.', 0, 0, 50, 2, 10, 5,
 '["50 monthly credits","Image generation","Product library","Email support"]', TRUE),
('STARTER', 'Starter', 'For solopreneurs launching their first AI ad campaigns.', 149900, 1499000, 300, 2, 8, 25,
 '["300 monthly credits","HD image ads","Short video ads","Priority email support"]', TRUE),
('PRO', 'Pro', 'For growing brands that need cinematic creatives and team-ready workflows.', 499900, 4999000, 1200, 1, 6, 100,
 '["1200 monthly credits","4K-ready image pipelines","Promotional videos","Avatar copy studio","Priority support"]', TRUE),
('ENTERPRISE', 'Enterprise', 'Custom limits, SSO-ready architecture, and dedicated onboarding.', 0, 0, 10000, 1, 4, 10000,
 '["Custom credits","Dedicated success manager","Security review","Invoice billing"]', TRUE);
