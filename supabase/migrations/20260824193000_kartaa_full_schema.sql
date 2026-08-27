-- ─── KARTAA Full Backend Schema ─────────────────────────────────────────────
-- Timestamp: 20260824193000
-- Adds: user_profiles, projects, teams, progress_entries, audit_log tables
-- Builds on existing: dashboard_kpis, project_alerts, activity_grid_cells,
--                     satellite_layers, dpr_submissions

-- ─── 1. Types ─────────────────────────────────────────────────────────────────
DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('admin', 'project_manager', 'site_engineer', 'verification_officer', 'client_consultant');

DROP TYPE IF EXISTS public.project_status CASCADE;
CREATE TYPE public.project_status AS ENUM ('active', 'delayed', 'on-hold', 'draft', 'completed');

DROP TYPE IF EXISTS public.project_type CASCADE;
CREATE TYPE public.project_type AS ENUM ('Road', 'Industrial');

DROP TYPE IF EXISTS public.entry_status CASCADE;
CREATE TYPE public.entry_status AS ENUM ('pending', 'approved', 'rejected', 'flagged');

DROP TYPE IF EXISTS public.audit_category CASCADE;
CREATE TYPE public.audit_category AS ENUM ('auth', 'project', 'verification', 'export', 'admin', 'data');

DROP TYPE IF EXISTS public.audit_severity CASCADE;
CREATE TYPE public.audit_severity AS ENUM ('info', 'warning', 'critical', 'success');

-- ─── 2. Core Tables ───────────────────────────────────────────────────────────

-- User profiles (linked to auth.users via trigger)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  role public.user_role NOT NULL DEFAULT 'site_engineer',
  organisation TEXT NOT NULL DEFAULT 'NHAI — Delhi Region',
  department TEXT NOT NULL DEFAULT '',
  employee_id TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  project_type public.project_type NOT NULL DEFAULT 'Road',
  location TEXT NOT NULL DEFAULT '',
  chainage_range TEXT NOT NULL DEFAULT '—',
  budget TEXT NOT NULL DEFAULT '',
  progress NUMERIC(5,2) NOT NULL DEFAULT 0,
  kartaa_score INTEGER NOT NULL DEFAULT 0,
  spi NUMERIC(4,2) NOT NULL DEFAULT 0,
  status public.project_status NOT NULL DEFAULT 'draft',
  last_updated TEXT NOT NULL DEFAULT '',
  owner_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Teams
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  team_role TEXT NOT NULL DEFAULT 'Member',
  joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (project_id, user_id)
);

-- Progress entries
CREATE TABLE IF NOT EXISTS public.progress_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  zone TEXT NOT NULL DEFAULT '',
  activity TEXT NOT NULL DEFAULT '',
  chainage_from TEXT NOT NULL DEFAULT '',
  chainage_to TEXT NOT NULL DEFAULT '',
  planned_qty NUMERIC(12,2) NOT NULL DEFAULT 0,
  achieved_qty NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'm²',
  workforce INTEGER NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  entry_status public.entry_status NOT NULL DEFAULT 'pending',
  verified_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  kartaa_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Audit log
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL DEFAULT '',
  user_role TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL,
  category public.audit_category NOT NULL DEFAULT 'data',
  severity public.audit_severity NOT NULL DEFAULT 'info',
  resource TEXT NOT NULL DEFAULT '',
  ip_address TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ─── 3. Indexes ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_teams_project ON public.teams(project_id);
CREATE INDEX IF NOT EXISTS idx_teams_user ON public.teams(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_project ON public.progress_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_submitted_by ON public.progress_entries(submitted_by);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_category ON public.audit_log(category);

-- ─── 4. Functions ─────────────────────────────────────────────────────────────

-- Auto-create user_profiles on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, organisation, department, employee_id, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'site_engineer')::public.user_role,
    COALESCE(NEW.raw_user_meta_data->>'organisation', 'NHAI — Delhi Region'),
    COALESCE(NEW.raw_user_meta_data->>'department', ''),
    COALESCE(NEW.raw_user_meta_data->>'employee_id', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Updated_at trigger function (reuse existing if present)
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
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- ─── 6. RLS Policies ──────────────────────────────────────────────────────────

-- user_profiles: own row + public read for team display
DROP POLICY IF EXISTS "users_manage_own_profile" ON public.user_profiles;
CREATE POLICY "users_manage_own_profile" ON public.user_profiles
  FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "users_read_all_profiles" ON public.user_profiles;
CREATE POLICY "users_read_all_profiles" ON public.user_profiles
  FOR SELECT TO authenticated USING (true);

-- projects: public read for authenticated users
DROP POLICY IF EXISTS "authenticated_read_projects" ON public.projects;
CREATE POLICY "authenticated_read_projects" ON public.projects
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "public_read_projects" ON public.projects;
CREATE POLICY "public_read_projects" ON public.projects
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "authenticated_manage_projects" ON public.projects;
CREATE POLICY "authenticated_manage_projects" ON public.projects
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- teams: authenticated read/write
DROP POLICY IF EXISTS "authenticated_read_teams" ON public.teams;
CREATE POLICY "authenticated_read_teams" ON public.teams
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "public_read_teams" ON public.teams;
CREATE POLICY "public_read_teams" ON public.teams
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "authenticated_manage_teams" ON public.teams;
CREATE POLICY "authenticated_manage_teams" ON public.teams
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- progress_entries: authenticated read/write
DROP POLICY IF EXISTS "authenticated_read_progress" ON public.progress_entries;
CREATE POLICY "authenticated_read_progress" ON public.progress_entries
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "public_read_progress" ON public.progress_entries;
CREATE POLICY "public_read_progress" ON public.progress_entries
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "authenticated_manage_progress" ON public.progress_entries;
CREATE POLICY "authenticated_manage_progress" ON public.progress_entries
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- audit_log: authenticated read, insert for all
DROP POLICY IF EXISTS "authenticated_read_audit" ON public.audit_log;
CREATE POLICY "authenticated_read_audit" ON public.audit_log
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "public_read_audit" ON public.audit_log;
CREATE POLICY "public_read_audit" ON public.audit_log
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "public_insert_audit" ON public.audit_log;
CREATE POLICY "public_insert_audit" ON public.audit_log
  FOR INSERT TO public WITH CHECK (true);

-- ─── 7. Triggers ──────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_progress_entries_updated_at ON public.progress_entries;
CREATE TRIGGER trg_progress_entries_updated_at
  BEFORE UPDATE ON public.progress_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─── 8. Seed Data ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  admin_uuid UUID := gen_random_uuid();
  pm_uuid UUID := gen_random_uuid();
  se_uuid UUID := gen_random_uuid();
  cc_uuid UUID := gen_random_uuid();
  vo_uuid UUID := gen_random_uuid();
  proj1_uuid UUID := gen_random_uuid();
  proj2_uuid UUID := gen_random_uuid();
  proj3_uuid UUID := gen_random_uuid();
  proj4_uuid UUID := gen_random_uuid();
  proj5_uuid UUID := gen_random_uuid();
  proj6_uuid UUID := gen_random_uuid();
  proj7_uuid UUID := gen_random_uuid();
  proj8_uuid UUID := gen_random_uuid();
BEGIN
  -- ── Auth users ──────────────────────────────────────────────────────────────
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at, phone, phone_change,
    phone_change_token, phone_change_sent_at
  ) VALUES
    (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'vikram.singh@nhai-dl.kartaa.in', crypt('KartaaAdmin@2026', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Vikram Singh', 'role', 'admin', 'organisation', 'NHAI — Delhi Region', 'department', 'Administration', 'employee_id', 'NHAI-ADM-0007', 'phone', '+91 98100 00007'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (pm_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'rajesh.kumar@nhai-dl.kartaa.in', crypt('KartaaPM@2026', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Rajesh Kumar', 'role', 'project_manager', 'organisation', 'NHAI — Delhi Region', 'department', 'Project Management Unit', 'employee_id', 'NHAI-PMU-0042', 'phone', '+91 98765 43210'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (se_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'suresh.pillai@nhai-dl.kartaa.in', crypt('KartaaSE@2026', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Suresh Pillai', 'role', 'site_engineer', 'organisation', 'NHAI — Delhi Region', 'department', 'Field Operations', 'employee_id', 'NHAI-FLD-0103', 'phone', '+91 97654 32109'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (cc_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'priya.mehta@consultant.kartaa.in', crypt('KartaaCC@2026', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Priya Mehta', 'role', 'client_consultant', 'organisation', 'Mehta & Associates', 'department', 'Consulting', 'employee_id', 'EXT-CC-0021', 'phone', '+91 96543 21098'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (vo_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'anita.sharma@nhai-dl.kartaa.in', crypt('KartaaVO@2026', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Anita Sharma', 'role', 'verification_officer', 'organisation', 'NHAI — Delhi Region', 'department', 'Quality Assurance', 'employee_id', 'NHAI-QA-0055', 'phone', '+91 95432 10987'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null)
  ON CONFLICT (id) DO NOTHING;

  -- ── Projects ────────────────────────────────────────────────────────────────
  INSERT INTO public.projects (id, code, name, project_type, location, chainage_range, budget, progress, kartaa_score, spi, status, last_updated, owner_id) VALUES
    (proj1_uuid, 'NHAI-DL-2024-048', 'NH-48 Bypass Package 3', 'Road', 'Gurgaon, Haryana', '42+000 – 67+500', '₹6,21,40,000', 77.1, 82, 0.88, 'active', '23 Aug', pm_uuid),
    (proj2_uuid, 'HSIIDC-MN-2023-112', 'Manesar Industrial Phase II', 'Industrial', 'Manesar, Haryana', '—', '₹9,14,00,000', 44.1, 61, 0.71, 'delayed', '18 Aug', pm_uuid),
    (proj3_uuid, 'NHAI-HR-2024-031', 'Kundli–Manesar Expressway', 'Road', 'Sonipat–Gurgaon Corridor', '0+000 – 83+200', '₹14,82,00,000', 52.8, 91, 0.96, 'active', '23 Aug', pm_uuid),
    (proj4_uuid, 'HPWD-FR-2024-007', 'Faridabad Ring Road Segment 4', 'Road', 'Faridabad, Haryana', '18+400 – 34+700', '₹11,34,00,000', 38.4, 74, 0.81, 'on-hold', '20 Aug', pm_uuid),
    (proj5_uuid, 'NHAI-HR-2025-019', 'Bahadurgarh Bypass Extension', 'Road', 'Bahadurgarh, Haryana', '12+000 – 29+500', '₹7,62,00,000', 67.3, 79, 0.93, 'active', '22 Aug', pm_uuid),
    (proj6_uuid, 'DMIDC-RP-2024-044', 'Rewari Packaging Hub — Phase I', 'Industrial', 'Rewari, Haryana', '—', '₹5,48,00,000', 91.2, 88, 0.99, 'completed', '21 Aug', pm_uuid),
    (proj7_uuid, 'NHAI-UP-2025-003', 'Delhi–Meerut Expressway Pkg-7', 'Road', 'Ghaziabad, UP', '68+000 – 92+400', '₹18,90,00,000', 12.4, 0, 0.0, 'draft', '15 Aug', pm_uuid),
    (proj8_uuid, 'HSIIDC-GG-2024-088', 'Gurugram Tech Corridor Block-B', 'Industrial', 'Gurugram Sector 81', '—', '₹8,33,00,000', 58.7, 76, 0.85, 'active', '23 Aug', pm_uuid)
  ON CONFLICT (code) DO NOTHING;

  -- ── Teams ───────────────────────────────────────────────────────────────────
  INSERT INTO public.teams (project_id, user_id, team_role) VALUES
    (proj1_uuid, pm_uuid, 'Project Manager'),
    (proj1_uuid, se_uuid, 'Site Engineer'),
    (proj1_uuid, vo_uuid, 'Verification Officer'),
    (proj1_uuid, cc_uuid, 'Client Consultant'),
    (proj2_uuid, pm_uuid, 'Project Manager'),
    (proj2_uuid, se_uuid, 'Site Engineer'),
    (proj3_uuid, pm_uuid, 'Project Manager'),
    (proj3_uuid, vo_uuid, 'Verification Officer')
  ON CONFLICT (project_id, user_id) DO NOTHING;

  -- ── Progress Entries ────────────────────────────────────────────────────────
  INSERT INTO public.progress_entries (project_id, submitted_by, zone, activity, chainage_from, chainage_to, planned_qty, achieved_qty, unit, workforce, notes, entry_status, verified_by, verified_at, kartaa_score) VALUES
    (proj1_uuid, se_uuid, 'Zone A', 'WMM Compaction', '56+200', '57+800', 18400, 19200, 'm²', 24, 'WMM quantity revised after field measurement', 'approved', vo_uuid, now() - interval '2 days', 91),
    (proj1_uuid, se_uuid, 'Zone B', 'Sub-base GSB', '42+000', '48+500', 12000, 12000, 'm²', 18, 'Full alignment confirmed', 'approved', vo_uuid, now() - interval '4 days', 96),
    (proj1_uuid, se_uuid, 'Zone C', 'DBM Layer', '54+000', '56+000', 8000, 5600, 'm²', 20, 'GPS mismatch at 55+200 — re-verification needed', 'flagged', null, null, 71),
    (proj2_uuid, se_uuid, 'Zone D', 'Structural Steel', '—', '—', 4200, 1890, 'MT', 32, 'No progress entry for 5 consecutive days', 'pending', null, null, null),
    (proj3_uuid, se_uuid, 'Zone A', 'Earthwork', '0+000', '12+000', 48000, 48000, 'm³', 45, '4.2 km earthwork completed', 'approved', vo_uuid, now() - interval '1 day', 94)
  ON CONFLICT (id) DO NOTHING;

  -- ── Audit Log ───────────────────────────────────────────────────────────────
  INSERT INTO public.audit_log (user_id, user_name, user_role, action, category, severity, resource, ip_address, details, created_at) VALUES
    (pm_uuid, 'Rajesh Kumar', 'Project Manager', 'User Login', 'auth', 'info', 'Auth System', '10.0.1.45', 'Successful login via password', now() - interval '2 hours'),
    (se_uuid, 'Suresh Pillai', 'Site Engineer', 'Progress Entry Updated', 'project', 'info', 'NH-48 Bypass Pkg 3', '10.0.2.12', 'WMM Compaction entry modified — chainage 56+200 to 57+800', now() - interval '2 hours 30 minutes'),
    (vo_uuid, 'Anita Sharma', 'Verification Officer', 'Layer Verified', 'verification', 'success', 'NH-48 Bypass Pkg 3', '10.0.1.88', 'Sub-base GSB layer approved with KARTAA score 96', now() - interval '3 hours'),
    (pm_uuid, 'Rajesh Kumar', 'Project Manager', 'Report Exported', 'export', 'info', 'Progress Report Aug 2026', '10.0.1.45', 'PDF export — 24 pages, shared with NHAI HQ', now() - interval '3 hours 30 minutes'),
    (admin_uuid, 'Vikram Singh', 'Admin', 'User Role Changed', 'admin', 'warning', 'User Profile', '10.0.0.5', 'Role elevated from Viewer to Verification Officer', now() - interval '4 hours'),
    (se_uuid, 'Suresh Pillai', 'Site Engineer', 'BOQ Item Edited', 'data', 'warning', 'BOQ-2024-048', '10.0.2.12', 'WMM quantity revised from 18,400 m² to 19,200 m²', now() - interval '4 hours 30 minutes'),
    (vo_uuid, 'Anita Sharma', 'Verification Officer', 'Verification Rejected', 'verification', 'critical', 'DBM Layer Entry', '10.0.1.88', 'Photo evidence insufficient — 3 of 5 images flagged as low quality', now() - interval '5 hours'),
    (pm_uuid, 'Rajesh Kumar', 'Project Manager', 'Project Settings Updated', 'project', 'warning', 'NH-48 Bypass Pkg 3', '10.0.1.45', 'Target completion date extended by 45 days', now() - interval '6 hours'),
    (admin_uuid, 'Vikram Singh', 'Admin', 'New User Created', 'admin', 'info', 'User Management', '10.0.0.5', 'Account created for new Site Engineer', now() - interval '7 hours'),
    (se_uuid, 'Suresh Pillai', 'Site Engineer', 'Photo Evidence Uploaded', 'data', 'info', 'NH-48 Bypass Pkg 3', '10.0.2.12', '6 geo-tagged photos uploaded for WMM layer at 56+200', now() - interval '8 hours'),
    (cc_uuid, 'Priya Mehta', 'Client / Consultant', 'User Login', 'auth', 'info', 'Auth System', '10.0.3.21', 'Successful login via password', now() - interval '9 hours'),
    (vo_uuid, 'Anita Sharma', 'Verification Officer', 'Bulk Export', 'export', 'info', 'Compliance Package', '10.0.1.88', 'ZIP export — 14 documents, 48 photos, 3 reports', now() - interval '10 hours'),
    (pm_uuid, 'Rajesh Kumar', 'Project Manager', 'Drawing Uploaded', 'data', 'info', 'NH-48 Bypass Pkg 3', '10.0.1.45', 'Revised alignment drawing uploaded — Rev 3', now() - interval '11 hours'),
    (admin_uuid, 'Vikram Singh', 'Admin', 'System Config Changed', 'admin', 'critical', 'KARTAA Scoring Engine', '10.0.0.5', 'Photo quality threshold adjusted from 70% to 75%', now() - interval '12 hours'),
    (se_uuid, 'Suresh Pillai', 'Site Engineer', 'User Logout', 'auth', 'info', 'Auth System', '10.0.2.12', 'Session ended — duration 3h 42m', now() - interval '13 hours'),
    (vo_uuid, 'Anita Sharma', 'Verification Officer', 'Layer Verified', 'verification', 'success', 'NH-48 Bypass Pkg 3', '10.0.1.88', 'Sub-grade layer approved — chainage 42+000 to 48+500', now() - interval '26 hours'),
    (pm_uuid, 'Rajesh Kumar', 'Project Manager', 'Report Exported', 'export', 'info', 'Executive Summary Jul 2026', '10.0.1.45', 'PDF export shared with client portal', now() - interval '28 hours'),
    (cc_uuid, 'Priya Mehta', 'Client / Consultant', 'BOQ Item Deleted', 'data', 'critical', 'BOQ-2024-048', '10.0.3.21', 'Duplicate line item removed — item ID BOQ-112', now() - interval '30 hours'),
    (admin_uuid, 'Vikram Singh', 'Admin', 'User Login', 'auth', 'info', 'Auth System', '10.0.0.5', 'Successful login via SSO', now() - interval '32 hours'),
    (se_uuid, 'Suresh Pillai', 'Site Engineer', 'Satellite Image Reviewed', 'verification', 'info', 'Satellite Monitor', '10.0.2.12', 'Layer comparison completed for chainage 54+000 to 59+500', now() - interval '34 hours')
  ON CONFLICT (id) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Seed data error: %', SQLERRM;
END $$;
