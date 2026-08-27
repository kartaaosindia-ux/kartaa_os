-- ─── KARTAA Real-Time Data Tables ────────────────────────────────────────────
-- Timestamp: 20260824191158

-- ─── 1. Types ─────────────────────────────────────────────────────────────────
DROP TYPE IF EXISTS public.alert_severity CASCADE;
CREATE TYPE public.alert_severity AS ENUM ('high', 'medium', 'low');

DROP TYPE IF EXISTS public.cell_status CASCADE;
CREATE TYPE public.cell_status AS ENUM ('completed', 'in-progress', 'pending', 'blocked', 'na');

DROP TYPE IF EXISTS public.layer_status CASCADE;
CREATE TYPE public.layer_status AS ENUM ('completed', 'in_progress', 'not_started', 'discrepancy');

-- ─── 2. Core Tables ───────────────────────────────────────────────────────────

-- Dashboard KPIs
CREATE TABLE IF NOT EXISTS public.dashboard_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  active_sites INTEGER NOT NULL DEFAULT 7,
  total_sites INTEGER NOT NULL DEFAULT 9,
  pending_verifications INTEGER NOT NULL DEFAULT 17,
  overdue_verifications INTEGER NOT NULL DEFAULT 5,
  boq_utilization NUMERIC(5,2) NOT NULL DEFAULT 68.4,
  boq_consumed_cr NUMERIC(10,2) NOT NULL DEFAULT 4.12,
  avg_spi NUMERIC(4,2) NOT NULL DEFAULT 0.87,
  cost_variance_cr NUMERIC(10,2) NOT NULL DEFAULT 1.16,
  milestone_adherence NUMERIC(5,2) NOT NULL DEFAULT 72.3,
  milestones_on_time INTEGER NOT NULL DEFAULT 18,
  total_milestones INTEGER NOT NULL DEFAULT 25,
  kartaa_score INTEGER NOT NULL DEFAULT 74,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Alerts
CREATE TABLE IF NOT EXISTS public.project_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  severity public.alert_severity NOT NULL DEFAULT 'medium',
  message TEXT NOT NULL,
  project_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Industrial Activity Grid cells
CREATE TABLE IF NOT EXISTS public.activity_grid_cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone TEXT NOT NULL,
  activity TEXT NOT NULL,
  cell_status public.cell_status NOT NULL DEFAULT 'pending',
  progress INTEGER NOT NULL DEFAULT 0,
  assignee TEXT NOT NULL DEFAULT '—',
  last_updated TEXT NOT NULL DEFAULT '—',
  kartaa_score INTEGER,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (zone, activity)
);

-- Satellite layer captures
CREATE TABLE IF NOT EXISTS public.satellite_layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_code TEXT NOT NULL UNIQUE,
  layer_name TEXT NOT NULL,
  depth TEXT NOT NULL,
  material TEXT NOT NULL,
  chainage_from TEXT NOT NULL,
  chainage_to TEXT NOT NULL,
  manual_progress INTEGER NOT NULL DEFAULT 0,
  satellite_progress INTEGER NOT NULL DEFAULT 0,
  layer_status public.layer_status NOT NULL DEFAULT 'not_started',
  last_satellite_capture TEXT NOT NULL DEFAULT '',
  discrepancy INTEGER NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#6B7280',
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- DPR progress submissions (triggers real-time updates)
CREATE TABLE IF NOT EXISTS public.dpr_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name TEXT NOT NULL,
  zone TEXT,
  activity TEXT,
  planned_qty NUMERIC(10,2),
  achieved_qty NUMERIC(10,2),
  workforce INTEGER,
  submitted_by TEXT NOT NULL DEFAULT 'Field Team',
  submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ─── 3. Indexes ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_project_alerts_active ON public.project_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_activity_grid_zone ON public.activity_grid_cells(zone);
CREATE INDEX IF NOT EXISTS idx_satellite_layers_code ON public.satellite_layers(layer_code);
CREATE INDEX IF NOT EXISTS idx_dpr_submissions_project ON public.dpr_submissions(project_name);

-- ─── 4. Functions ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- ─── 5. Enable RLS ────────────────────────────────────────────────────────────
ALTER TABLE public.dashboard_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_grid_cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dpr_submissions ENABLE ROW LEVEL SECURITY;

-- ─── 6. RLS Policies (public read for dashboard data) ─────────────────────────
DROP POLICY IF EXISTS "public_read_dashboard_kpis" ON public.dashboard_kpis;
CREATE POLICY "public_read_dashboard_kpis" ON public.dashboard_kpis
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "public_read_project_alerts" ON public.project_alerts;
CREATE POLICY "public_read_project_alerts" ON public.project_alerts
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "public_read_activity_grid" ON public.activity_grid_cells;
CREATE POLICY "public_read_activity_grid" ON public.activity_grid_cells
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "public_read_satellite_layers" ON public.satellite_layers;
CREATE POLICY "public_read_satellite_layers" ON public.satellite_layers
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "public_read_dpr_submissions" ON public.dpr_submissions;
CREATE POLICY "public_read_dpr_submissions" ON public.dpr_submissions
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "public_insert_dpr_submissions" ON public.dpr_submissions;
CREATE POLICY "public_insert_dpr_submissions" ON public.dpr_submissions
  FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "public_manage_dashboard_kpis" ON public.dashboard_kpis;
CREATE POLICY "public_manage_dashboard_kpis" ON public.dashboard_kpis
  FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_manage_project_alerts" ON public.project_alerts;
CREATE POLICY "public_manage_project_alerts" ON public.project_alerts
  FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_manage_activity_grid" ON public.activity_grid_cells;
CREATE POLICY "public_manage_activity_grid" ON public.activity_grid_cells
  FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_manage_satellite_layers" ON public.satellite_layers;
CREATE POLICY "public_manage_satellite_layers" ON public.satellite_layers
  FOR ALL TO public USING (true) WITH CHECK (true);

-- ─── 7. Triggers ──────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_dashboard_kpis_updated_at ON public.dashboard_kpis;
CREATE TRIGGER trg_dashboard_kpis_updated_at
  BEFORE UPDATE ON public.dashboard_kpis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_project_alerts_updated_at ON public.project_alerts;
CREATE TRIGGER trg_project_alerts_updated_at
  BEFORE UPDATE ON public.project_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_activity_grid_updated_at ON public.activity_grid_cells;
CREATE TRIGGER trg_activity_grid_updated_at
  BEFORE UPDATE ON public.activity_grid_cells
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_satellite_layers_updated_at ON public.satellite_layers;
CREATE TRIGGER trg_satellite_layers_updated_at
  BEFORE UPDATE ON public.satellite_layers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─── 8. Seed Data ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  -- Dashboard KPIs (single row)
  INSERT INTO public.dashboard_kpis (
    active_sites, total_sites, pending_verifications, overdue_verifications,
    boq_utilization, boq_consumed_cr, avg_spi, cost_variance_cr,
    milestone_adherence, milestones_on_time, total_milestones, kartaa_score
  ) VALUES (7, 9, 17, 5, 68.4, 4.12, 0.87, 1.16, 72.3, 18, 25, 74)
  ON CONFLICT (id) DO NOTHING;

  -- Alerts
  INSERT INTO public.project_alerts (severity, message, project_name, is_active) VALUES
    ('high', 'NH-48 Bypass (Pkg-3): BOQ utilization at 94.2% — projected overrun by ₹28.4L', 'NH-48 Bypass', true),
    ('medium', 'Manesar Industrial Phase-II: No progress entry logged for 5 consecutive days', 'Manesar Industrial', true)
  ON CONFLICT (id) DO NOTHING;

  -- Activity Grid Cells
  INSERT INTO public.activity_grid_cells (zone, activity, cell_status, progress, assignee, last_updated, kartaa_score) VALUES
    ('Zone A', 'civil', 'completed', 100, 'R. Sharma', '20 Aug', 91),
    ('Zone A', 'structural', 'completed', 100, 'P. Nair', '22 Aug', 88),
    ('Zone A', 'mechanical', 'in-progress', 72, 'K. Singh', '23 Aug', 76),
    ('Zone A', 'electrical', 'in-progress', 55, 'A. Patel', '23 Aug', 70),
    ('Zone A', 'plumbing', 'pending', 0, '—', '—', NULL),
    ('Zone A', 'hvac', 'pending', 0, '—', '—', NULL),
    ('Zone A', 'finishing', 'na', 0, '—', '—', NULL),
    ('Zone A', 'commissioning', 'na', 0, '—', '—', NULL),
    ('Zone B', 'civil', 'completed', 100, 'R. Sharma', '18 Aug', 94),
    ('Zone B', 'structural', 'in-progress', 84, 'P. Nair', '23 Aug', 82),
    ('Zone B', 'mechanical', 'pending', 0, '—', '—', NULL),
    ('Zone B', 'electrical', 'pending', 0, '—', '—', NULL),
    ('Zone B', 'plumbing', 'na', 0, '—', '—', NULL),
    ('Zone B', 'hvac', 'na', 0, '—', '—', NULL),
    ('Zone B', 'finishing', 'na', 0, '—', '—', NULL),
    ('Zone B', 'commissioning', 'na', 0, '—', '—', NULL),
    ('Zone C', 'civil', 'in-progress', 68, 'S. Verma', '23 Aug', 72),
    ('Zone C', 'structural', 'pending', 0, '—', '—', NULL),
    ('Zone C', 'mechanical', 'na', 0, '—', '—', NULL),
    ('Zone C', 'electrical', 'na', 0, '—', '—', NULL),
    ('Zone C', 'plumbing', 'na', 0, '—', '—', NULL),
    ('Zone C', 'hvac', 'na', 0, '—', '—', NULL),
    ('Zone C', 'finishing', 'na', 0, '—', '—', NULL),
    ('Zone C', 'commissioning', 'na', 0, '—', '—', NULL),
    ('Zone D', 'civil', 'in-progress', 45, 'M. Rao', '22 Aug', 65),
    ('Zone D', 'structural', 'blocked', 12, 'P. Nair', '19 Aug', 48),
    ('Zone D', 'mechanical', 'na', 0, '—', '—', NULL),
    ('Zone D', 'electrical', 'na', 0, '—', '—', NULL),
    ('Zone D', 'plumbing', 'na', 0, '—', '—', NULL),
    ('Zone D', 'hvac', 'na', 0, '—', '—', NULL),
    ('Zone D', 'finishing', 'na', 0, '—', '—', NULL),
    ('Zone D', 'commissioning', 'na', 0, '—', '—', NULL),
    ('Zone E', 'civil', 'pending', 0, '—', '—', NULL),
    ('Zone E', 'structural', 'na', 0, '—', '—', NULL),
    ('Zone E', 'mechanical', 'na', 0, '—', '—', NULL),
    ('Zone E', 'electrical', 'na', 0, '—', '—', NULL),
    ('Zone E', 'plumbing', 'na', 0, '—', '—', NULL),
    ('Zone E', 'hvac', 'na', 0, '—', '—', NULL),
    ('Zone E', 'finishing', 'na', 0, '—', '—', NULL),
    ('Zone E', 'commissioning', 'na', 0, '—', '—', NULL),
    ('Zone F', 'civil', 'na', 0, '—', '—', NULL),
    ('Zone F', 'structural', 'na', 0, '—', '—', NULL),
    ('Zone F', 'mechanical', 'na', 0, '—', '—', NULL),
    ('Zone F', 'electrical', 'na', 0, '—', '—', NULL),
    ('Zone F', 'plumbing', 'na', 0, '—', '—', NULL),
    ('Zone F', 'hvac', 'na', 0, '—', '—', NULL),
    ('Zone F', 'finishing', 'na', 0, '—', '—', NULL),
    ('Zone F', 'commissioning', 'na', 0, '—', '—', NULL)
  ON CONFLICT (zone, activity) DO NOTHING;

  -- Satellite Layers
  INSERT INTO public.satellite_layers (layer_code, layer_name, depth, material, chainage_from, chainage_to, manual_progress, satellite_progress, layer_status, last_satellite_capture, discrepancy, notes, color) VALUES
    ('SG', 'Sub-grade Preparation', '500 mm', 'Compacted Earth / Embankment Fill', '42+000', '67+500', 100, 98, 'completed', '2026-08-20', 2, 'Minor discrepancy at 65+200 — possible shadow artifact in satellite image.', '#8B5E3C'),
    ('GSB', 'Sub-base (GSB)', '250 mm', 'Granular Sub-Base — IRC:SP:72', '42+000', '67+500', 100, 100, 'completed', '2026-08-20', 0, 'Full alignment confirmed. Satellite and manual data match.', '#C4A35A'),
    ('WMM', 'Wet Mix Macadam (WMM)', '250 mm', 'Wet Mix Macadam — IRC:109', '54+000', '59+500', 88, 82, 'discrepancy', '2026-08-22', 6, '6% gap between manual entry and satellite detection. Field re-verification recommended for 57+000–58+500.', '#6B7280'),
    ('DBM', 'Dense Bituminous Macadam (DBM)', '60 mm', 'DBM Grade II — IRC:111', '59+500', '63+000', 52, 48, 'in_progress', '2026-08-22', 4, 'Work in progress. Satellite confirms active machinery at 61+000.', '#374151'),
    ('BC', 'Bituminous Concrete (BC)', '40 mm', 'BC Grade I — IRC:111', '63+000', '67+500', 0, 0, 'not_started', '2026-08-20', 0, 'Not yet commenced. Awaiting DBM completion.', '#1F2937'),
    ('DRN', 'Drainage & Shoulders', 'Variable', 'RCC Drains + Earthen Shoulders', '42+000', '67+500', 65, 63, 'in_progress', '2026-08-22', 2, 'Drain construction ongoing. Shoulder grading visible in satellite imagery.', '#2563EB')
  ON CONFLICT (layer_code) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Seed data error: %', SQLERRM;
END $$;
