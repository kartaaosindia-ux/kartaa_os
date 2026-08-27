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
  { id: 'dalert-road-001', severity: 'high', message: 'NH-48 Bypass (Pkg-3): BOQ utilization at 94.2% — projected overrun by ₹28.4L', project_name: 'NH-48 Bypass', is_active: true, sector: 'roads' },
  { id: 'dalert-road-002', severity: 'medium', message: 'Kundli–Manesar Expressway: SPI dropped to 0.96 — 2 milestones at risk this week', project_name: 'Kundli–Manesar Expressway', is_active: true, sector: 'roads' },
  { id: 'dalert-ind-001', severity: 'high', message: 'Manesar Industrial Phase-II: No progress entry logged for 5 consecutive days', project_name: 'Manesar Industrial', is_active: true, sector: 'industrial_railway' },
  { id: 'dalert-rail-001', severity: 'medium', message: 'KARTAA Rail Corridor: Track laying at Ch. 48+200 delayed — earthwork pending clearance', project_name: 'KARTAA Rail Corridor', is_active: true, sector: 'industrial_railway' },
  { id: 'dalert-bld-001', severity: 'medium', message: 'Rohini Residential Block-A: Structural framing inspection overdue by 3 days', project_name: 'Rohini Residential', is_active: true, sector: 'building' },
  { id: 'dalert-bld-002', severity: 'low', message: 'Commercial Plaza Dwarka: Foundation pouring scheduled — concrete delivery confirmation pending', project_name: 'Commercial Plaza Dwarka', is_active: true, sector: 'building' },
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
