-- BuilderOS — public schema (platform / multi-tenant registry)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Subscription plans ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscription_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  code          VARCHAR(50) UNIQUE NOT NULL,
  max_projects  INT NOT NULL DEFAULT 5,
  max_users     INT NOT NULL DEFAULT 20,
  price_monthly NUMERIC(12, 2) DEFAULT 0,
  features      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

-- ─── Companies (tenants) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  subdomain       VARCHAR(63) NOT NULL UNIQUE,
  schema_name     VARCHAR(63) NOT NULL UNIQUE,
  logo_url        TEXT,
  gst_no          VARCHAR(15),
  pan_no          VARCHAR(10),
  status          VARCHAR(20) NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'suspended', 'trial', 'cancelled')),
  plan_id         UUID REFERENCES subscription_plans(id),
  trial_ends_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_companies_subdomain ON companies(subdomain) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status) WHERE deleted_at IS NULL;

-- ─── Global config ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS global_config (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        VARCHAR(100) NOT NULL UNIQUE,
  value      JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Platform users (superadmin + company users) ────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID REFERENCES companies(id) ON DELETE CASCADE,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(255) NOT NULL,
  role          VARCHAR(50) NOT NULL
                CHECK (role IN ('superadmin', 'admin', 'sales', 'accounts', 'site', 'owner')),
  avatar        VARCHAR(10),
  mobile        VARCHAR(15),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

-- Partial unique index for soft-deletes
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id) WHERE deleted_at IS NULL;

-- Superadmin must not belong to a company
ALTER TABLE users ADD CONSTRAINT users_superadmin_no_company
  CHECK (role <> 'superadmin' OR company_id IS NULL);

-- ─── Platform audit log ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID REFERENCES companies(id),
  user_id     UUID REFERENCES users(id),
  action      VARCHAR(20) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'login', 'logout')),
  table_name  VARCHAR(100) NOT NULL,
  record_id   VARCHAR(100),
  old_val     JSONB,
  new_val     JSONB,
  ip          INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_company ON audit_log(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id, created_at DESC);

-- ─── OTP sessions (demo / future SMS) ───────────────────────────
CREATE TABLE IF NOT EXISTS otp_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(255) NOT NULL,
  otp_hash   VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_sessions_email ON otp_sessions(email, expires_at);

-- ─── Updated_at trigger ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_companies_updated BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_subscription_plans_updated BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_global_config_updated BEFORE UPDATE ON global_config
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
