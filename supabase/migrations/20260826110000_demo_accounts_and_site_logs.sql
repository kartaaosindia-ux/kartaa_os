-- ============================================================
-- Migration: Demo Accounts + Site Logs
-- Timestamp: 20260826110000
-- Purpose: Create demo sector accounts, site_logs table,
--          and pre-load demo logs for 3 sector profiles
-- ============================================================

-- ============================================================
-- 1. SITE LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    sector TEXT NOT NULL DEFAULT '',
    activity TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT NOT NULL DEFAULT '',
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_site_logs_user_id ON public.site_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_site_logs_project_id ON public.site_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_site_logs_sector ON public.site_logs(sector);
CREATE INDEX IF NOT EXISTS idx_site_logs_is_demo ON public.site_logs(is_demo);

ALTER TABLE public.site_logs ENABLE ROW LEVEL SECURITY;

-- RLS: authenticated users manage their own logs; demo logs visible to all authenticated
DROP POLICY IF EXISTS "users_view_site_logs" ON public.site_logs;
CREATE POLICY "users_view_site_logs"
ON public.site_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_demo = true);

DROP POLICY IF EXISTS "users_insert_site_logs" ON public.site_logs;
CREATE POLICY "users_insert_site_logs"
ON public.site_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_update_site_logs" ON public.site_logs;
CREATE POLICY "users_update_site_logs"
ON public.site_logs
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_delete_site_logs" ON public.site_logs;
CREATE POLICY "users_delete_site_logs"
ON public.site_logs
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================================
-- 2. DEMO AUTH USERS (3 sector profiles)
-- ============================================================
DO $$
DECLARE
    demo_building_uuid UUID := gen_random_uuid();
    demo_roads_uuid UUID := gen_random_uuid();
    demo_industrial_uuid UUID := gen_random_uuid();
    building_project_id UUID;
    roads_project_id UUID;
    industrial_project_id UUID;
BEGIN
    -- Insert demo auth users (trigger creates user_profiles automatically)
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        -- Building Construction Demo
        (demo_building_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'demo.building@kartaa.in',
         crypt('DemoBuilding@2026', gen_salt('bf', 10)),
         now(), now(), now(),
         jsonb_build_object('full_name', 'Demo — Building Construction', 'role', 'project_manager', 'organisation', 'KARTAA Demo — Building'),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        -- Roads Demo
        (demo_roads_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'demo.roads@kartaa.in',
         crypt('DemoRoads@2026', gen_salt('bf', 10)),
         now(), now(), now(),
         jsonb_build_object('full_name', 'Demo — Roads & Highway', 'role', 'project_manager', 'organisation', 'KARTAA Demo — Roads'),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        -- Industrial & Railway Demo
        (demo_industrial_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'demo.industrial@kartaa.in',
         crypt('DemoIndustrial@2026', gen_salt('bf', 10)),
         now(), now(), now(),
         jsonb_build_object('full_name', 'Demo — Industrial & Railway', 'role', 'project_manager', 'organisation', 'KARTAA Demo — Industrial'),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null)
    ON CONFLICT (id) DO NOTHING;

    -- Wait for trigger to create user_profiles, then get project IDs
    -- Get Building demo project
    SELECT id INTO building_project_id
    FROM public.projects
    WHERE is_demo = true AND project_type = 'Building'
    LIMIT 1;

    -- Get Roads demo project
    SELECT id INTO roads_project_id
    FROM public.projects
    WHERE is_demo = true AND project_type = 'Road'
    LIMIT 1;

    -- Get Industrial/Railway demo project
    SELECT id INTO industrial_project_id
    FROM public.projects
    WHERE is_demo = true AND project_type IN ('Industrial', 'Railway')
    LIMIT 1;

    -- ============================================================
    -- 3. DEMO SITE LOGS — Building Construction
    -- ============================================================
    INSERT INTO public.site_logs (id, user_id, project_id, sector, activity, location, log_date, status, notes, is_demo)
    VALUES
        (gen_random_uuid(), demo_building_uuid, building_project_id,
         'Building Construction', 'Foundation Pouring',
         'Block A — Grid 1-4', CURRENT_DATE - 5, 'completed',
         'M25 grade concrete poured for raft foundation. 120 cum achieved. No major defects observed.',
         true),
        (gen_random_uuid(), demo_building_uuid, building_project_id,
         'Building Construction', 'Structural Framing Inspection',
         'Block B — Level 2', CURRENT_DATE - 3, 'approved',
         'Column reinforcement checked per drawing no. SE-B-204. Cover maintained at 40mm. Ready for shuttering.',
         true),
        (gen_random_uuid(), demo_building_uuid, building_project_id,
         'Building Construction', 'Brick Masonry — External Walls',
         'Block A — Level 1', CURRENT_DATE - 2, 'in_progress',
         '230mm thick brick masonry in CM 1:6. 60% of Level 1 external walls completed.',
         true),
        (gen_random_uuid(), demo_building_uuid, building_project_id,
         'Building Construction', 'Slab Casting — Level 3',
         'Block C', CURRENT_DATE - 1, 'pending',
         'Formwork inspection pending. Concrete mix design approved. Target: 80 cum in one pour.',
         true),
        (gen_random_uuid(), demo_building_uuid, building_project_id,
         'Building Construction', 'Waterproofing — Basement',
         'Basement — Zone 2', CURRENT_DATE, 'in_progress',
         'Crystalline waterproofing applied on positive face. Curing in progress.',
         true)
    ON CONFLICT (id) DO NOTHING;

    -- ============================================================
    -- 4. DEMO SITE LOGS — Roads
    -- ============================================================
    INSERT INTO public.site_logs (id, user_id, project_id, sector, activity, location, log_date, status, notes, is_demo)
    VALUES
        (gen_random_uuid(), demo_roads_uuid, roads_project_id,
         'Roads', 'Asphalt Layering',
         'Ch. 12+400 to Ch. 13+200', CURRENT_DATE - 6, 'completed',
         'DBM Layer 1 laid at 75mm compacted thickness. Rolling done with 10T vibratory roller. Core samples collected.',
         true),
        (gen_random_uuid(), demo_roads_uuid, roads_project_id,
         'Roads', 'Traffic Control Clearance',
         'Ch. 11+000 to Ch. 12+400', CURRENT_DATE - 4, 'approved',
         'Traffic diversion plan approved by NHAI. Barricading and signage installed as per IRC:67.',
         true),
        (gen_random_uuid(), demo_roads_uuid, roads_project_id,
         'Roads', 'Granular Sub-Base (GSB) Laying',
         'Ch. 13+200 to Ch. 14+000', CURRENT_DATE - 3, 'completed',
         'GSB Grade II material laid at 200mm compacted thickness. FDT test passed at 98% MDD.',
         true),
        (gen_random_uuid(), demo_roads_uuid, roads_project_id,
         'Roads', 'Culvert Construction — Box Type',
         'Ch. 12+850', CURRENT_DATE - 2, 'in_progress',
         'Box culvert 2.0m x 1.5m. Foundation concrete done. Wall shuttering in progress.',
         true),
        (gen_random_uuid(), demo_roads_uuid, roads_project_id,
         'Roads', 'Road Marking & Signage',
         'Ch. 10+000 to Ch. 11+000', CURRENT_DATE, 'pending',
         'Thermoplastic road marking scheduled. Retroreflective signs to be installed at 500m intervals.',
         true)
    ON CONFLICT (id) DO NOTHING;

    -- ============================================================
    -- 5. DEMO SITE LOGS — Industrial Building & Railway Projects
    -- ============================================================
    INSERT INTO public.site_logs (id, user_id, project_id, sector, activity, location, log_date, status, notes, is_demo)
    VALUES
        (gen_random_uuid(), demo_industrial_uuid, industrial_project_id,
         'Industrial Building & Railway Projects', 'Track Alignment',
         'Ch. 45+200 to Ch. 46+000', CURRENT_DATE - 7, 'completed',
         'Track alignment checked with Total Station. Deviation within ±5mm tolerance. Approved by DRE.',
         true),
        (gen_random_uuid(), demo_industrial_uuid, industrial_project_id,
         'Industrial Building & Railway Projects', 'Steel Structure Erection',
         'Bay 3 — Column Line C-D', CURRENT_DATE - 5, 'approved',
         'ISMB 500 columns erected and plumbed. High-strength bolts torqued to 300 Nm. NDT pending.',
         true),
        (gen_random_uuid(), demo_industrial_uuid, industrial_project_id,
         'Industrial Building & Railway Projects', 'Ballast Spreading',
         'Ch. 44+000 to Ch. 45+200', CURRENT_DATE - 4, 'completed',
         'Machine crushed stone ballast 50mm size spread at 300mm depth below sleeper bottom. Compacted.',
         true),
        (gen_random_uuid(), demo_industrial_uuid, industrial_project_id,
         'Industrial Building & Railway Projects', 'Rail Laying — BG Track',
         'Ch. 45+200 to Ch. 45+800', CURRENT_DATE - 2, 'in_progress',
         '60 kg/m UIC rail being laid. 600m completed today. Fish-plating and joint welding in progress.',
         true),
        (gen_random_uuid(), demo_industrial_uuid, industrial_project_id,
         'Industrial Building & Railway Projects', 'OHE Mast Foundation',
         'Ch. 45+000 to Ch. 46+000', CURRENT_DATE - 1, 'pending',
         'Bored pile foundation for OHE masts. 12 piles of 600mm dia x 8m depth planned. 4 completed.',
         true)
    ON CONFLICT (id) DO NOTHING;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Demo data insertion error: %', SQLERRM;
END $$;
