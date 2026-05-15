-- BuilderOS — tenant schema template
-- Applied per company as: CREATE SCHEMA tenant_xxx; SET search_path TO tenant_xxx; \i 002_tenant_template.sql
-- Replace {SCHEMA} when provisioning via apps/api/scripts/provision-tenant.ts

-- ─── Projects ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  type        VARCHAR(50) DEFAULT 'residential',
  rera_no     VARCHAR(50),
  location    TEXT,
  status      VARCHAR(30) NOT NULL DEFAULT 'active'
              CHECK (status IN ('planning', 'active', 'completed', 'on_hold')),
  budget      NUMERIC(14, 2) DEFAULT 0,
  progress    INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status) WHERE deleted_at IS NULL;

-- ─── Units ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS units (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id),
  unit_no     VARCHAR(50) NOT NULL,
  type        VARCHAR(50),
  floor       INT,
  tower       VARCHAR(50),
  area_sqft   NUMERIC(10, 2),
  status      VARCHAR(30) NOT NULL DEFAULT 'available'
              CHECK (status IN ('available', 'booked', 'sold', 'reserved', 'blocked')),
  base_price  NUMERIC(14, 2) DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ,
  UNIQUE (project_id, unit_no)
);

CREATE INDEX IF NOT EXISTS idx_units_project ON units(project_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_units_status ON units(status) WHERE deleted_at IS NULL;

-- ─── Owners (KYC) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS owners (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id      UUID REFERENCES units(id),
  name         VARCHAR(255) NOT NULL,
  mobile       VARCHAR(15) NOT NULL,
  email        VARCHAR(255),
  aadhaar_no   VARCHAR(12),
  pan_no       VARCHAR(10),
  address      TEXT,
  city         VARCHAR(100),
  state        VARCHAR(100),
  pincode      VARCHAR(10),
  kyc_status   VARCHAR(30) NOT NULL DEFAULT 'pending'
               CHECK (kyc_status IN ('pending', 'submitted', 'verified', 'rejected')),
  kyc_notes    TEXT,
  verified_at  TIMESTAMPTZ,
  verified_by  UUID,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_owners_unit ON owners(unit_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_owners_kyc ON owners(kyc_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_owners_mobile ON owners(mobile) WHERE deleted_at IS NULL;

-- ─── Owner documents ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS owner_documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  doc_type    VARCHAR(50) NOT NULL
              CHECK (doc_type IN ('aadhaar', 'pan', 'photo', 'agreement', 'other')),
  file_url    TEXT NOT NULL,
  file_name   VARCHAR(255),
  verified    BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_owner_documents_owner ON owner_documents(owner_id) WHERE deleted_at IS NULL;

-- ─── Loans ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES owners(id),
  bank        VARCHAR(255) NOT NULL,
  amount      NUMERIC(14, 2) NOT NULL,
  disbursed   NUMERIC(14, 2) DEFAULT 0,
  emi         NUMERIC(12, 2),
  status      VARCHAR(30) DEFAULT 'applied',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

-- ─── Insurances ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS insurances (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES owners(id),
  company     VARCHAR(255) NOT NULL,
  policy_no   VARCHAR(100),
  expiry      DATE,
  premium     NUMERIC(12, 2),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

-- ─── Payments ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id     UUID REFERENCES units(id),
  owner_id    UUID REFERENCES owners(id),
  amount      NUMERIC(14, 2) NOT NULL,
  mode        VARCHAR(30) NOT NULL DEFAULT 'neft',
  ref_no      VARCHAR(100),
  gst_amount  NUMERIC(12, 2) DEFAULT 0,
  receipt_no  VARCHAR(50),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payments_unit ON payments(unit_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date DESC) WHERE deleted_at IS NULL;

-- ─── Expenses ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id),
  category    VARCHAR(100) NOT NULL,
  amount      NUMERIC(14, 2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  voucher_no  VARCHAR(50),
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

-- ─── Materials ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS materials (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id),
  name        VARCHAR(255) NOT NULL,
  category    VARCHAR(100),
  unit        VARCHAR(30) DEFAULT 'nos',
  std_rate    NUMERIC(12, 2) DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

-- ─── Vendors ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id),
  name        VARCHAR(255) NOT NULL,
  gst_no      VARCHAR(15),
  pan_no      VARCHAR(10),
  contact     VARCHAR(255),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

-- ─── Purchase orders ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_orders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id),
  vendor_id   UUID REFERENCES vendors(id),
  status      VARCHAR(30) NOT NULL DEFAULT 'draft',
  total       NUMERIC(14, 2) DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS po_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id       UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id),
  qty         NUMERIC(12, 3) NOT NULL DEFAULT 0,
  rate        NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

-- ─── Vouchers (double-entry prep) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS vouchers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id),
  voucher_type VARCHAR(30) NOT NULL,
  voucher_date DATE NOT NULL DEFAULT CURRENT_DATE,
  narration   TEXT,
  debit       NUMERIC(14, 2) DEFAULT 0,
  credit      NUMERIC(14, 2) DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

-- ─── Milestones ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS milestones (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES projects(id),
  name         VARCHAR(255) NOT NULL,
  planned_date DATE,
  actual_date  DATE,
  pct_complete INT DEFAULT 0 CHECK (pct_complete >= 0 AND pct_complete <= 100),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ
);

-- ─── Complaints ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS complaints (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id      UUID REFERENCES units(id),
  category     VARCHAR(100) NOT NULL,
  priority     VARCHAR(20) DEFAULT 'medium',
  status       VARCHAR(30) NOT NULL DEFAULT 'open',
  assigned_to  UUID,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ
);

-- ─── Financial years ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS financial_years (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id),
  year_label  VARCHAR(20) NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  is_locked   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

-- ─── Tenant audit log ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID,
  action      VARCHAR(20) NOT NULL,
  table_name  VARCHAR(100) NOT NULL,
  record_id   VARCHAR(100),
  old_val     JSONB,
  new_val     JSONB,
  ip          INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenant_audit_created ON audit_log(created_at DESC);

-- ─── Offline sync queue (Phase 3) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS offline_sync_queue (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  action      VARCHAR(50) NOT NULL,
  payload     JSONB NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'synced', 'failed')),
  synced_at   TIMESTAMPTZ,
  error_msg   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON offline_sync_queue(status, created_at);

-- ─── Triggers ─────────────────────────────────────────────────────
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_units_updated BEFORE UPDATE ON units
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_owners_updated BEFORE UPDATE ON owners
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
