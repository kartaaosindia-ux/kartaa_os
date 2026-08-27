'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import Link from 'next/link';
import { ArrowLeft, FileText, Layers, ClipboardList, Upload, CheckCircle2, AlertCircle, ChevronRight, Eye, Plus, Search, BarChart3, IndianRupee, Package, Ruler } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';

// ─── Project definitions ───────────────────────────────────────────────────────
interface ProjectDef {
  id: string;
  code: string;
  name: string;
  type: 'Road' | 'Industrial' | 'Building';
  subtitle: string;
}

const PROJECTS: ProjectDef[] = [
  { id: 'proj-001', code: 'NHAI-DL-2024-048', name: 'NH-48 Bypass Package 3', type: 'Road', subtitle: 'Gurgaon, Haryana' },
  { id: 'proj-002', code: 'HSIIDC-MN-2023-112', name: 'Manesar Industrial Phase II', type: 'Industrial', subtitle: 'Manesar, Haryana' },
  { id: 'proj-003', code: 'NHAI-HR-2024-031', name: 'Kundli–Manesar Expressway', type: 'Road', subtitle: 'Sonipat–Gurgaon Corridor' },
  { id: 'proj-006', code: 'DMIDC-RP-2024-044', name: 'Rewari Packaging Hub — Phase I', type: 'Industrial', subtitle: 'Rewari, Haryana' },
  { id: 'proj-008', code: 'HSIIDC-GG-2024-088', name: 'Gurugram Tech Corridor Block-B', type: 'Industrial', subtitle: 'Gurugram Sector 81' },
  { id: 'proj-bld-001', code: 'DLF-GG-2024-SCT1', name: 'Skyline Commercial Tower - Phase 1', type: 'Building', subtitle: 'Gurgaon, HR' },
  { id: 'proj-bld-002', code: 'DDA-RK-2024-011', name: 'Rohini Residential Complex Block-A', type: 'Building', subtitle: 'Rohini, Delhi' },
  { id: 'proj-bld-003', code: 'NBCC-CP-2024-033', name: 'Commercial Plaza — Dwarka Sec 21', type: 'Building', subtitle: 'Dwarka, Delhi' },
];

// ─── Road project data (NH-48) ─────────────────────────────────────────────────
const roadDrawings = [
  { id: 'drw-001', ref: 'NH48-RD-001', title: 'Typical Cross Section — Sub-grade', discipline: 'Road', rev: 'R2', takeoffDone: true, boqLinked: true, uploadedOn: '10 Mar 2024' },
  { id: 'drw-002', ref: 'NH48-RD-002', title: 'Pavement Layer Details', discipline: 'Road', rev: 'R3', takeoffDone: true, boqLinked: true, uploadedOn: '10 Mar 2024' },
  { id: 'drw-003', ref: 'NH48-RD-003', title: 'Culvert Type-A (Box)', discipline: 'Drainage', rev: 'R1', takeoffDone: true, boqLinked: true, uploadedOn: '12 Mar 2024' },
  { id: 'drw-004', ref: 'NH48-RD-004', title: 'Culvert Type-B (Pipe)', discipline: 'Drainage', rev: 'R1', takeoffDone: true, boqLinked: false, uploadedOn: '12 Mar 2024' },
  { id: 'drw-005', ref: 'NH48-BR-001', title: 'Minor Bridge — Abutment Details', discipline: 'Bridge', rev: 'R2', takeoffDone: true, boqLinked: true, uploadedOn: '15 Mar 2024' },
  { id: 'drw-006', ref: 'NH48-BR-002', title: 'Minor Bridge — Pier & Deck', discipline: 'Bridge', rev: 'R2', takeoffDone: false, boqLinked: false, uploadedOn: '15 Mar 2024' },
  { id: 'drw-007', ref: 'NH48-RD-005', title: 'Median & Kerb Details', discipline: 'Road', rev: 'R1', takeoffDone: true, boqLinked: true, uploadedOn: '18 Mar 2024' },
  { id: 'drw-008', ref: 'NH48-RD-006', title: 'Road Furniture & Signage', discipline: 'Road', rev: 'R0', takeoffDone: false, boqLinked: false, uploadedOn: '20 Mar 2024' },
];

const roadBoqItems = [
  { id: 'boq-001', itemNo: '1.1', description: 'Earthwork in excavation — Sub-grade preparation', unit: 'm³', qty: '1,24,500', rate: '₹185', amount: '₹2,30,32,500', progress: 100, drawingRef: 'NH48-RD-001' },
  { id: 'boq-002', itemNo: '1.2', description: 'Granular Sub-base (GSB) — 200mm compacted', unit: 'm³', qty: '51,000', rate: '₹1,240', amount: '₹6,32,40,000', progress: 100, drawingRef: 'NH48-RD-002' },
  { id: 'boq-003', itemNo: '1.3', description: 'Wet Mix Macadam (WMM) — 250mm compacted', unit: 'm³', qty: '63,750', rate: '₹1,680', amount: '₹1,07,10,000', progress: 88, drawingRef: 'NH48-RD-002' },
  { id: 'boq-004', itemNo: '1.4', description: 'Dense Bituminous Macadam (DBM) — 60mm', unit: 'm²', qty: '2,55,000', rate: '₹420', amount: '₹1,07,10,000', progress: 52, drawingRef: 'NH48-RD-002' },
  { id: 'boq-005', itemNo: '1.5', description: 'Bituminous Concrete (BC) — 40mm wearing course', unit: 'm²', qty: '2,55,000', rate: '₹380', amount: '₹96,90,000', progress: 0, drawingRef: 'NH48-RD-002' },
  { id: 'boq-006', itemNo: '2.1', description: 'Box Culvert (Type-A) — 2.0m × 1.5m', unit: 'Nos.', qty: '18', rate: '₹8,40,000', amount: '₹1,51,20,000', progress: 100, drawingRef: 'NH48-RD-003' },
  { id: 'boq-007', itemNo: '3.1', description: 'Minor Bridge — RCC Abutment & Pier', unit: 'm³', qty: '840', rate: '₹12,500', amount: '₹1,05,00,000', progress: 75, drawingRef: 'NH48-BR-001' },
  { id: 'boq-008', itemNo: '4.1', description: 'Median Kerb — Precast RCC', unit: 'm', qty: '51,000', rate: '₹480', amount: '₹2,44,80,000', progress: 60, drawingRef: 'NH48-RD-005' },
];

// ─── Industrial project data (Manesar / Rewari / Gurugram) ────────────────────
const industrialDrawingsMap: Record<string, typeof roadDrawings> = {
  'proj-002': [
    { id: 'idrw-001', ref: 'MN-CIVIL-001', title: 'Site Layout & Grading Plan', discipline: 'Civil', rev: 'R2', takeoffDone: true, boqLinked: true, uploadedOn: '05 Jan 2024' },
    { id: 'idrw-002', ref: 'MN-CIVIL-002', title: 'Foundation Layout — Industrial Shed A', discipline: 'Civil', rev: 'R3', takeoffDone: true, boqLinked: true, uploadedOn: '05 Jan 2024' },
    { id: 'idrw-003', ref: 'MN-STRUCT-001', title: 'Pre-Engineered Building (PEB) Frame', discipline: 'Structural', rev: 'R2', takeoffDone: true, boqLinked: true, uploadedOn: '10 Jan 2024' },
    { id: 'idrw-004', ref: 'MN-STRUCT-002', title: 'Mezzanine Floor & Staircase Details', discipline: 'Structural', rev: 'R1', takeoffDone: true, boqLinked: false, uploadedOn: '10 Jan 2024' },
    { id: 'idrw-005', ref: 'MN-MEP-001', title: 'Electrical Single Line Diagram', discipline: 'MEP', rev: 'R1', takeoffDone: true, boqLinked: true, uploadedOn: '15 Jan 2024' },
    { id: 'idrw-006', ref: 'MN-MEP-002', title: 'Fire Hydrant & Sprinkler Layout', discipline: 'MEP', rev: 'R1', takeoffDone: false, boqLinked: false, uploadedOn: '15 Jan 2024' },
    { id: 'idrw-007', ref: 'MN-CIVIL-003', title: 'Internal Roads & Hardstand', discipline: 'Civil', rev: 'R1', takeoffDone: true, boqLinked: true, uploadedOn: '20 Jan 2024' },
    { id: 'idrw-008', ref: 'MN-CIVIL-004', title: 'Boundary Wall & Gate Details', discipline: 'Civil', rev: 'R0', takeoffDone: false, boqLinked: false, uploadedOn: '22 Jan 2024' },
    { id: 'idrw-009', ref: 'MN-DRAIN-001', title: 'Storm Water Drainage Network', discipline: 'Drainage', rev: 'R2', takeoffDone: true, boqLinked: true, uploadedOn: '25 Jan 2024' },
    { id: 'idrw-010', ref: 'MN-DRAIN-002', title: 'ETP & STP Layout', discipline: 'Drainage', rev: 'R1', takeoffDone: true, boqLinked: false, uploadedOn: '28 Jan 2024' },
  ],
  'proj-006': [
    { id: 'rdrw-001', ref: 'RP-CIVIL-001', title: 'Master Layout Plan — Packaging Hub', discipline: 'Civil', rev: 'R3', takeoffDone: true, boqLinked: true, uploadedOn: '01 Jun 2024' },
    { id: 'rdrw-002', ref: 'RP-STRUCT-001', title: 'Warehouse Structural Frame', discipline: 'Structural', rev: 'R2', takeoffDone: true, boqLinked: true, uploadedOn: '05 Jun 2024' },
    { id: 'rdrw-003', ref: 'RP-MEP-001', title: 'HT/LT Power Distribution', discipline: 'MEP', rev: 'R2', takeoffDone: true, boqLinked: true, uploadedOn: '08 Jun 2024' },
    { id: 'rdrw-004', ref: 'RP-CIVIL-002', title: 'Paving & Hardstand Details', discipline: 'Civil', rev: 'R1', takeoffDone: true, boqLinked: true, uploadedOn: '10 Jun 2024' },
    { id: 'rdrw-005', ref: 'RP-DRAIN-001', title: 'Drainage & Sewage Network', discipline: 'Drainage', rev: 'R1', takeoffDone: true, boqLinked: true, uploadedOn: '12 Jun 2024' },
  ],
  'proj-008': [
    { id: 'gdrw-001', ref: 'GG-CIVIL-001', title: 'Tech Park Master Layout', discipline: 'Civil', rev: 'R2', takeoffDone: true, boqLinked: true, uploadedOn: '10 Mar 2024' },
    { id: 'gdrw-002', ref: 'GG-STRUCT-001', title: 'Office Block A — Structural Drawings', discipline: 'Structural', rev: 'R2', takeoffDone: true, boqLinked: true, uploadedOn: '12 Mar 2024' },
    { id: 'gdrw-003', ref: 'GG-MEP-001', title: 'HVAC & Mechanical Layout', discipline: 'MEP', rev: 'R1', takeoffDone: true, boqLinked: true, uploadedOn: '15 Mar 2024' },
    { id: 'gdrw-004', ref: 'GG-MEP-002', title: 'Plumbing & Sanitation', discipline: 'MEP', rev: 'R1', takeoffDone: false, boqLinked: false, uploadedOn: '15 Mar 2024' },
    { id: 'gdrw-005', ref: 'GG-CIVIL-002', title: 'Landscape & External Works', discipline: 'Civil', rev: 'R0', takeoffDone: false, boqLinked: false, uploadedOn: '18 Mar 2024' },
    { id: 'gdrw-006', ref: 'GG-STRUCT-002', title: 'Basement Retaining Wall', discipline: 'Structural', rev: 'R2', takeoffDone: true, boqLinked: true, uploadedOn: '20 Mar 2024' },
  ],
};

const industrialBoqMap: Record<string, typeof roadBoqItems> = {
  'proj-002': [
    { id: 'iboq-001', itemNo: '1.1', description: 'Site clearing, grubbing & levelling', unit: 'm²', qty: '48,500', rate: '₹95', amount: '₹46,07,500', progress: 100, drawingRef: 'MN-CIVIL-001' },
    { id: 'iboq-002', itemNo: '1.2', description: 'Earthwork in excavation for foundations', unit: 'm³', qty: '12,400', rate: '₹210', amount: '₹26,04,000', progress: 100, drawingRef: 'MN-CIVIL-002' },
    { id: 'iboq-003', itemNo: '1.3', description: 'PCC M10 — Lean concrete bed (100mm)', unit: 'm³', qty: '1,860', rate: '₹4,200', amount: '₹78,12,000', progress: 100, drawingRef: 'MN-CIVIL-002' },
    { id: 'iboq-004', itemNo: '1.4', description: 'RCC M30 — Isolated footings & pedestals', unit: 'm³', qty: '3,240', rate: '₹8,800', amount: '₹2,85,12,000', progress: 88, drawingRef: 'MN-CIVIL-002' },
    { id: 'iboq-005', itemNo: '2.1', description: 'Pre-Engineered Building (PEB) — Supply & Erection', unit: 'MT', qty: '1,840', rate: '₹92,000', amount: '₹16,92,80,000', progress: 44, drawingRef: 'MN-STRUCT-001' },
    { id: 'iboq-006', itemNo: '2.2', description: 'Mezzanine floor — RCC slab 150mm', unit: 'm²', qty: '4,200', rate: '₹2,800', amount: '₹1,17,60,000', progress: 20, drawingRef: 'MN-STRUCT-002' },
    { id: 'iboq-007', itemNo: '3.1', description: 'HT Panel, Transformer & LT Distribution', unit: 'LS', qty: '1', rate: '₹1,84,00,000', amount: '₹1,84,00,000', progress: 60, drawingRef: 'MN-MEP-001' },
    { id: 'iboq-008', itemNo: '3.2', description: 'Fire Hydrant & Sprinkler System', unit: 'LS', qty: '1', rate: '₹68,00,000', amount: '₹68,00,000', progress: 0, drawingRef: 'MN-MEP-002' },
    { id: 'iboq-009', itemNo: '4.1', description: 'Internal Roads — CC Pavement 200mm', unit: 'm²', qty: '9,600', rate: '₹1,450', amount: '₹1,39,20,000', progress: 35, drawingRef: 'MN-CIVIL-003' },
    { id: 'iboq-010', itemNo: '5.1', description: 'Storm Water Drainage — RCC NP3 pipes', unit: 'm', qty: '2,400', rate: '₹3,200', amount: '₹76,80,000', progress: 50, drawingRef: 'MN-DRAIN-001' },
  ],
  'proj-006': [
    { id: 'rboq-001', itemNo: '1.1', description: 'Site development & grading', unit: 'm²', qty: '32,000', rate: '₹110', amount: '₹35,20,000', progress: 100, drawingRef: 'RP-CIVIL-001' },
    { id: 'rboq-002', itemNo: '1.2', description: 'RCC foundations — Warehouse block', unit: 'm³', qty: '2,800', rate: '₹9,200', amount: '₹2,57,60,000', progress: 100, drawingRef: 'RP-CIVIL-001' },
    { id: 'rboq-003', itemNo: '2.1', description: 'Steel structural frame — Warehouse', unit: 'MT', qty: '980', rate: '₹88,000', amount: '₹8,62,40,000', progress: 100, drawingRef: 'RP-STRUCT-001' },
    { id: 'rboq-004', itemNo: '3.1', description: 'HT/LT Power supply & distribution', unit: 'LS', qty: '1', rate: '₹1,20,00,000', amount: '₹1,20,00,000', progress: 95, drawingRef: 'RP-MEP-001' },
    { id: 'rboq-005', itemNo: '4.1', description: 'Concrete paving & hardstand', unit: 'm²', qty: '14,500', rate: '₹1,380', amount: '₹2,00,10,000', progress: 88, drawingRef: 'RP-CIVIL-002' },
    { id: 'rboq-006', itemNo: '5.1', description: 'Drainage & sewage network', unit: 'm', qty: '1,800', rate: '₹2,900', amount: '₹52,20,000', progress: 90, drawingRef: 'RP-DRAIN-001' },
  ],
  'proj-008': [
    { id: 'gboq-001', itemNo: '1.1', description: 'Excavation & basement construction', unit: 'm³', qty: '18,400', rate: '₹3,200', amount: '₹5,88,80,000', progress: 100, drawingRef: 'GG-STRUCT-002' },
    { id: 'gboq-002', itemNo: '1.2', description: 'RCC framed structure — Office Block A', unit: 'm³', qty: '6,200', rate: '₹11,500', amount: '₹7,13,00,000', progress: 80, drawingRef: 'GG-STRUCT-001' },
    { id: 'gboq-003', itemNo: '2.1', description: 'HVAC system — Chiller & AHU', unit: 'LS', qty: '1', rate: '₹2,40,00,000', amount: '₹2,40,00,000', progress: 45, drawingRef: 'GG-MEP-001' },
    { id: 'gboq-004', itemNo: '2.2', description: 'Plumbing & sanitation works', unit: 'LS', qty: '1', rate: '₹85,00,000', amount: '₹85,00,000', progress: 30, drawingRef: 'GG-MEP-002' },
    { id: 'gboq-005', itemNo: '3.1', description: 'External works & landscape', unit: 'm²', qty: '8,200', rate: '₹1,800', amount: '₹1,47,60,000', progress: 10, drawingRef: 'GG-CIVIL-002' },
    { id: 'gboq-006', itemNo: '4.1', description: 'Master layout civil works', unit: 'LS', qty: '1', rate: '₹3,20,00,000', amount: '₹3,20,00,000', progress: 65, drawingRef: 'GG-CIVIL-001' },
  ],
};

// ─── Building project data ─────────────────────────────────────────────────────
const buildingDrawingsMap: Record<string, typeof roadDrawings> = {
  'proj-bld-001': [
    { id: 'bdrw-001', ref: 'BLD-STR-001', title: 'Foundation & Pile Cap Structural Layout', discipline: 'Structural', rev: 'R2', takeoffDone: true, boqLinked: true, uploadedOn: '02 Apr 2024' },
    { id: 'bdrw-002', ref: 'BLD-ARCH-102', title: 'Ground Floor Column & Framing Plan', discipline: 'Architectural', rev: 'R1', takeoffDone: true, boqLinked: true, uploadedOn: '05 Apr 2024' },
    { id: 'bdrw-003', ref: 'BLD-MEP-005', title: 'HVAC & Electrical Ducting Plan', discipline: 'MEP', rev: 'R3', takeoffDone: false, boqLinked: false, uploadedOn: '10 Apr 2024' },
    { id: 'bdrw-004', ref: 'BLD-STR-002', title: 'Typical Floor Slab & Beam Layout', discipline: 'Structural', rev: 'R2', takeoffDone: true, boqLinked: true, uploadedOn: '12 Apr 2024' },
    { id: 'bdrw-005', ref: 'BLD-STR-003', title: 'Shear Wall & Core Wall Details', discipline: 'Structural', rev: 'R1', takeoffDone: true, boqLinked: true, uploadedOn: '14 Apr 2024' },
    { id: 'bdrw-006', ref: 'BLD-ARCH-201', title: 'Facade & Curtain Wall Elevation', discipline: 'Architectural', rev: 'R2', takeoffDone: true, boqLinked: true, uploadedOn: '16 Apr 2024' },
    { id: 'bdrw-007', ref: 'BLD-MEP-010', title: 'Plumbing & Sanitation Riser Diagram', discipline: 'MEP', rev: 'R1', takeoffDone: true, boqLinked: false, uploadedOn: '18 Apr 2024' },
    { id: 'bdrw-008', ref: 'BLD-CIVIL-001', title: 'Basement Retaining Wall & Waterproofing', discipline: 'Civil', rev: 'R2', takeoffDone: true, boqLinked: true, uploadedOn: '20 Apr 2024' },
    { id: 'bdrw-009', ref: 'BLD-ARCH-305', title: 'Staircase & Lift Core Details', discipline: 'Architectural', rev: 'R1', takeoffDone: true, boqLinked: true, uploadedOn: '22 Apr 2024' },
    { id: 'bdrw-010', ref: 'BLD-MEP-015', title: 'Fire Suppression & Sprinkler Layout', discipline: 'MEP', rev: 'R0', takeoffDone: true, boqLinked: false, uploadedOn: '24 Apr 2024' },
    { id: 'bdrw-011', ref: 'BLD-STR-004', title: 'Roof Slab & Parapet Wall Details', discipline: 'Structural', rev: 'R1', takeoffDone: false, boqLinked: false, uploadedOn: '26 Apr 2024' },
    { id: 'bdrw-012', ref: 'BLD-CIVIL-002', title: 'External Hardscape & Landscape Plan', discipline: 'Civil', rev: 'R0', takeoffDone: false, boqLinked: false, uploadedOn: '28 Apr 2024' },
  ],
  'proj-bld-002': [
    { id: 'bdrw-r001', ref: 'RK-STR-001', title: 'Foundation Layout — Block A', discipline: 'Structural', rev: 'R2', takeoffDone: true, boqLinked: true, uploadedOn: '10 Feb 2024' },
    { id: 'bdrw-r002', ref: 'RK-ARCH-001', title: 'Typical Floor Plan — Block A', discipline: 'Architectural', rev: 'R1', takeoffDone: true, boqLinked: true, uploadedOn: '12 Feb 2024' },
    { id: 'bdrw-r003', ref: 'RK-MEP-001', title: 'Electrical & Lighting Layout', discipline: 'MEP', rev: 'R1', takeoffDone: true, boqLinked: true, uploadedOn: '15 Feb 2024' },
    { id: 'bdrw-r004', ref: 'RK-CIVIL-001', title: 'Site Development Plan', discipline: 'Civil', rev: 'R1', takeoffDone: false, boqLinked: false, uploadedOn: '18 Feb 2024' },
  ],
  'proj-bld-003': [
    { id: 'bdrw-d001', ref: 'DW-STR-001', title: 'Basement & Foundation Plan', discipline: 'Structural', rev: 'R3', takeoffDone: true, boqLinked: true, uploadedOn: '01 Mar 2024' },
    { id: 'bdrw-d002', ref: 'DW-ARCH-001', title: 'Ground Floor Commercial Layout', discipline: 'Architectural', rev: 'R2', takeoffDone: true, boqLinked: true, uploadedOn: '05 Mar 2024' },
    { id: 'bdrw-d003', ref: 'DW-MEP-001', title: 'HVAC Schematic — All Floors', discipline: 'MEP', rev: 'R1', takeoffDone: false, boqLinked: false, uploadedOn: '08 Mar 2024' },
  ],
};

const buildingBoqMap: Record<string, typeof roadBoqItems> = {
  'proj-bld-001': [
    { id: 'bboq-001', itemNo: '1.1', description: 'Piling works — 600mm dia bored cast-in-situ piles', unit: 'Nos.', qty: '248', rate: '₹1,84,000', amount: '₹4,56,32,000', progress: 100, drawingRef: 'BLD-STR-001' },
    { id: 'bboq-002', itemNo: '1.2', description: 'Pile cap & raft foundation — RCC M35', unit: 'm³', qty: '3,840', rate: '₹9,600', amount: '₹3,68,64,000', progress: 100, drawingRef: 'BLD-STR-001' },
    { id: 'bboq-003', itemNo: '1.3', description: 'Basement retaining wall — RCC M35 with waterproofing', unit: 'm³', qty: '2,100', rate: '₹12,400', amount: '₹2,60,40,000', progress: 88, drawingRef: 'BLD-CIVIL-001' },
    { id: 'bboq-004', itemNo: '2.1', description: 'RCC columns & shear walls — M40 grade', unit: 'm³', qty: '4,620', rate: '₹11,800', amount: '₹5,45,16,000', progress: 72, drawingRef: 'BLD-STR-002' },
    { id: 'bboq-005', itemNo: '2.2', description: 'RCC flat slab — 250mm thick, M35', unit: 'm²', qty: '28,400', rate: '₹3,200', amount: '₹9,08,80,000', progress: 55, drawingRef: 'BLD-STR-002' },
    { id: 'bboq-006', itemNo: '2.3', description: 'Shear wall & core wall — RCC M40', unit: 'm³', qty: '1,840', rate: '₹13,200', amount: '₹2,42,88,000', progress: 60, drawingRef: 'BLD-STR-003' },
    { id: 'bboq-007', itemNo: '3.1', description: 'Curtain wall glazing system — unitised', unit: 'm²', qty: '6,200', rate: '₹8,400', amount: '₹5,20,80,000', progress: 20, drawingRef: 'BLD-ARCH-201' },
    { id: 'bboq-008', itemNo: '3.2', description: 'Staircase — RCC with MS railing', unit: 'Nos.', qty: '4', rate: '₹28,00,000', amount: '₹1,12,00,000', progress: 65, drawingRef: 'BLD-ARCH-305' },
    { id: 'bboq-009', itemNo: '4.1', description: 'HVAC — Chiller plant, AHU & ducting', unit: 'LS', qty: '1', rate: '₹3,80,00,000', amount: '₹3,80,00,000', progress: 15, drawingRef: 'BLD-MEP-005' },
    { id: 'bboq-010', itemNo: '4.2', description: 'Electrical HT/LT, UPS & DG set', unit: 'LS', qty: '1', rate: '₹2,40,00,000', amount: '₹2,40,00,000', progress: 30, drawingRef: 'BLD-MEP-005' },
    { id: 'bboq-011', itemNo: '4.3', description: 'Plumbing, sanitation & drainage', unit: 'LS', qty: '1', rate: '₹1,20,00,000', amount: '₹1,20,00,000', progress: 25, drawingRef: 'BLD-MEP-010' },
    { id: 'bboq-012', itemNo: '4.4', description: 'Fire suppression & sprinkler system', unit: 'LS', qty: '1', rate: '₹68,00,000', amount: '₹68,00,000', progress: 10, drawingRef: 'BLD-MEP-015' },
    { id: 'bboq-013', itemNo: '5.1', description: 'External hardscape, paving & landscape', unit: 'm²', qty: '4,800', rate: '₹2,200', amount: '₹1,05,60,000', progress: 0, drawingRef: 'BLD-CIVIL-002' },
    { id: 'bboq-014', itemNo: '5.2', description: 'Roof slab & parapet wall finishing', unit: 'm²', qty: '3,200', rate: '₹1,800', amount: '₹57,60,000', progress: 0, drawingRef: 'BLD-STR-004' },
  ],
  'proj-bld-002': [
    { id: 'bboq-r001', itemNo: '1.1', description: 'Foundation & plinth works', unit: 'm³', qty: '2,400', rate: '₹8,800', amount: '₹2,11,20,000', progress: 100, drawingRef: 'RK-STR-001' },
    { id: 'bboq-r002', itemNo: '2.1', description: 'RCC framed structure — all floors', unit: 'm³', qty: '5,800', rate: '₹10,500', amount: '₹6,09,00,000', progress: 62, drawingRef: 'RK-ARCH-001' },
    { id: 'bboq-r003', itemNo: '3.1', description: 'Electrical & lighting installation', unit: 'LS', qty: '1', rate: '₹1,40,00,000', amount: '₹1,40,00,000', progress: 40, drawingRef: 'RK-MEP-001' },
  ],
  'proj-bld-003': [
    { id: 'bboq-d001', itemNo: '1.1', description: 'Basement & foundation — RCC M35', unit: 'm³', qty: '4,200', rate: '₹10,200', amount: '₹4,28,40,000', progress: 100, drawingRef: 'DW-STR-001' },
    { id: 'bboq-d002', itemNo: '2.1', description: 'Commercial floor structure & finishes', unit: 'm²', qty: '12,400', rate: '₹4,800', amount: '₹5,95,20,000', progress: 35, drawingRef: 'DW-ARCH-001' },
    { id: 'bboq-d003', itemNo: '3.1', description: 'HVAC & MEP works', unit: 'LS', qty: '1', rate: '₹2,80,00,000', amount: '₹2,80,00,000', progress: 10, drawingRef: 'DW-MEP-001' },
  ],
};

// ─── BOQ summary values ────────────────────────────────────────────────────────
const boqSummaryMap: Record<string, { total: string; spent: string }> = {
  'proj-001': { total: '₹18,74,82,500', spent: '₹4,79,00,000' },
  'proj-002': { total: '₹26,13,75,500', spent: '₹9,14,00,000' },
  'proj-003': { total: '₹14,82,00,000', spent: '₹7,82,00,000' },
  'proj-006': { total: '₹5,27,50,000', spent: '₹4,80,00,000' },
  'proj-008': { total: '₹20,94,40,000', spent: '₹12,29,00,000' },
  'proj-bld-001': { total: '₹42,80,00,000', spent: '₹18,64,00,000' },
  'proj-bld-002': { total: '₹12,60,00,000', spent: '₹7,32,00,000' },
  'proj-bld-003': { total: '₹8,90,00,000', spent: '₹2,80,00,000' },
};

// ─── Steps config ──────────────────────────────────────────────────────────────
type StepId = 'drawings' | 'takeoff' | 'boq';

// ─── Sub-components ───────────────────────────────────────────────────────────
function DrawingsPanel({ drawings }: { drawings: typeof roadDrawings }) {
  const [search, setSearch] = useState('');
  const filtered = drawings.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.ref.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="card-elevated">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h3 className="text-sm font-600 text-foreground">Drawing Register</h3>
          <p className="text-xs text-muted-foreground">{drawings.length} drawings · {drawings.filter(d => d.takeoffDone).length} takeoff complete</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search drawings..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input pl-8 py-1.5 text-xs w-44"
            />
          </div>
          <button className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5">
            <Upload size={12} /> Upload
          </button>
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-border">
              {['Drawing Ref', 'Title', 'Discipline', 'Rev', 'Takeoff', 'BOQ Linked', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-500 uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors group">
                <td className="px-4 py-3 text-xs chainage-mono text-primary font-500">{d.ref}</td>
                <td className="px-4 py-3 text-sm text-foreground max-w-[220px] truncate">{d.title}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-md font-500 ${
                    d.discipline === 'Road' ? 'bg-info/10 text-info' :
                    d.discipline === 'Bridge' ? 'bg-primary/10 text-primary' :
                    d.discipline === 'Structural' ? 'bg-primary/10 text-primary' :
                    d.discipline === 'Architectural' ? 'bg-purple-500/10 text-purple-500' :
                    d.discipline === 'MEP' ? 'bg-warning/10 text-warning' :
                    d.discipline === 'Civil' ? 'bg-info/10 text-info' : 'bg-muted text-muted-foreground'
                  }`}>{d.discipline}</span>
                </td>
                <td className="px-4 py-3 text-xs chainage-mono text-muted-foreground">{d.rev}</td>
                <td className="px-4 py-3">
                  {d.takeoffDone
                    ? <span className="flex items-center gap-1 text-xs text-accent"><CheckCircle2 size={13} />Done</span>
                    : <span className="flex items-center gap-1 text-xs text-warning"><AlertCircle size={13} />In Progress</span>}
                </td>
                <td className="px-4 py-3">
                  {d.boqLinked
                    ? <span className="flex items-center gap-1 text-xs text-accent"><CheckCircle2 size={13} />Linked</span>
                    : <span className="text-xs text-muted-foreground">Pending</span>}
                </td>
                <td className="px-4 py-3">
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted">
                    <Eye size={13} className="text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BOQPanel({ boqItems, summary }: { boqItems: typeof roadBoqItems; summary: { total: string; spent: string } }) {
  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total BOQ Value', value: summary.total, icon: <IndianRupee size={16} />, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Executed to Date', value: summary.spent, icon: <BarChart3 size={16} />, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'BOQ Items', value: `${boqItems.length} items`, icon: <Package size={16} />, color: 'text-info', bg: 'bg-info/10' },
        ].map(c => (
          <div key={c.label} className="card-elevated p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${c.bg} ${c.color}`}>{c.icon}</div>
            <div>
              <div className="text-xs text-muted-foreground">{c.label}</div>
              <div className={`text-lg font-700 font-tabular inr-value ${c.color}`}>{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* BOQ table */}
      <div className="card-elevated">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-600 text-foreground">Bill of Quantities</h3>
          <button className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5"><Plus size={12} /> Add Item</button>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-border">
                {['Item No.', 'Description', 'Unit', 'Qty', 'Rate', 'Amount', 'Progress', 'Drawing'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-500 uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {boqItems.map((item) => (
                <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-xs chainage-mono text-muted-foreground">{item.itemNo}</td>
                  <td className="px-4 py-3 text-sm text-foreground max-w-[240px]">{item.description}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{item.unit}</td>
                  <td className="px-4 py-3 text-xs font-tabular text-foreground">{item.qty}</td>
                  <td className="px-4 py-3 text-xs font-tabular text-foreground inr-value">{item.rate}</td>
                  <td className="px-4 py-3 text-xs font-tabular font-600 text-foreground inr-value">{item.amount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.progress === 100 ? 'bg-accent' : item.progress > 0 ? 'bg-primary' : 'bg-muted-foreground/20'}`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-tabular text-foreground">{item.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs chainage-mono text-primary/70">{item.drawingRef}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BOQWorkflowPage() {
  const [activeStep, setActiveStep] = useState<StepId>('drawings');
  const { selectedProject } = useProject();

  const selectedProjectId = selectedProject.id;
  const isIndustrial = selectedProject.type === 'Industrial';
  const isBuilding = selectedProject.type === 'Building';

  // Resolve drawings & BOQ for selected project
  const currentDrawings = isBuilding
    ? (buildingDrawingsMap[selectedProjectId] ?? [])
    : isIndustrial
      ? (industrialDrawingsMap[selectedProjectId] ?? [])
      : roadDrawings;

  const currentBoqItems = isBuilding
    ? (buildingBoqMap[selectedProjectId] ?? [])
    : isIndustrial
      ? (industrialBoqMap[selectedProjectId] ?? [])
      : roadBoqItems;

  const currentSummary = boqSummaryMap[selectedProjectId] ?? { total: '—', spent: '—' };

  const takeoffDone = currentDrawings.filter(d => d.takeoffDone).length;
  const boqApproved = currentBoqItems.length;

  // Building-specific workflow counts
  const drawingUploadCount = isBuilding ? 12 : currentDrawings.length;
  const takeoffTotal = isBuilding ? 12 : currentDrawings.length;
  const takeoffComplete = isBuilding ? 10 : takeoffDone;
  const boqApprovedCount = isBuilding ? 14 : boqApproved;

  const steps: { id: StepId; label: string; icon: React.ReactNode; count: string; status: 'done' | 'active' | 'pending' }[] = [
    { id: 'drawings', label: 'Drawing Upload', icon: <FileText size={18} />, count: `${drawingUploadCount} drawings`, status: 'done' },
    { id: 'takeoff', label: 'Quantity Takeoff', icon: <Layers size={18} />, count: `${takeoffComplete} of ${takeoffTotal} done`, status: 'active' },
    { id: 'boq', label: 'BOQ Generation', icon: <ClipboardList size={18} />, count: `${boqApprovedCount} items approved`, status: 'active' },
  ];

  const projectTypeColor = isBuilding
    ? 'bg-purple-500/10 text-purple-500'
    : isIndustrial
      ? 'bg-accent/10 text-accent' :'bg-primary/10 text-primary';

  return (
    <AppLayout currentPath="/boq-workflow">
      <Topbar
        title="Drawing → Takeoff → BOQ"
        subtitle={`${selectedProject.name} · ${selectedProject.code}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/pdf-takeoff" className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
              <Ruler size={13} /> PDF Takeoff Tool
            </Link>
            <Link href="/project-detail" className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
              <ArrowLeft size={13} /> Project
            </Link>
          </div>
        }
      />

      <div className="px-6 xl:px-8 py-6 max-w-screen-2xl mx-auto space-y-6">

        {/* Active project info strip */}
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-0.5 rounded-md font-500 ${projectTypeColor}`}>
              {selectedProject.type}
            </span>
            <span className="text-sm font-600 text-foreground">{selectedProject.name}</span>
            <span className="text-xs text-muted-foreground chainage-mono hidden sm:inline">· {selectedProject.code}</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">· {selectedProject.subtitle}</span>
            {isBuilding && (
              <span className="text-xs text-muted-foreground hidden sm:inline">· Client: DLF Infrastructure</span>
            )}
            <span className="ml-auto text-2xs text-muted-foreground">Use the project selector in the top bar to switch projects</span>
          </div>
        </div>

        {/* Workflow pipeline */}
        <div className="card-elevated p-5">
          <div className="flex items-center gap-0">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setActiveStep(step.id)}
                  className={`flex-1 flex flex-col items-center gap-2 py-3 px-4 rounded-xl transition-all ${
                    activeStep === step.id
                      ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    step.status === 'done' ? 'bg-accent/10 text-accent' :
                    step.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.icon}
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-600 ${activeStep === step.id ? 'text-primary' : 'text-foreground'}`}>{step.label}</div>
                    <div className="text-xs text-muted-foreground">{step.count}</div>
                  </div>
                  <span className={`text-2xs px-2 py-0.5 rounded-full font-500 ${
                    step.status === 'done' ? 'bg-accent/10 text-accent' :
                    step.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.status === 'done' ? '✓ Complete' : step.status === 'active' ? 'In Progress' : 'Pending'}
                  </span>
                </button>
                {idx < steps.length - 1 && (
                  <ChevronRight size={18} className="text-muted-foreground/40 flex-shrink-0 mx-1" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step content */}
        {(activeStep === 'drawings' || activeStep === 'takeoff') && <DrawingsPanel drawings={currentDrawings} />}
        {activeStep === 'boq' && <BOQPanel boqItems={currentBoqItems} summary={currentSummary} />}

        {/* Principle footer */}
        <div className="flex items-center justify-center py-2">
          <p className="text-xs text-muted-foreground/60 text-center">
            KARTAA OS — Assisted verification, never automated certification
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
