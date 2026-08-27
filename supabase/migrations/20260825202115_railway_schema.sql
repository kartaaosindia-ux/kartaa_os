-- ─── KARTAA Railway Schema Extension ────────────────────────────────────────
-- Timestamp: 20260825202115
-- Adds: Railway-specific tables extending the existing projects table
-- Does NOT modify: organizations, users, projects, auth tables

-- ─── 1. Extend project_type enum ─────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'Railway'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'project_type')
  ) THEN
    ALTER TYPE public.project_type ADD VALUE 'Railway';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'Building'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'project_type')
  ) THEN
    ALTER TYPE public.project_type ADD VALUE 'Building';
  END IF;
END$$;

-- ─── 2. Railway Project Details ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.railway_project_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  railway_zone TEXT NOT NULL DEFAULT '',
  division TEXT NOT NULL DEFAULT '',
  gauge TEXT NOT NULL DEFAULT 'Broad Gauge (1676mm)',
  track_type TEXT NOT NULL DEFAULT 'Double Line',
  total_route_length_km NUMERIC(8,3) NOT NULL DEFAULT 0,
  start_chainage TEXT NOT NULL DEFAULT '0+000',
  end_chainage TEXT NOT NULL DEFAULT '0+000',
  number_of_stations INTEGER NOT NULL DEFAULT 0,
  number_of_bridges INTEGER NOT NULL DEFAULT 0,
  number_of_rob_rub INTEGER NOT NULL DEFAULT 0,
  number_of_culverts INTEGER NOT NULL DEFAULT 0,
  number_of_level_crossings INTEGER NOT NULL DEFAULT 0,
  planned_progress NUMERIC(5,2) NOT NULL DEFAULT 0,
  actual_progress NUMERIC(5,2) NOT NULL DEFAULT 0,
  track_progress NUMERIC(5,2) NOT NULL DEFAULT 0,
  formation_progress NUMERIC(5,2) NOT NULL DEFAULT 0,
  station_progress NUMERIC(5,2) NOT NULL DEFAULT 0,
  bridge_progress NUMERIC(5,2) NOT NULL DEFAULT 0,
  electrification_progress NUMERIC(5,2) NOT NULL DEFAULT 0,
  signalling_progress NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id)
);

-- ─── 3. Railway Chainage Segments ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.railway_chainage_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  segment_name TEXT NOT NULL DEFAULT '',
  start_chainage TEXT NOT NULL DEFAULT '0+000',
  end_chainage TEXT NOT NULL DEFAULT '0+000',
  length_m NUMERIC(10,2) NOT NULL DEFAULT 0,
  wbs_code TEXT NOT NULL DEFAULT '',
  activity TEXT NOT NULL DEFAULT '',
  planned_progress NUMERIC(5,2) NOT NULL DEFAULT 0,
  actual_progress NUMERIC(5,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'not_started',
  remarks TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ─── 4. Railway Assets ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.railway_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL DEFAULT '',
  asset_type TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  chainage TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  planned_status TEXT NOT NULL DEFAULT 'Not Started',
  actual_status TEXT NOT NULL DEFAULT 'Not Started',
  progress_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  remarks TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ─── 5. Railway Asset Progress ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.railway_asset_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.railway_assets(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  progress_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress',
  remarks TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ─── 6. Railway DPR Entries ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.railway_dpr_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_chainage TEXT NOT NULL DEFAULT '',
  end_chainage TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  wbs_code TEXT NOT NULL DEFAULT '',
  activity TEXT NOT NULL DEFAULT '',
  planned_qty NUMERIC(12,2) NOT NULL DEFAULT 0,
  todays_qty NUMERIC(12,2) NOT NULL DEFAULT 0,
  cumulative_qty NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT '',
  manpower INTEGER NOT NULL DEFAULT 0,
  equipment TEXT NOT NULL DEFAULT '',
  materials TEXT NOT NULL DEFAULT '',
  weather TEXT NOT NULL DEFAULT 'Clear',
  remarks TEXT NOT NULL DEFAULT '',
  dpr_status TEXT NOT NULL DEFAULT 'draft',
  approved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ─── 7. Railway WBS Items ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.railway_wbs_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  wbs_code TEXT NOT NULL DEFAULT '',
  parent_code TEXT,
  name TEXT NOT NULL DEFAULT '',
  level INTEGER NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT '',
  planned_qty NUMERIC(12,2) NOT NULL DEFAULT 0,
  achieved_qty NUMERIC(12,2) NOT NULL DEFAULT 0,
  progress_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ─── 8. RLS Policies ──────────────────────────────────────────────────────────
ALTER TABLE public.railway_project_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.railway_chainage_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.railway_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.railway_asset_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.railway_dpr_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.railway_wbs_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'railway_project_details' AND policyname = 'railway_project_details_select') THEN
    CREATE POLICY railway_project_details_select ON public.railway_project_details FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'railway_project_details' AND policyname = 'railway_project_details_insert') THEN
    CREATE POLICY railway_project_details_insert ON public.railway_project_details FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'railway_project_details' AND policyname = 'railway_project_details_update') THEN
    CREATE POLICY railway_project_details_update ON public.railway_project_details FOR UPDATE TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'railway_chainage_segments' AND policyname = 'railway_chainage_segments_select') THEN
    CREATE POLICY railway_chainage_segments_select ON public.railway_chainage_segments FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'railway_chainage_segments' AND policyname = 'railway_chainage_segments_insert') THEN
    CREATE POLICY railway_chainage_segments_insert ON public.railway_chainage_segments FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'railway_assets' AND policyname = 'railway_assets_select') THEN
    CREATE POLICY railway_assets_select ON public.railway_assets FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'railway_assets' AND policyname = 'railway_assets_insert') THEN
    CREATE POLICY railway_assets_insert ON public.railway_assets FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'railway_assets' AND policyname = 'railway_assets_update') THEN
    CREATE POLICY railway_assets_update ON public.railway_assets FOR UPDATE TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'railway_asset_progress' AND policyname = 'railway_asset_progress_select') THEN
    CREATE POLICY railway_asset_progress_select ON public.railway_asset_progress FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'railway_asset_progress' AND policyname = 'railway_asset_progress_insert') THEN
    CREATE POLICY railway_asset_progress_insert ON public.railway_asset_progress FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'railway_dpr_entries' AND policyname = 'railway_dpr_entries_select') THEN
    CREATE POLICY railway_dpr_entries_select ON public.railway_dpr_entries FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'railway_dpr_entries' AND policyname = 'railway_dpr_entries_insert') THEN
    CREATE POLICY railway_dpr_entries_insert ON public.railway_dpr_entries FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'railway_dpr_entries' AND policyname = 'railway_dpr_entries_update') THEN
    CREATE POLICY railway_dpr_entries_update ON public.railway_dpr_entries FOR UPDATE TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'railway_wbs_items' AND policyname = 'railway_wbs_items_select') THEN
    CREATE POLICY railway_wbs_items_select ON public.railway_wbs_items FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'railway_wbs_items' AND policyname = 'railway_wbs_items_insert') THEN
    CREATE POLICY railway_wbs_items_insert ON public.railway_wbs_items FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'railway_wbs_items' AND policyname = 'railway_wbs_items_update') THEN
    CREATE POLICY railway_wbs_items_update ON public.railway_wbs_items FOR UPDATE TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'railway_wbs_items' AND policyname = 'railway_wbs_items_delete') THEN
    CREATE POLICY railway_wbs_items_delete ON public.railway_wbs_items FOR DELETE TO authenticated USING (true);
  END IF;
END$$;
