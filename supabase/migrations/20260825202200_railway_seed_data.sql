-- ─── KARTAA Railway Seed Data ────────────────────────────────────────────────
-- Timestamp: 20260825202200
-- Seeds ONE fictional demo railway project.
-- Runs AFTER 20260825202115_railway_schema.sql so enum values are committed.

DO $$
DECLARE
  v_project_id UUID;
BEGIN
  -- Insert demo project only if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.projects WHERE code = 'KARTAA-RAIL-DEMO-001') THEN
    INSERT INTO public.projects (
      id, code, name, project_type, location, chainage_range,
      budget, progress, kartaa_score, spi, status, last_updated
    ) VALUES (
      gen_random_uuid(),
      'KARTAA-RAIL-DEMO-001',
      'KARTAA Rail Corridor Demo Project',
      'Railway',
      'Fictional Central India Rail Corridor',
      '120+000 – 206+000',
      '₹3,250 Cr',
      44,
      78,
      0.91,
      'active',
      '25 Aug 2026'
    )
    RETURNING id INTO v_project_id;

    -- Railway project details
    INSERT INTO public.railway_project_details (
      project_id, railway_zone, division, gauge, track_type,
      total_route_length_km, start_chainage, end_chainage,
      number_of_stations, number_of_bridges, number_of_rob_rub,
      number_of_culverts, number_of_level_crossings,
      planned_progress, actual_progress, track_progress,
      formation_progress, station_progress, bridge_progress,
      electrification_progress, signalling_progress
    ) VALUES (
      v_project_id, 'Central Railway', 'Nagpur Division',
      'Broad Gauge (1676mm)', 'Double Line',
      86.0, '120+000', '206+000',
      8, 24, 12, 68, 15,
      48, 44, 38, 61, 22, 55, 18, 12
    );

    -- Seed WBS items
    INSERT INTO public.railway_wbs_items (project_id, wbs_code, parent_code, name, level, unit, planned_qty, achieved_qty, progress_pct, sort_order) VALUES
      (v_project_id, '1', NULL, 'Earthwork & Formation', 1, 'm³', 4200000, 2562000, 61, 10),
      (v_project_id, '1.1', '1', 'Embankment', 2, 'm³', 2800000, 1820000, 65, 20),
      (v_project_id, '1.2', '1', 'Subgrade', 2, 'm³', 980000, 588000, 60, 30),
      (v_project_id, '1.3', '1', 'Blanketing', 2, 'm³', 280000, 112000, 40, 40),
      (v_project_id, '1.4', '1', 'Drainage', 2, 'm', 86000, 43000, 50, 50),
      (v_project_id, '2', NULL, 'Track Works', 1, 'm', 172000, 65360, 38, 60),
      (v_project_id, '2.1', '2', 'Ballast', 2, 'm³', 258000, 90300, 35, 70),
      (v_project_id, '2.2', '2', 'Sleepers', 2, 'Nos.', 344000, 120400, 35, 80),
      (v_project_id, '2.3', '2', 'Rails', 2, 'm', 172000, 65360, 38, 90),
      (v_project_id, '2.4', '2', 'Turnouts', 2, 'Nos.', 48, 12, 25, 100),
      (v_project_id, '3', NULL, 'Bridges & Structures', 1, 'Nos.', 24, 13, 55, 110),
      (v_project_id, '3.1', '3', 'Culverts', 2, 'Nos.', 68, 45, 66, 120),
      (v_project_id, '3.2', '3', 'ROB/RUB', 2, 'Nos.', 12, 5, 42, 130),
      (v_project_id, '4', NULL, 'Stations', 1, 'Nos.', 8, 2, 22, 140),
      (v_project_id, '4.1', '4', 'Platform Works', 2, 'm²', 48000, 9600, 20, 150),
      (v_project_id, '4.2', '4', 'Station Buildings', 2, 'm²', 32000, 6400, 20, 160),
      (v_project_id, '5', NULL, 'Electrical / OHE', 1, 'm', 172000, 30960, 18, 170),
      (v_project_id, '6', NULL, 'Signalling & Telecom', 1, 'Nos.', 186, 22, 12, 180),
      (v_project_id, '7', NULL, 'Level Crossings', 1, 'Nos.', 15, 4, 27, 190),
      (v_project_id, '8', NULL, 'Testing & Commissioning', 1, 'Lot', 1, 0, 0, 200);

    -- Seed assets
    INSERT INTO public.railway_assets (project_id, asset_id, asset_type, name, chainage, location, planned_status, actual_status, progress_pct) VALUES
      (v_project_id, 'BR-001', 'Bridge', 'Major Bridge — Wainganga River', '134+250', 'Fictional Wainganga Crossing', 'In Progress', 'In Progress', 72),
      (v_project_id, 'BR-002', 'Bridge', 'Minor Bridge — Fictional Nala', '141+800', 'Fictional Nala Crossing', 'Completed', 'Completed', 100),
      (v_project_id, 'BR-003', 'Bridge', 'Major Bridge — Fictional Canal', '158+400', 'Fictional Canal Crossing', 'In Progress', 'In Progress', 45),
      (v_project_id, 'ROB-001', 'ROB', 'ROB — Fictional NH-44 Crossing', '127+600', 'Fictional NH-44', 'In Progress', 'In Progress', 38),
      (v_project_id, 'ROB-002', 'ROB', 'ROB — Fictional SH-26 Crossing', '163+200', 'Fictional SH-26', 'Not Started', 'Not Started', 0),
      (v_project_id, 'STN-001', 'Station', 'Fictional Koradi Station', '128+400', 'Fictional Koradi', 'In Progress', 'In Progress', 35),
      (v_project_id, 'STN-002', 'Station', 'Fictional Kamptee Station', '145+200', 'Fictional Kamptee', 'In Progress', 'In Progress', 28),
      (v_project_id, 'STN-003', 'Station', 'Fictional Ramtek Station', '172+800', 'Fictional Ramtek', 'Not Started', 'Not Started', 5),
      (v_project_id, 'LC-001', 'Level Crossing', 'LC No. 14 — Fictional Village Road', '131+500', 'Fictional Village Road', 'Completed', 'Completed', 100),
      (v_project_id, 'LC-002', 'Level Crossing', 'LC No. 22 — Fictional District Road', '149+800', 'Fictional District Road', 'In Progress', 'In Progress', 60);

    -- Seed chainage segments
    INSERT INTO public.railway_chainage_segments (project_id, segment_name, start_chainage, end_chainage, length_m, wbs_code, activity, planned_progress, actual_progress, status) VALUES
      (v_project_id, 'Segment 1', '120+000', '130+000', 10000, '1', 'Earthwork & Formation', 85, 80, 'in_progress'),
      (v_project_id, 'Segment 2', '130+000', '140+000', 10000, '1', 'Earthwork & Formation', 80, 72, 'in_progress'),
      (v_project_id, 'Segment 3', '140+000', '150+000', 10000, '2', 'Track Works', 60, 48, 'in_progress'),
      (v_project_id, 'Segment 4', '150+000', '160+000', 10000, '2', 'Track Works', 45, 32, 'in_progress'),
      (v_project_id, 'Segment 5', '160+000', '170+000', 10000, '1', 'Earthwork & Formation', 55, 40, 'in_progress'),
      (v_project_id, 'Segment 6', '170+000', '180+000', 10000, '1', 'Earthwork & Formation', 40, 25, 'in_progress'),
      (v_project_id, 'Segment 7', '180+000', '190+000', 10000, '1', 'Earthwork & Formation', 20, 10, 'in_progress'),
      (v_project_id, 'Segment 8', '190+000', '206+000', 16000, '1', 'Earthwork & Formation', 10, 5, 'not_started');

  END IF;
END$$;
