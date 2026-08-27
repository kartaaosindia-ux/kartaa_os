-- ─── KARTAA OS — Projects Full Module Migration ─────────────────────────────
-- Timestamp: 20260826100000
-- Extends existing projects table with all required fields for full CRUD
-- Adds: organization isolation, RBAC, archive/restore, demo seed data

-- ─── 1. Extend project_status enum with 'archived' ───────────────────────────
-- We cannot DROP CASCADE because other tables reference this type.
-- Safely add 'archived' value if it does not already exist.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'archived'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'project_status')
  ) THEN
    ALTER TYPE public.project_status ADD VALUE 'archived';
  END IF;
END $$;

-- ─── 2. Extend projects table with missing fields ────────────────────────────
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS project_code TEXT,
  ADD COLUMN IF NOT EXISTS client TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS contractor TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS consultant TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS contract_value NUMERIC(18,2),
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS planned_completion_date DATE,
  ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS organisation TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;

-- Back-fill project_code from existing code column where project_code is null
UPDATE public.projects SET project_code = code WHERE project_code IS NULL;

-- ─── 3. Indexes ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_projects_organisation ON public.projects(organisation);
CREATE INDEX IF NOT EXISTS idx_projects_project_type ON public.projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_is_demo ON public.projects(is_demo);

-- ─── 4. Helper function: get current user's organisation ─────────────────────
CREATE OR REPLACE FUNCTION public.get_user_organisation()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organisation FROM public.user_profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- ─── 5. Helper function: get current user's role ─────────────────────────────
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role::TEXT FROM public.user_profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- ─── 6. Helper function: can user manage projects ────────────────────────────
-- Owner (admin) and project_manager can create/edit; site_engineer is read-only
CREATE OR REPLACE FUNCTION public.can_manage_projects()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'project_manager')
  );
$$;

-- ─── 7. Update RLS policies for projects ─────────────────────────────────────
-- Drop old permissive policies
DROP POLICY IF EXISTS "authenticated_read_projects" ON public.projects;
DROP POLICY IF EXISTS "public_read_projects" ON public.projects;
DROP POLICY IF EXISTS "authenticated_manage_projects" ON public.projects;

-- SELECT: authenticated users can read projects in their organisation OR demo projects
DROP POLICY IF EXISTS "org_read_projects" ON public.projects;
CREATE POLICY "org_read_projects" ON public.projects
  FOR SELECT TO authenticated
  USING (
    organisation = public.get_user_organisation()
    OR is_demo = true
  );

-- INSERT: only admin/project_manager can create projects
DROP POLICY IF EXISTS "org_insert_projects" ON public.projects;
CREATE POLICY "org_insert_projects" ON public.projects
  FOR INSERT TO authenticated
  WITH CHECK (
    public.can_manage_projects()
    AND organisation = public.get_user_organisation()
  );

-- UPDATE: only admin/project_manager can update projects in their org
DROP POLICY IF EXISTS "org_update_projects" ON public.projects;
CREATE POLICY "org_update_projects" ON public.projects
  FOR UPDATE TO authenticated
  USING (
    public.can_manage_projects()
    AND organisation = public.get_user_organisation()
  )
  WITH CHECK (
    public.can_manage_projects()
    AND organisation = public.get_user_organisation()
  );

-- DELETE: only admin can delete (soft-delete via archive is preferred)
DROP POLICY IF EXISTS "org_delete_projects" ON public.projects;
CREATE POLICY "org_delete_projects" ON public.projects
  FOR DELETE TO authenticated
  USING (
    public.get_user_role() = 'admin'
    AND organisation = public.get_user_organisation()
  );

-- ─── 8. Seed demo projects ────────────────────────────────────────────────────
DO $$
DECLARE
  demo_owner_id UUID;
BEGIN
  -- Use first available user as demo owner (or null if none)
  SELECT id INTO demo_owner_id FROM public.user_profiles LIMIT 1;

  -- Demo 1: Highway
  INSERT INTO public.projects (
    id, code, project_code, name, project_type, location, client, contractor, consultant,
    contract_value, start_date, planned_completion_date, description,
    budget, progress, kartaa_score, spi, status, last_updated,
    organisation, is_demo, created_by, owner_id
  ) VALUES (
    gen_random_uuid(),
    'KARTAA-HWY-DEMO-001',
    'KARTAA-HWY-DEMO-001',
    'KARTAA Highway Demo Project',
    'Road',
    'Fictional Central India Corridor',
    'KARTAA Demo Authority (Fictional)',
    'KARTAA Demo Contractors Pvt. Ltd. (Fictional)',
    'KARTAA Demo PMC (Fictional)',
    62100000000.00,
    '2024-01-15',
    '2027-06-30',
    'DEMO / SYNTHETIC DATA — Fictional highway project for demonstration purposes only. Not based on any real NHAI or government project.',
    '₹621 Crore',
    67.4,
    78,
    0.91,
    'active',
    'Demo Data',
    'KARTAA Demo Organisation',
    true,
    demo_owner_id,
    demo_owner_id
  ) ON CONFLICT (code) DO NOTHING;

  -- Demo 2: Industrial
  INSERT INTO public.projects (
    id, code, project_code, name, project_type, location, client, contractor, consultant,
    contract_value, start_date, planned_completion_date, description,
    budget, progress, kartaa_score, spi, status, last_updated,
    organisation, is_demo, created_by, owner_id
  ) VALUES (
    gen_random_uuid(),
    'KARTAA-IND-DEMO-002',
    'KARTAA-IND-DEMO-002',
    'KARTAA Industrial Plant Demo Project',
    'Industrial',
    'Fictional Industrial Zone, Central India',
    'KARTAA Demo Industries (Fictional)',
    'KARTAA Demo EPC Pvt. Ltd. (Fictional)',
    'KARTAA Demo Engineering (Fictional)',
    28400000000.00,
    '2024-03-01',
    '2027-02-28',
    'DEMO / SYNTHETIC DATA — Fictional industrial plant project for demonstration purposes only. Not based on any real private client information.',
    '₹284 Crore',
    52.1,
    71,
    0.87,
    'active',
    'Demo Data',
    'KARTAA Demo Organisation',
    true,
    demo_owner_id,
    demo_owner_id
  ) ON CONFLICT (code) DO NOTHING;

  -- Demo 3: Railway
  INSERT INTO public.projects (
    id, code, project_code, name, project_type, location, client, contractor, consultant,
    contract_value, start_date, planned_completion_date, description,
    budget, progress, kartaa_score, spi, status, last_updated,
    organisation, is_demo, created_by, owner_id
  ) VALUES (
    gen_random_uuid(),
    'KARTAA-RAIL-DEMO-003',
    'KARTAA-RAIL-DEMO-003',
    'KARTAA Rail Corridor Demo Project',
    'Railway',
    'Fictional Central India Rail Corridor',
    'KARTAA Demo Railway Authority (Fictional)',
    'KARTAA Demo Rail Contractors (Fictional)',
    'KARTAA Demo Rail Consultants (Fictional)',
    325000000000.00,
    '2023-10-01',
    '2028-09-30',
    'DEMO / SYNTHETIC DATA — Fictional railway corridor project. Route Length: 86 km, Ch. 120+000 to Ch. 206+000. Not based on any real Indian Railways or RVNL project.',
    '₹3,250 Crore',
    44.0,
    69,
    0.88,
    'active',
    'Demo Data',
    'KARTAA Demo Organisation',
    true,
    demo_owner_id,
    demo_owner_id
  ) ON CONFLICT (code) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Demo seed failed: %', SQLERRM;
END $$;
