'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';

import { Camera, Upload, CheckCircle2, Clock, AlertCircle, XCircle, Plus, Filter, Download, FileText, Eye, Calendar, User, ShieldCheck, TrendingUp, Image, MapPin } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';

// ─── Types ────────────────────────────────────────────────────────────────────
type EvidenceStatus = 'verified' | 'pending' | 'flagged' | 'rejected';

interface PhotoEvidence {
  id: string;
  zone: string;
  activity: string;
  description: string;
  takenBy: string;
  takenAt: string;
  geoTag: string;
  status: EvidenceStatus;
  kartaaScore: number;
  tags: string[];
  photoCount: number;
}

interface DPREntry {
  id: string;
  date: string;
  zone: string;
  activity: string;
  plannedQty: string;
  achievedQty: string;
  unit: string;
  workforce: number;
  equipment: string;
  remarks: string;
  evidenceCount: number;
  status: EvidenceStatus;
  engineer: string;
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const dprEntries: DPREntry[] = [
  { id: 'dpr-001', date: '23 Aug 2026', zone: 'Zone A', activity: 'Structural Steel Erection', plannedQty: '45 MT', achievedQty: '38 MT', unit: 'MT', workforce: 24, equipment: 'Crane 50T, Welding Sets ×6', remarks: 'Delayed due to wind speed >35 km/h post 14:00', evidenceCount: 8, status: 'verified', engineer: 'P. Nair' },
  { id: 'dpr-002', date: '23 Aug 2026', zone: 'Zone A', activity: 'Electrical Cable Laying', plannedQty: '320 m', achievedQty: '290 m', unit: 'm', workforce: 12, equipment: 'Cable Drum Trailer, Puller', remarks: 'Completed HT cable run in Sector A2', evidenceCount: 5, status: 'pending', engineer: 'A. Patel' },
  { id: 'dpr-003', date: '23 Aug 2026', zone: 'Zone B', activity: 'Structural Steel Erection', plannedQty: '60 MT', achievedQty: '55 MT', unit: 'MT', workforce: 28, equipment: 'Crane 80T, Welding Sets ×8', remarks: 'Column grid B3–B7 completed', evidenceCount: 11, status: 'verified', engineer: 'P. Nair' },
  { id: 'dpr-004', date: '22 Aug 2026', zone: 'Zone C', activity: 'RCC Foundation', plannedQty: '180 m³', achievedQty: '165 m³', unit: 'm³', workforce: 35, equipment: 'Transit Mixer ×3, Vibrator ×4', remarks: 'Footing F-12 to F-18 poured', evidenceCount: 7, status: 'flagged', engineer: 'S. Verma' },
  { id: 'dpr-005', date: '22 Aug 2026', zone: 'Zone D', activity: 'RCC Foundation', plannedQty: '120 m³', achievedQty: '80 m³', unit: 'm³', workforce: 22, equipment: 'Transit Mixer ×2, Vibrator ×3', remarks: 'Stopped — soil bearing capacity test pending', evidenceCount: 3, status: 'flagged', engineer: 'M. Rao' },
  { id: 'dpr-006', date: '21 Aug 2026', zone: 'Zone A', activity: 'Mechanical Equipment Installation', plannedQty: '4 units', achievedQty: '3 units', unit: 'units', workforce: 18, equipment: 'Forklift 5T, Chain Pulley', remarks: 'Pump sets P-1, P-2, P-3 installed and aligned', evidenceCount: 9, status: 'verified', engineer: 'K. Singh' },
];

const photoEvidence: PhotoEvidence[] = [
  { id: 'pe-001', zone: 'Zone A', activity: 'Structural Steel Erection', description: 'Column grid A1–A5 erection complete with weld inspection marks', takenBy: 'P. Nair', takenAt: '23 Aug, 11:30', geoTag: '22.2587° N, 84.8531° E', status: 'verified', kartaaScore: 91, tags: ['Structural', 'Weld', 'Column'], photoCount: 8 },
  { id: 'pe-002', zone: 'Zone A', activity: 'Electrical Cable Laying', description: 'HT cable tray installation in Sector A2 — cable drum unrolling', takenBy: 'A. Patel', takenAt: '23 Aug, 14:15', geoTag: '22.2591° N, 84.8535° E', status: 'pending', kartaaScore: 68, tags: ['Electrical', 'HT Cable', 'Tray'], photoCount: 5 },
  { id: 'pe-003', zone: 'Zone B', activity: 'Structural Steel Erection', description: 'Roof truss installation B3–B7 with safety harness compliance visible', takenBy: 'P. Nair', takenAt: '23 Aug, 09:45', geoTag: '22.2595° N, 84.8540° E', status: 'verified', kartaaScore: 94, tags: ['Structural', 'Roof Truss', 'Safety'], photoCount: 11 },
  { id: 'pe-004', zone: 'Zone C', activity: 'RCC Foundation', description: 'Footing F-14 reinforcement cage before pour — bar spacing non-conformance flagged', takenBy: 'S. Verma', takenAt: '22 Aug, 16:00', geoTag: '22.2580° N, 84.8525° E', status: 'flagged', kartaaScore: 52, tags: ['Foundation', 'Rebar', 'Non-conformance'], photoCount: 7 },
  { id: 'pe-005', zone: 'Zone D', activity: 'RCC Foundation', description: 'Soil investigation test in progress — work halted pending results', takenBy: 'M. Rao', takenAt: '22 Aug, 10:30', geoTag: '22.2575° N, 84.8520° E', status: 'flagged', kartaaScore: 44, tags: ['Foundation', 'Soil Test', 'Blocked'], photoCount: 3 },
  { id: 'pe-006', zone: 'Zone A', activity: 'Mechanical Equipment Installation', description: 'Pump set P-3 alignment check with dial gauge — within tolerance', takenBy: 'K. Singh', takenAt: '21 Aug, 15:45', geoTag: '22.2589° N, 84.8533° E', status: 'verified', kartaaScore: 88, tags: ['Mechanical', 'Pump', 'Alignment'], photoCount: 9 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function evidenceCfg(status: EvidenceStatus) {
  switch (status) {
    case 'verified': return { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30', label: 'Verified', icon: <CheckCircle2 size={12} /> };
    case 'pending': return { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30', label: 'Pending', icon: <Clock size={12} /> };
    case 'flagged': return { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/30', label: 'Flagged', icon: <AlertCircle size={12} /> };
    case 'rejected': return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border', label: 'Rejected', icon: <XCircle size={12} /> };
  }
}

function scoreColor(score: number) {
  if (score >= 85) return 'text-success';
  if (score >= 70) return 'text-accent';
  if (score >= 55) return 'text-warning';
  return 'text-danger';
}

type TabId = 'dpr' | 'evidence';

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function IndustrialDPRPage() {
  const [activeTab, setActiveTab] = useState<TabId>('dpr');
  const [filterStatus, setFilterStatus] = useState<EvidenceStatus | 'all'>('all');
  const { selectedProject } = useProject();

  const filteredEvidence = filterStatus === 'all'
    ? photoEvidence
    : photoEvidence.filter(e => e.status === filterStatus);

  const kpis = [
    { label: "Today\'s DPR Entries", value: '3', sub: 'Zone A, B, C logged', icon: <FileText size={16} />, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Photo Evidence', value: `${photoEvidence.length}`, sub: '3 verified · 2 flagged', icon: <Camera size={16} />, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Verification Rate', value: '58%', sub: '3 of 6 entries verified', icon: <ShieldCheck size={16} />, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Avg Evidence Score', value: '73', sub: 'KARTAA photo quality', icon: <TrendingUp size={16} />, color: 'text-warning', bg: 'bg-warning/10' },
  ];

  return (
    <AppLayout currentPath="/industrial-dpr">
      <Topbar
        title="Industrial DPR"
        subtitle={`Daily Progress Report with Photo Evidence — ${selectedProject.name}`}
      />
      <div className="px-6 xl:px-8 2xl:px-10 py-6 max-w-screen-2xl mx-auto space-y-6">

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(k => (
            <div key={k.label} className="card-elevated p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${k.bg}`}>
                  <span className={k.color}>{k.icon}</span>
                </div>
                <span className="text-xs text-muted-foreground">{k.label}</span>
              </div>
              <div className={`text-xl font-700 ${k.color}`}>{k.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* KARTAA principle banner */}
        <div className="card-elevated p-4 border-l-4 border-accent bg-accent/5">
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="text-accent flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-600 text-foreground">KARTAA Photo Evidence Principle</div>
              <div className="text-xs text-muted-foreground mt-1">
                Every DPR entry must be backed by geo-tagged, timestamped photo evidence. KARTAA scores reflect evidence quality, quantity, and verification status — not just quantity reported.
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {([
            { id: 'dpr', label: 'DPR Entries', icon: <FileText size={14} /> },
            { id: 'evidence', label: 'Photo Evidence', icon: <Camera size={14} /> },
          ] as { id: TabId; label: string; icon: React.ReactNode }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-500 border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
          <div className="ml-auto flex gap-2 pb-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:border-primary/40 transition-colors">
              <Download size={13} /> Export DPR
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-500 hover:bg-primary/90 transition-colors">
              <Plus size={13} /> New Entry
            </button>
          </div>
        </div>

        {/* DPR Entries Tab */}
        {activeTab === 'dpr' && (
          <div className="card-elevated overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-600 text-foreground">Daily Progress Entries</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{dprEntries.length} entries · Last 3 days</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 text-muted-foreground font-600">Date</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-600">Zone / Activity</th>
                    <th className="text-right px-4 py-3 text-muted-foreground font-600">Planned</th>
                    <th className="text-right px-4 py-3 text-muted-foreground font-600">Achieved</th>
                    <th className="text-right px-4 py-3 text-muted-foreground font-600">Workforce</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-600">Evidence</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-600">Status</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-600">Engineer</th>
                  </tr>
                </thead>
                <tbody>
                  {dprEntries.map((entry, i) => {
                    const cfg = evidenceCfg(entry.status);
                    const achievedNum = parseFloat(entry.achievedQty);
                    const plannedNum = parseFloat(entry.plannedQty);
                    const pct = plannedNum > 0 ? Math.min(100, Math.round((achievedNum / plannedNum) * 100)) : 0;
                    return (
                      <tr key={entry.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{entry.date}</td>
                        <td className="px-4 py-3">
                          <div className="font-500 text-foreground">{entry.zone}</div>
                          <div className="text-muted-foreground mt-0.5">{entry.activity}</div>
                        </td>
                        <td className="px-4 py-3 text-right font-500 text-foreground">{entry.plannedQty}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="font-600 text-foreground">{entry.achievedQty}</div>
                          <div className={`text-2xs font-500 ${pct >= 90 ? 'text-success' : pct >= 70 ? 'text-warning' : 'text-danger'}`}>{pct}%</div>
                        </td>
                        <td className="px-4 py-3 text-right text-foreground">{entry.workforce}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Camera size={12} className="text-muted-foreground" />
                            <span className="font-600 text-foreground">{entry.evidenceCount}</span>
                            <span className="text-muted-foreground">photos</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-500 border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                            {cfg.icon} {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{entry.engineer}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Photo Evidence Tab */}
        {activeTab === 'evidence' && (
          <div className="space-y-4">
            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-2">
              {(['all', 'verified', 'pending', 'flagged', 'rejected'] as const).map(s => {
                const cfg = s === 'all' ? null : evidenceCfg(s);
                return (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-500 border transition-all ${
                      filterStatus === s
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {cfg?.icon}
                    {s === 'all' ? 'All Evidence' : cfg?.label}
                    <span className="ml-1 opacity-70">
                      {s === 'all' ? photoEvidence.length : photoEvidence.filter(e => e.status === s).length}
                    </span>
                  </button>
                );
              })}
              <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-500 hover:bg-accent/90 transition-colors">
                <Upload size={13} /> Upload Evidence
              </button>
            </div>

            {/* Evidence cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredEvidence.map(ev => {
                const cfg = evidenceCfg(ev.status);
                return (
                  <div key={ev.id} className="card-elevated overflow-hidden">
                    {/* Photo placeholder */}
                    <div className="h-40 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                        <Image size={32} />
                        <span className="text-xs">{ev.photoCount} photos</span>
                      </div>
                      <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-2xs font-500 border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        {cfg.icon} {cfg.label}
                      </div>
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded text-2xs">
                        <MapPin size={10} /> {ev.geoTag}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="text-xs font-600 text-foreground">{ev.zone} · {ev.activity}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{ev.description}</div>
                        </div>
                        <div className={`text-lg font-700 flex-shrink-0 ${scoreColor(ev.kartaaScore)}`}>{ev.kartaaScore}</div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {ev.tags.map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 rounded text-2xs bg-muted text-muted-foreground">{tag}</span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-2xs text-muted-foreground border-t border-border pt-3">
                        <div className="flex items-center gap-1">
                          <User size={11} /> {ev.takenBy}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={11} /> {ev.takenAt}
                        </div>
                        <button className="flex items-center gap-1 text-primary hover:underline">
                          <Eye size={11} /> View
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
