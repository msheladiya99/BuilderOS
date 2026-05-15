-- Demo seed (run after migrate)
INSERT INTO subscription_plans (name, code, max_projects, max_users, price_monthly)
VALUES ('Starter', 'starter', 3, 10, 4999),
       ('Professional', 'pro', 10, 50, 14999),
       ('Enterprise', 'enterprise', 999, 999, 49999)
ON CONFLICT (code) DO NOTHING;
