'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDemo } from '@/contexts/DemoContext';

export interface ProjectDef {
  id: string;
  code: string;
  name: string;
  type: 'Road' | 'Industrial' | 'Building';
  subtitle: string;
  location: string;
  progress: number;
  budget: string;
  status: 'active' | 'planning' | 'completed';
  sector?: 'roads' | 'industrial_railway' | 'building';
}

export const ALL_PROJECTS: ProjectDef[] = [
  {
    id: 'proj-001',
    code: 'NHAI-DL-2024-048',
    name: 'NH-48 Bypass Package 3',
    type: 'Road',
    subtitle: 'Gurgaon, Haryana',
    location: 'Gurgaon, Haryana',
    progress: 77.1,
    budget: '₹6,21,40,000',
    status: 'active',
    sector: 'roads',
  },
  {
    id: 'proj-002',
    code: 'HSIIDC-MN-2023-112',
    name: 'Manesar Industrial Phase II',
    type: 'Industrial',
    subtitle: 'Manesar, Haryana',
    location: 'Manesar, Haryana',
    progress: 58.4,
    budget: '₹28,40,00,000',
    status: 'active',
    sector: 'industrial_railway',
  },
  {
    id: 'proj-003',
    code: 'NHAI-HR-2024-031',
    name: 'Kundli–Manesar Expressway',
    type: 'Road',
    subtitle: 'Sonipat–Gurgaon Corridor',
    location: 'Sonipat–Gurgaon',
    progress: 42.0,
    budget: '₹12,80,00,000',
    status: 'active',
    sector: 'roads',
  },
  {
    id: 'proj-006',
    code: 'DMIDC-RP-2024-044',
    name: 'Rewari Packaging Hub — Phase I',
    type: 'Industrial',
    subtitle: 'Rewari, Haryana',
    location: 'Rewari, Haryana',
    progress: 94.5,
    budget: '₹14,65,00,000',
    status: 'active',
    sector: 'industrial_railway',
  },
  {
    id: 'proj-008',
    code: 'HSIIDC-GG-2024-088',
    name: 'Gurugram Tech Corridor Block-B',
    type: 'Industrial',
    subtitle: 'Gurugram Sector 81',
    location: 'Gurugram, Haryana',
    progress: 31.2,
    budget: '₹19,20,00,000',
    status: 'active',
    sector: 'industrial_railway',
  },
  // Building Construction
  {
    id: 'proj-bld-001',
    code: 'DLF-GG-2024-SCT1',
    name: 'Skyline Commercial Tower - Phase 1',
    type: 'Building',
    subtitle: 'Gurgaon, HR',
    location: 'Gurgaon, HR',
    progress: 48.5,
    budget: '₹42,80,00,000',
    status: 'active',
    sector: 'building',
  },
  {
    id: 'proj-bld-002',
    code: 'DDA-RK-2024-011',
    name: 'Rohini Residential Complex Block-A',
    type: 'Building',
    subtitle: 'Rohini, Delhi',
    location: 'Rohini, Delhi',
    progress: 58.3,
    budget: '₹12,60,00,000',
    status: 'active',
    sector: 'building',
  },
  {
    id: 'proj-bld-003',
    code: 'NBCC-CP-2024-033',
    name: 'Commercial Plaza — Dwarka Sec 21',
    type: 'Building',
    subtitle: 'Dwarka, Delhi',
    location: 'Dwarka, Delhi',
    progress: 31.7,
    budget: '₹8,90,00,000',
    status: 'active',
    sector: 'building',
  },
];

interface ProjectContextValue {
  selectedProject: ProjectDef;
  setSelectedProject: (project: ProjectDef) => void;
  allProjects: ProjectDef[];
  sectorProjects: ProjectDef[];
  roadProjects: ProjectDef[];
  industrialProjects: ProjectDef[];
  buildingProjects: ProjectDef[];
}

const ProjectContext = createContext<ProjectContextValue>({
  selectedProject: ALL_PROJECTS[0],
  setSelectedProject: () => {},
  allProjects: ALL_PROJECTS,
  sectorProjects: ALL_PROJECTS,
  roadProjects: ALL_PROJECTS.filter((p) => p.type === 'Road'),
  industrialProjects: ALL_PROJECTS.filter((p) => p.type === 'Industrial'),
  buildingProjects: ALL_PROJECTS.filter((p) => p.type === 'Building'),
});

export const useProject = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
};

const STORAGE_KEY = 'kartaa_selected_project_id';

const SKYLINE_PROJECT = ALL_PROJECTS.find((p) => p.id === 'proj-bld-001')!;
const DEFAULT_ROAD_PROJECT = ALL_PROJECTS.find((p) => p.id === 'proj-001')!;
const DEFAULT_INDUSTRIAL_PROJECT = ALL_PROJECTS.find((p) => p.id === 'proj-002')!;

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [selectedProject, setSelectedProjectState] = useState<ProjectDef>(ALL_PROJECTS[0]);
  const { demoSector } = useDemo();

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const found = ALL_PROJECTS.find((p) => p.id === saved);
        if (found) setSelectedProjectState(found);
      }
    } catch {
      // ignore
    }
  }, []);

  // Auto-select sector default project when demo sector changes
  useEffect(() => {
    if (demoSector === 'building') {
      setSelectedProjectState(SKYLINE_PROJECT);
      try { localStorage.setItem(STORAGE_KEY, SKYLINE_PROJECT.id); } catch { /* ignore */ }
    } else if (demoSector === 'roads') {
      setSelectedProjectState(DEFAULT_ROAD_PROJECT);
      try { localStorage.setItem(STORAGE_KEY, DEFAULT_ROAD_PROJECT.id); } catch { /* ignore */ }
    } else if (demoSector === 'industrial_railway') {
      setSelectedProjectState(DEFAULT_INDUSTRIAL_PROJECT);
      try { localStorage.setItem(STORAGE_KEY, DEFAULT_INDUSTRIAL_PROJECT.id); } catch { /* ignore */ }
    }
  }, [demoSector]);

  const setSelectedProject = (project: ProjectDef) => {
    setSelectedProjectState(project);
    try {
      localStorage.setItem(STORAGE_KEY, project.id);
    } catch {
      // ignore
    }
  };

  // Sector-scoped project list for demo users
  const sectorProjects = demoSector
    ? ALL_PROJECTS.filter((p) => p.sector === demoSector)
    : ALL_PROJECTS;

  return (
    <ProjectContext.Provider
      value={{
        selectedProject,
        setSelectedProject,
        allProjects: ALL_PROJECTS,
        sectorProjects,
        roadProjects: ALL_PROJECTS.filter((p) => p.type === 'Road'),
        industrialProjects: ALL_PROJECTS.filter((p) => p.type === 'Industrial'),
        buildingProjects: ALL_PROJECTS.filter((p) => p.type === 'Building'),
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
