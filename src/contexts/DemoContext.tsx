'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

export type DemoSector = 'building' | 'roads' | 'industrial_railway' | null;

interface DemoContextValue {
  demoSector: DemoSector;
  setDemoSector: (sector: DemoSector) => void;
  isDemoUser: boolean;
  clearDemoSector: () => void;
}

const DemoContext = createContext<DemoContextValue>({
  demoSector: null,
  setDemoSector: () => {},
  isDemoUser: false,
  clearDemoSector: () => {},
});

export const useDemo = () => useContext(DemoContext);

const DEMO_SECTOR_KEY = 'kartaa_demo_sector';

export const DemoProvider = ({ children }: { children: React.ReactNode }) => {
  const [demoSector, setDemoSectorState] = useState<DemoSector>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(DEMO_SECTOR_KEY) as DemoSector | null;
    if (stored) setDemoSectorState(stored);
  }, []);

  const setDemoSector = (sector: DemoSector) => {
    setDemoSectorState(sector);
    if (sector) {
      sessionStorage.setItem(DEMO_SECTOR_KEY, sector);
    } else {
      sessionStorage.removeItem(DEMO_SECTOR_KEY);
    }
  };

  const clearDemoSector = () => {
    setDemoSectorState(null);
    sessionStorage.removeItem(DEMO_SECTOR_KEY);
  };

  return (
    <DemoContext.Provider value={{ demoSector, setDemoSector, isDemoUser: demoSector !== null, clearDemoSector }}>
      {children}
    </DemoContext.Provider>
  );
};

// ─── Sector-scoped demo data ─────────────────────────────────────────────────

export interface DemoProject {
  id: string;
  code: string;
  name: string;
  project_type: 'Road' | 'Industrial' | 'Building' | 'Railway';
  location: string;
  chainage_range: string;
  budget: string;
  progress: number;
  kartaa_score: number;
  spi: number;
  status: 'active' | 'delayed' | 'on-hold' | 'draft' | 'completed';
  last_updated: string;
  sector: DemoSector;
}

export interface DemoAlert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  project_name: string;
  is_active: boolean;
  sector: DemoSector;
  projectId: string;
}

export interface DemoKpi {
  active_sites: number;
  total_sites: number;
  pending_verifications: number;
  overdue_verifications: number;
  boq_utilization: number;
  boq_consumed_cr: number;
  avg_spi: number;
  cost_variance_cr: number;
  milestone_adherence: number;
  milestones_on_time: number;
  total_milestones: number;
  kartaa_score: number;
}

export interface ProjectVerificationBreakdown {
  label: string;
  score: number;
  status: 'active' | 'delayed' | 'completed' | 'on-hold';
}

export const DEMO_PROJECTS: DemoProject[] = [
  // Roads
  { id: 'demo-road-001', code: 'NHAI-DL-2024-048', name: 'NH-48 Bypass Package 3', project_type: 'Road', location: 'Gurgaon, Haryana', chainage_range: '42+000 – 67+500', budget: '₹6,21,40,000', progress: 77.1, kartaa_score: 82, spi: 0.88, status: 'active', last_updated: '23 Aug', sector: 'roads' },
  { id: 'demo-road-002', code: 'NHAI-HR-2024-031', name: 'Kundli–Manesar Expressway', project_type: 'Road', location: 'Sonipat–Gurgaon Corridor', chainage_range: '0+000 – 83+200', budget: '₹14,82,00,000', progress: 52.8, kartaa_score: 91, spi: 0.96, status: 'active', last_updated: '23 Aug', sector: 'roads' },
  { id: 'demo-road-003', code: 'HPWD-FR-2024-007', name: 'Faridabad Ring Road Segment 4', project_type: 'Road', location: 'Faridabad, Haryana', chainage_range: '18+400 – 34+700', budget: '₹11,34,00,000', progress: 38.4, kartaa_score: 74, spi: 0.81, status: 'on-hold', last_updated: '20 Aug', sector: 'roads' },
  // Industrial & Railway
  { id: 'demo-ind-001', code: 'HSIIDC-MN-2023-112', name: 'Manesar Industrial Phase II', project_type: 'Industrial', location: 'Manesar, Haryana', chainage_range: '—', budget: '₹9,14,00,000', progress: 44.1, kartaa_score: 61, spi: 0.71, status: 'delayed', last_updated: '18 Aug', sector: 'industrial_railway' },
  { id: 'demo-rail-001', code: 'KRCL-RC-2024-001', name: 'KARTAA Rail Corridor Demo', project_type: 'Railway', location: 'Delhi–Rewari Corridor', chainage_range: '0+000 – 124+600', budget: '₹28,40,00,000', progress: 34.6, kartaa_score: 69, spi: 0.78, status: 'active', last_updated: '22 Aug', sector: 'industrial_railway' },
  { id: 'demo-ind-002', code: 'DMIDC-RP-2024-044', name: 'Rewari Packaging Hub — Phase I', project_type: 'Industrial', location: 'Rewari, Haryana', chainage_range: '—', budget: '₹5,48,00,000', progress: 91.2, kartaa_score: 88, spi: 0.99, status: 'completed', last_updated: '21 Aug', sector: 'industrial_railway' },
  // Building
  { id: 'demo-bld-001', code: 'DDA-RK-2024-011', name: 'Rohini Residential Complex Block-A', project_type: 'Building', location: 'Rohini, Delhi', chainage_range: '—', budget: '₹12,60,00,000', progress: 58.3, kartaa_score: 76, spi: 0.89, status: 'active', last_updated: '22 Aug', sector: 'building' },
  { id: 'demo-bld-002', code: 'NBCC-CP-2024-033', name: 'Commercial Plaza — Dwarka Sec 21', project_type: 'Building', location: 'Dwarka, Delhi', chainage_range: '—', budget: '₹8,90,00,000', progress: 31.7, kartaa_score: 65, spi: 0.74, status: 'active', last_updated: '21 Aug', sector: 'building' },
  { id: 'demo-bld-003', code: 'PWD-DL-2024-055', name: 'Government Office Complex — Saket', project_type: 'Building', location: 'Saket, Delhi', chainage_range: '—', budget: '₹6,20,00,000', progress: 72.4, kartaa_score: 83, spi: 0.94, status: 'active', last_updated: '23 Aug', sector: 'building' },
];

export const DEMO_ALERTS: DemoAlert[] = [
  { id: 'dalert-road-001', severity: 'high', message: 'NH-48 Bypass (Pkg-3): BOQ utilization at 94.2% — projected overrun by ₹28.4L', project_name: 'NH-48 Bypass', is_active: true, sector: 'roads', projectId: 'proj-001' },
  { id: 'dalert-road-002', severity: 'medium', message: 'Kundli–Manesar Expressway: SPI dropped to 0.96 — 2 milestones at risk this week', project_name: 'Kundli–Manesar Expressway', is_active: true, sector: 'roads', projectId: 'proj-003' },
  { id: 'dalert-ind-001', severity: 'high', message: 'Manesar Industrial Phase-II: No progress entry logged for 5 consecutive days', project_name: 'Manesar Industrial', is_active: true, sector: 'industrial_railway', projectId: 'proj-002' },
  { id: 'dalert-rail-001', severity: 'medium', message: 'KARTAA Rail Corridor: Track laying at Ch. 48+200 delayed — earthwork pending clearance', project_name: 'KARTAA Rail Corridor', is_active: true, sector: 'industrial_railway', projectId: 'proj-006' },
  // Skyline Commercial Tower alerts
  { id: 'dalert-bld-sky-001', severity: 'high', message: 'Skyline Commercial Tower: Tower A — Floor 12 structural inspection overdue by 4 days', project_name: 'Skyline Commercial Tower', is_active: true, sector: 'building', projectId: 'proj-bld-001' },
  { id: 'dalert-bld-sky-002', severity: 'medium', message: 'Skyline Commercial Tower: Concrete cube test results pending for Basement Level 2 pour', project_name: 'Skyline Commercial Tower', is_active: true, sector: 'building', projectId: 'proj-bld-001' },
  // Rohini Residential alerts
  { id: 'dalert-bld-001', severity: 'medium', message: 'Rohini Residential Block-A: Structural framing inspection overdue by 3 days', project_name: 'Rohini Residential', is_active: true, sector: 'building', projectId: 'proj-bld-002' },
  // Commercial Plaza alerts
  { id: 'dalert-bld-002', severity: 'low', message: 'Commercial Plaza Dwarka: Foundation pouring scheduled — concrete delivery confirmation pending', project_name: 'Commercial Plaza Dwarka', is_active: true, sector: 'building', projectId: 'proj-bld-003' },
];

export const DEMO_KPIS: Record<NonNullable<DemoSector>, DemoKpi> = {
  roads: {
    active_sites: 3, total_sites: 3, pending_verifications: 8, overdue_verifications: 2,
    boq_utilization: 71.4, boq_consumed_cr: 2.84, avg_spi: 0.88, cost_variance_cr: 0.92,
    milestone_adherence: 78.6, milestones_on_time: 11, total_milestones: 14, kartaa_score: 82,
  },
  industrial_railway: {
    active_sites: 2, total_sites: 3, pending_verifications: 11, overdue_verifications: 3,
    boq_utilization: 54.2, boq_consumed_cr: 3.61, avg_spi: 0.83, cost_variance_cr: 1.44,
    milestone_adherence: 64.3, milestones_on_time: 9, total_milestones: 14, kartaa_score: 69,
  },
  building: {
    active_sites: 3, total_sites: 3, pending_verifications: 6, overdue_verifications: 1,
    boq_utilization: 54.1, boq_consumed_cr: 1.52, avg_spi: 0.86, cost_variance_cr: 0.48,
    milestone_adherence: 74.1, milestones_on_time: 8, total_milestones: 11, kartaa_score: 75,
  },
};

// ─── Per-project KPIs (strict project-level scoping) ─────────────────────────
export const PROJECT_KPIS: Record<string, DemoKpi> = {
  // Roads
  'proj-001': {
    active_sites: 1, total_sites: 1, pending_verifications: 3, overdue_verifications: 1,
    boq_utilization: 94.2, boq_consumed_cr: 1.84, avg_spi: 0.88, cost_variance_cr: 0.28,
    milestone_adherence: 75.0, milestones_on_time: 3, total_milestones: 4, kartaa_score: 82,
  },
  'proj-003': {
    active_sites: 1, total_sites: 1, pending_verifications: 5, overdue_verifications: 1,
    boq_utilization: 52.8, boq_consumed_cr: 1.00, avg_spi: 0.96, cost_variance_cr: 0.64,
    milestone_adherence: 83.3, milestones_on_time: 5, total_milestones: 6, kartaa_score: 91,
  },
  // Industrial
  'proj-002': {
    active_sites: 1, total_sites: 1, pending_verifications: 6, overdue_verifications: 2,
    boq_utilization: 44.1, boq_consumed_cr: 1.21, avg_spi: 0.71, cost_variance_cr: 0.80,
    milestone_adherence: 57.1, milestones_on_time: 4, total_milestones: 7, kartaa_score: 61,
  },
  'proj-006': {
    active_sites: 1, total_sites: 1, pending_verifications: 2, overdue_verifications: 0,
    boq_utilization: 91.2, boq_consumed_cr: 1.40, avg_spi: 0.99, cost_variance_cr: 0.12,
    milestone_adherence: 85.7, milestones_on_time: 6, total_milestones: 7, kartaa_score: 88,
  },
  'proj-008': {
    active_sites: 1, total_sites: 1, pending_verifications: 3, overdue_verifications: 1,
    boq_utilization: 31.2, boq_consumed_cr: 1.00, avg_spi: 0.74, cost_variance_cr: 0.52,
    milestone_adherence: 50.0, milestones_on_time: 2, total_milestones: 4, kartaa_score: 65,
  },
  // Building — Skyline Commercial Tower
  'proj-bld-001': {
    active_sites: 1, total_sites: 1, pending_verifications: 4, overdue_verifications: 1,
    boq_utilization: 48.5, boq_consumed_cr: 0.82, avg_spi: 0.91, cost_variance_cr: 0.18,
    milestone_adherence: 72.7, milestones_on_time: 8, total_milestones: 11, kartaa_score: 79,
  },
  'proj-bld-002': {
    active_sites: 1, total_sites: 1, pending_verifications: 2, overdue_verifications: 0,
    boq_utilization: 58.3, boq_consumed_cr: 0.46, avg_spi: 0.89, cost_variance_cr: 0.14,
    milestone_adherence: 80.0, milestones_on_time: 4, total_milestones: 5, kartaa_score: 76,
  },
  'proj-bld-003': {
    active_sites: 1, total_sites: 1, pending_verifications: 1, overdue_verifications: 0,
    boq_utilization: 31.7, boq_consumed_cr: 0.24, avg_spi: 0.74, cost_variance_cr: 0.16,
    milestone_adherence: 60.0, milestones_on_time: 3, total_milestones: 5, kartaa_score: 65,
  },
};

// ─── Per-project verification breakdown for KartaaScoreCard ──────────────────
export const PROJECT_SCORE_BREAKDOWN: Record<string, ProjectVerificationBreakdown[]> = {
  // Skyline Commercial Tower — Phase 1
  'proj-bld-001': [
    { label: 'Tower A — Floor Status (1–12)', score: 84, status: 'active' },
    { label: 'Concrete Cube Tests (28-day)', score: 71, status: 'delayed' },
    { label: 'Structural Compliance Checks', score: 79, status: 'active' },
    { label: 'Basement Waterproofing Verify', score: 88, status: 'completed' },
  ],
  'proj-bld-002': [
    { label: 'Block-A Framing Inspection', score: 76, status: 'active' },
    { label: 'Rebar Placement Verification', score: 82, status: 'active' },
    { label: 'Plinth Beam Compliance', score: 69, status: 'delayed' },
  ],
  'proj-bld-003': [
    { label: 'Foundation Pour Verification', score: 65, status: 'active' },
    { label: 'Column Casting Compliance', score: 58, status: 'delayed' },
    { label: 'Soil Bearing Capacity Tests', score: 72, status: 'active' },
  ],
  // Roads
  'proj-001': [
    { label: 'Subgrade Compaction (Ch. 42–55)', score: 88, status: 'active' },
    { label: 'Granular Sub-Base Layer', score: 79, status: 'active' },
    { label: 'Bituminous Concrete QC', score: 74, status: 'delayed' },
    { label: 'Drainage Structure Checks', score: 86, status: 'active' },
  ],
  'proj-003': [
    { label: 'Earthwork Compaction Tests', score: 94, status: 'active' },
    { label: 'Pavement Thickness Verify', score: 88, status: 'active' },
    { label: 'Bridge Deck Compliance', score: 91, status: 'active' },
  ],
  // Industrial
  'proj-002': [
    { label: 'Structural Steel Erection', score: 61, status: 'delayed' },
    { label: 'Foundation Bolt Verification', score: 58, status: 'delayed' },
    { label: 'Roofing Sheet Compliance', score: 64, status: 'active' },
  ],
  'proj-006': [
    { label: 'Pre-Eng. Building Erection', score: 91, status: 'completed' },
    { label: 'Flooring & Hardener Tests', score: 88, status: 'completed' },
    { label: 'Fire Safety Compliance', score: 85, status: 'active' },
  ],
  'proj-008': [
    { label: 'Piling & Foundation Works', score: 62, status: 'active' },
    { label: 'Structural Frame Compliance', score: 58, status: 'delayed' },
    { label: 'MEP Rough-In Verification', score: 71, status: 'active' },
  ],
};
