'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import Link from 'next/link';
import { ArrowLeft, Camera, CheckCircle2, AlertCircle, Clock, ShieldCheck, Search, Upload, Eye, MapPin, Calendar, User, Tag, XCircle, AlertTriangle, BarChart3 } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';

// ─── Demo data ────────────────────────────────────────────────────────────────
type EvidenceStatus = 'verified' | 'pending' | 'rejected' | 'flagged';

interface PhotoEvidence {
  id: string;
  chainage: string;
  activity: string;
  layer: string;
  capturedBy: string;
  capturedOn: string;
  status: EvidenceStatus;
  kartaaNote: string;
  gpsTag: string;
  photoCount: number;
  boqItem: string;
}

const evidenceItems: PhotoEvidence[] = [
  { id: 'ev-001', chainage: '56+200', activity: 'WMM Compaction', layer: 'WMM Layer', capturedBy: 'S. Pillai', capturedOn: '23 Aug 2026', status: 'verified', kartaaNote: 'Compaction density confirmed. Roller passes visible.', gpsTag: '28.4595°N, 77.0266°E', photoCount: 6, boqItem: '1.3' },
  { id: 'ev-002', chainage: '54+800', activity: 'WMM Spreading', layer: 'WMM Layer', capturedBy: 'S. Pillai', capturedOn: '22 Aug 2026', status: 'verified', kartaaNote: 'Layer thickness within tolerance. Edge profile acceptable.', gpsTag: '28.4601°N, 77.0271°E', photoCount: 4, boqItem: '1.3' },
  { id: 'ev-003', chainage: '59+500', activity: 'DBM Layer 1', layer: 'DBM Layer', capturedBy: 'A. Sharma', capturedOn: '21 Aug 2026', status: 'pending', kartaaNote: 'Awaiting PM review. Temperature records not attached.', gpsTag: '28.4612°N, 77.0289°E', photoCount: 3, boqItem: '1.4' },
  { id: 'ev-004', chainage: '61+000', activity: 'DBM Compaction', layer: 'DBM Layer', capturedBy: 'A. Sharma', capturedOn: '20 Aug 2026', status: 'pending', kartaaNote: 'Photo quality acceptable. Density test report pending.', gpsTag: '28.4628°N, 77.0301°E', photoCount: 5, boqItem: '1.4' },
  { id: 'ev-005', chainage: '48+500', activity: 'GSB Compaction', layer: 'Sub-base (GSB)', capturedBy: 'S. Pillai', capturedOn: '15 Jul 2026', status: 'verified', kartaaNote: 'All test reports attached. Density ≥ 98% MDD confirmed.', gpsTag: '28.4541°N, 77.0218°E', photoCount: 8, boqItem: '1.2' },
  { id: 'ev-006', chainage: '62+400', activity: 'DBM Layer 2', layer: 'DBM Layer', capturedBy: 'A. Sharma', capturedOn: '19 Aug 2026', status: 'flagged', kartaaNote: 'GPS coordinates mismatch with reported chainage. Requires re-verification.', gpsTag: '28.4635°N, 77.0315°E', photoCount: 2, boqItem: '1.4' },
  { id: 'ev-007', chainage: '42+000', activity: 'Sub-grade Preparation', layer: 'Sub-grade', capturedBy: 'R. Kumar', capturedOn: '20 Mar 2024', status: 'verified', kartaaNote: 'Baseline documentation complete.', gpsTag: '28.4489°N, 77.0182°E', photoCount: 12, boqItem: '1.1' },
  { id: 'ev-008', chainage: '63+800', activity: 'DBM Paving', layer: 'DBM Layer', capturedBy: 'A. Sharma', capturedOn: '18 Aug 2026', status: 'rejected', kartaaNote: 'Insufficient photo coverage. Only 1 photo for 1,200m² area. Resubmit.', gpsTag: '28.4649°N, 77.0328°E', photoCount: 1, boqItem: '1.4' },
];

const statusConfig: Record<EvidenceStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  verified: { label: 'Verified', color: 'text-accent', bg: 'bg-accent/10 border-accent/20', icon: <CheckCircle2 size={13} /> },
  pending: { label: 'Pending', color: 'text-warning', bg: 'bg-warning/10 border-warning/20', icon: <Clock size={13} /> },
  flagged: { label: 'Flagged', color: 'text-danger', bg: 'bg-danger/10 border-danger/20', icon: <AlertTriangle size={13} /> },
  rejected: { label: 'Rejected', color: 'text-danger', bg: 'bg-danger/10 border-danger/20', icon: <XCircle size={13} /> },
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SiteVerificationPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<EvidenceStatus | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<PhotoEvidence | null>(null);
  const { selectedProject } = useProject();

  const filtered = evidenceItems.filter(e => {
    const matchSearch = e.chainage.includes(search) || e.activity.toLowerCase().includes(search.toLowerCase()) || e.layer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: evidenceItems.length,
    verified: evidenceItems.filter(e => e.status === 'verified').length,
    pending: evidenceItems.filter(e => e.status === 'pending').length,
    flagged: evidenceItems.filter(e => e.status === 'flagged').length,
    rejected: evidenceItems.filter(e => e.status === 'rejected').length,
  };

  return (
    <AppLayout currentPath="/site-verification">
      <Topbar
        title="Site Photo Evidence"
        subtitle={`${selectedProject.name} · Assisted verification, never automated certification`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/project-detail" className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
              <ArrowLeft size={13} /> Project
            </Link>
            <button className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5">
              <Upload size={12} /> Upload Evidence
            </button>
          </div>
        }
      />

      <div className="px-6 xl:px-8 py-6 max-w-screen-2xl mx-auto space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Evidence', value: counts.all, icon: <Camera size={16} />, color: 'text-foreground', bg: 'bg-muted' },
            { label: 'Verified', value: counts.verified, icon: <CheckCircle2 size={16} />, color: 'text-accent', bg: 'bg-accent/10' },
            { label: 'Pending Review', value: counts.pending, icon: <Clock size={16} />, color: 'text-warning', bg: 'bg-warning/10' },
            { label: 'Flagged / Rejected', value: counts.flagged + counts.rejected, icon: <AlertCircle size={16} />, color: 'text-danger', bg: 'bg-danger/10' },
          ].map(s => (
            <div key={s.label} className="card-elevated p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.bg} ${s.color}`}>{s.icon}</div>
              <div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className={`text-2xl font-700 font-tabular ${s.color}`}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* KARTAA principle banner */}
        <div className="card-elevated px-5 py-3 flex items-center gap-3 border-l-2 border-primary">
          <ShieldCheck size={16} className="text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground font-500">KARTAA Verification Principle: </span>
            Every progress claim must be supported by geo-tagged photo evidence, matched to a BOQ item, and reviewed by a qualified engineer.
            KARTAA assists verification — it does not certify automatically.
          </p>
        </div>

        <div className="flex gap-6">
          {/* Evidence list */}
          <div className="flex-1 min-w-0">
            <div className="card-elevated">
              {/* Filters */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  {(['all', 'verified', 'pending', 'flagged', 'rejected'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`px-3 py-1 rounded-full text-xs font-500 transition-colors ${
                        filterStatus === s
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search chainage, activity..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="form-input pl-8 py-1.5 text-xs w-52"
                  />
                </div>
              </div>

              {/* Evidence cards */}
              <div className="divide-y divide-border/50">
                {filtered.map(item => {
                  const cfg = statusConfig[item.status];
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(isSelected ? null : item)}
                      className={`px-5 py-4 cursor-pointer transition-colors hover:bg-muted/30 ${isSelected ? 'bg-primary/5 border-l-2 border-primary' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-600 text-foreground">{item.activity}</span>
                            <span className={`flex items-center gap-1 text-xs font-500 px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                              {cfg.icon}{cfg.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin size={11} /><span className="chainage-mono">{item.chainage}</span></span>
                            <span className="flex items-center gap-1"><Tag size={11} />{item.layer}</span>
                            <span className="flex items-center gap-1"><User size={11} />{item.capturedBy}</span>
                            <span className="flex items-center gap-1"><Calendar size={11} />{item.capturedOn}</span>
                            <span className="flex items-center gap-1"><Camera size={11} />{item.photoCount} photos</span>
                            <span className="text-muted-foreground/60">BOQ {item.boqItem}</span>
                          </div>
                          {isSelected && (
                            <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border">
                              <p className="text-xs text-muted-foreground mb-1 font-500">KARTAA Note:</p>
                              <p className="text-xs text-foreground">{item.kartaaNote}</p>
                              <p className="text-2xs text-muted-foreground/60 mt-2 chainage-mono">GPS: {item.gpsTag}</p>
                              <div className="flex items-center gap-2 mt-3">
                                {item.status === 'pending' && (
                                  <>
                                    <button className="btn-primary py-1 px-3 text-xs flex items-center gap-1"><CheckCircle2 size={11} />Verify</button>
                                    <button className="btn-secondary py-1 px-3 text-xs flex items-center gap-1 text-danger border-danger/30"><XCircle size={11} />Reject</button>
                                  </>
                                )}
                                <button className="btn-secondary py-1 px-3 text-xs flex items-center gap-1"><Eye size={11} />View Photos</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="px-5 py-12 text-center text-muted-foreground text-sm">No evidence records match your filter.</div>
                )}
              </div>
            </div>
          </div>

          {/* Intelligence sidebar */}
          <div className="w-72 flex-shrink-0 space-y-4">
            <div className="card-elevated p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={14} className="text-primary" />
                <h3 className="text-sm font-600 text-foreground">Progress Intelligence</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Evidence Coverage', value: '78%', note: 'of BOQ items have photo evidence', color: 'text-primary' },
                  { label: 'Verification Rate', value: '62.5%', note: '5 of 8 submitted entries verified', color: 'text-accent' },
                  { label: 'GPS Match Rate', value: '87.5%', note: '1 chainage mismatch flagged', color: 'text-warning' },
                ].map(m => (
                  <div key={m.label} className="pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-muted-foreground">{m.label}</span>
                      <span className={`text-sm font-700 font-tabular ${m.color}`}>{m.value}</span>
                    </div>
                    <p className="text-2xs text-muted-foreground/70">{m.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-elevated p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} className="text-warning" />
                <h3 className="text-sm font-600 text-foreground">Pending Actions</h3>
              </div>
              <div className="space-y-2">
                {[
                  { text: '2 entries awaiting PM verification', urgency: 'warning' },
                  { text: '1 GPS mismatch requires field re-check', urgency: 'danger' },
                  { text: '1 rejected entry needs resubmission', urgency: 'danger' },
                  { text: 'Temperature records missing for DBM entries', urgency: 'warning' },
                ].map((a, i) => (
                  <div key={i} className={`flex items-start gap-2 text-xs p-2 rounded-lg ${a.urgency === 'danger' ? 'bg-danger/8 text-danger' : 'bg-warning/8 text-warning'}`}>
                    <AlertCircle size={11} className="flex-shrink-0 mt-0.5" />
                    {a.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="card-elevated p-4 text-center">
              <p className="text-2xs text-muted-foreground/60 leading-relaxed">
                Assisted verification,<br />never automated certification
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
