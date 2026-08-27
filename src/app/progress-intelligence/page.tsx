'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import { TrendingDown, ShieldCheck, AlertTriangle, Activity, Zap, BarChart3, Target, Clock, CheckCircle2, XCircle, Minus, ChevronRight, Info, ArrowUpRight, ArrowDownRight, Train  } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,  } from 'recharts';
import { useProject } from '@/contexts/ProjectContext';

// ─── Types ────────────────────────────────────────────────────────────────────
type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'clear';
type AnomalyType = 'score_drop' | 'stall' | 'evidence_gap' | 'boq_mismatch' | 'schedule_slip';

// ─── Demo Data ────────────────────────────────────────────────────────────────
const verificationTrendData = [
  { week: 'W1 Jun', nh48: 74, nh19: 68, dl_exp: 81, avg: 74 },
  { week: 'W2 Jun', nh48: 76, nh19: 70, dl_exp: 83, avg: 76 },
  { week: 'W3 Jun', nh48: 75, nh19: 69, dl_exp: 82, avg: 75 },
  { week: 'W4 Jun', nh48: 78, nh19: 72, dl_exp: 84, avg: 78 },
  { week: 'W1 Jul', nh48: 79, nh19: 71, dl_exp: 85, avg: 78 },
  { week: 'W2 Jul', nh48: 80, nh19: 73, dl_exp: 86, avg: 80 },
  { week: 'W3 Jul', nh48: 79, nh19: 70, dl_exp: 85, avg: 78 },
  { week: 'W4 Jul', nh48: 81, nh19: 74, dl_exp: 87, avg: 81 },
  { week: 'W1 Aug', nh48: 82, nh19: 72, dl_exp: 88, avg: 81 },
  { week: 'W2 Aug', nh48: 82, nh19: 71, dl_exp: 87, avg: 80 },
  { week: 'W3 Aug', nh48: 82, nh19: 73, dl_exp: 88, avg: 81 },
];

const phaseScoreData = [
  { phase: 'Sub-grade', evidence: 94, boqMatch: 98, schedule: 88, overall: 93 },
  { phase: 'Sub-base (GSB)', evidence: 91, boqMatch: 96, schedule: 85, overall: 91 },
  { phase: 'WMM Layer', evidence: 82, boqMatch: 91, schedule: 78, overall: 84 },
  { phase: 'DBM Layer', evidence: 68, boqMatch: 84, schedule: 62, overall: 71 },
  { phase: 'BC Layer', evidence: 0, boqMatch: 0, schedule: 0, overall: 0 },
];

const radarData = [
  { subject: 'Evidence', nh48: 82, nh19: 71, dl_exp: 88 },
  { subject: 'BOQ Match', nh48: 91, nh19: 78, dl_exp: 94 },
  { subject: 'Schedule', nh48: 78, nh19: 65, dl_exp: 85 },
  { subject: 'GPS Accuracy', nh48: 88, nh19: 82, dl_exp: 91 },
  { subject: 'Photo Quality', nh48: 85, nh19: 74, dl_exp: 89 },
  { subject: 'Timeliness', nh48: 76, nh19: 68, dl_exp: 83 },
];

interface RiskCell {
  project: string;
  phase: string;
  risk: RiskLevel;
  score: number;
  issue?: string;
}

const riskHeatmapData: RiskCell[] = [
  { project: 'NH-48 Pkg 3', phase: 'Sub-grade', risk: 'clear', score: 93 },
  { project: 'NH-48 Pkg 3', phase: 'Sub-base', risk: 'clear', score: 91 },
  { project: 'NH-48 Pkg 3', phase: 'WMM', risk: 'medium', score: 84, issue: 'Density test pending' },
  { project: 'NH-48 Pkg 3', phase: 'DBM', risk: 'high', score: 71, issue: 'GPS mismatch + low evidence' },
  { project: 'NH-48 Pkg 3', phase: 'BC', risk: 'medium', score: 0, issue: 'Not started' },
  { project: 'NH-19 Pkg 1', phase: 'Sub-grade', risk: 'low', score: 88 },
  { project: 'NH-19 Pkg 1', phase: 'Sub-base', risk: 'medium', score: 79, issue: 'Partial BOQ match' },
  { project: 'NH-19 Pkg 1', phase: 'WMM', risk: 'high', score: 65, issue: 'Evidence gap >14 days' },
  { project: 'NH-19 Pkg 1', phase: 'DBM', risk: 'critical', score: 48, issue: 'No verification in 21 days' },
  { project: 'NH-19 Pkg 1', phase: 'BC', risk: 'medium', score: 0, issue: 'Not started' },
  { project: 'DL Exp. Pkg 2', phase: 'Sub-grade', risk: 'clear', score: 96 },
  { project: 'DL Exp. Pkg 2', phase: 'Sub-base', risk: 'clear', score: 94 },
  { project: 'DL Exp. Pkg 2', phase: 'WMM', risk: 'low', score: 88 },
  { project: 'DL Exp. Pkg 2', phase: 'DBM', risk: 'medium', score: 81, issue: 'Schedule lag 8 days' },
  { project: 'DL Exp. Pkg 2', phase: 'BC', risk: 'low', score: 72 },
];

interface Anomaly {
  id: string;
  project: string;
  type: AnomalyType;
  severity: 'critical' | 'high' | 'medium';
  description: string;
  detectedOn: string;
  chainage?: string;
  delta?: string;
}

const anomalies: Anomaly[] = [
  { id: 'an-001', project: 'NH-19 Pkg 1', type: 'stall', severity: 'critical', description: 'DBM verification stalled — no entries for 21 consecutive days', detectedOn: '23 Aug 2026', chainage: '31+000 – 38+500', delta: '−21 days' },
  { id: 'an-002', project: 'NH-19 Pkg 1', type: 'evidence_gap', severity: 'high', description: 'WMM layer evidence gap: only 2 photos for 3,400 m² area', detectedOn: '22 Aug 2026', chainage: '24+500 – 28+000', delta: '−82% coverage' },
  { id: 'an-003', project: 'NH-48 Pkg 3', type: 'boq_mismatch', severity: 'high', description: 'DBM BOQ quantity reported 18% above drawing takeoff', detectedOn: '21 Aug 2026', chainage: '62+400 – 63+800', delta: '+18% variance' },
  { id: 'an-004', project: 'NH-48 Pkg 3', type: 'score_drop', severity: 'medium', description: 'KARTAA Score dropped 4 points in 7 days — GPS mismatch flagged', detectedOn: '20 Aug 2026', chainage: '62+400', delta: '−4 pts' },
  { id: 'an-005', project: 'DL Exp. Pkg 2', type: 'schedule_slip', severity: 'medium', description: 'DBM paving 8 days behind revised baseline schedule', detectedOn: '19 Aug 2026', chainage: '14+000 – 18+500', delta: '−8 days' },
  { id: 'an-006', project: 'NH-19 Pkg 1', type: 'score_drop', severity: 'high', description: 'Overall KARTAA Score declined from 78 → 71 over 3 weeks', detectedOn: '18 Aug 2026', delta: '−7 pts' },
];

const summaryKpis = [
  { id: 'kpi-1', label: 'Avg KARTAA Score', value: '81', unit: '/100', trend: '+2', up: true, sub: 'Across 3 active projects', icon: <ShieldCheck size={16} />, color: 'text-accent', bg: 'bg-accent/10' },
  { id: 'kpi-2', label: 'Critical Bottlenecks', value: '2', unit: '', trend: '+1', up: false, sub: 'Require immediate PM action', icon: <AlertTriangle size={16} />, color: 'text-danger', bg: 'bg-danger/10' },
  { id: 'kpi-3', label: 'Verification Rate', value: '68%', unit: '', trend: '-4%', up: false, sub: 'Evidence submitted on time', icon: <Activity size={16} />, color: 'text-warning', bg: 'bg-warning/10' },
  { id: 'kpi-4', label: 'Anomalies Detected', value: '6', unit: '', trend: '+2', up: false, sub: 'This week across all projects', icon: <Zap size={16} />, color: 'text-info', bg: 'bg-info/10' },
];

const projects = ['NH-48 Pkg 3', 'NH-19 Pkg 1', 'DL Exp. Pkg 2'];
const phases = ['Sub-grade', 'Sub-base', 'WMM', 'DBM', 'BC'];

const riskConfig: Record<RiskLevel, { label: string; bg: string; text: string; border: string }> = {
  critical: { label: 'Critical', bg: 'bg-danger/25', text: 'text-danger', border: 'border-danger/40' },
  high: { label: 'High', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  medium: { label: 'Medium', bg: 'bg-warning/15', text: 'text-warning', border: 'border-warning/30' },
  low: { label: 'Low', bg: 'bg-info/10', text: 'text-info', border: 'border-info/20' },
  clear: { label: 'Clear', bg: 'bg-accent/10', text: 'text-accent', border: 'border-accent/20' },
};

const anomalyTypeConfig: Record<AnomalyType, { label: string; icon: React.ReactNode }> = {
  score_drop: { label: 'Score Drop', icon: <TrendingDown size={13} /> },
  stall: { label: 'Stall Detected', icon: <Clock size={13} /> },
  evidence_gap: { label: 'Evidence Gap', icon: <XCircle size={13} /> },
  boq_mismatch: { label: 'BOQ Mismatch', icon: <BarChart3 size={13} /> },
  schedule_slip: { label: 'Schedule Slip', icon: <Minus size={13} /> },
};

const severityConfig = {
  critical: { bg: 'bg-danger/10 border-danger/25', text: 'text-danger', dot: 'bg-danger' },
  high: { bg: 'bg-orange-500/10 border-orange-500/25', text: 'text-orange-400', dot: 'bg-orange-400' },
  medium: { bg: 'bg-warning/10 border-warning/25', text: 'text-warning', dot: 'bg-warning' },
};

// ─── Railway Intelligence Data ────────────────────────────────────────────────
const railwayIntelligenceData = [
  {
    id: 'ri-001',
    activity: 'Track Laying',
    chainage: '140+000 – 160+000',
    planned: 42,
    dprReported: 38,
    observed: 34,
    result: 'verify' as const,
    variance: 4,
    notes: 'Variance: 4 pp between DPR and Planned. Field observation shows 34%. Requires verification.',
  },
  {
    id: 'ri-002',
    activity: 'Earthwork — Formation',
    chainage: '120+000 – 130+000',
    planned: 85,
    dprReported: 80,
    observed: 78,
    result: 'watch' as const,
    variance: 2,
    notes: 'Minor variance. Within acceptable range. Monitor next week.',
  },
  {
    id: 'ri-003',
    activity: 'Ballast Spreading',
    chainage: '130+000 – 140+000',
    planned: 55,
    dprReported: 48,
    observed: 42,
    result: 'verify' as const,
    variance: 6,
    notes: 'Variance: 6 pp between DPR and Observed. Requires verification.',
  },
  {
    id: 'ri-004',
    activity: 'Platform Work — STN-001',
    chainage: '128+400',
    planned: 40,
    dprReported: 35,
    observed: 35,
    result: 'ok' as const,
    variance: 0,
    notes: 'DPR matches observed. On track.',
  },
  {
    id: 'ri-005',
    activity: 'Bridge Works — BR-001',
    chainage: '134+250',
    planned: 80,
    dprReported: 72,
    observed: 65,
    result: 'verify' as const,
    variance: 7,
    notes: 'Variance: 7 pp between DPR and Observed. Deck progress needs field check.',
  },
  {
    id: 'ri-006',
    activity: 'OHE Foundation',
    chainage: '120+000 – 135+000',
    planned: 25,
    dprReported: 18,
    observed: 18,
    result: 'watch' as const,
    variance: 7,
    notes: 'DPR matches observed but behind planned by 7 pp. Schedule slip.',
  },
];

type RailwayResult = 'ok' | 'watch' | 'verify';

const railwayResultCfg: Record<RailwayResult, { label: string; bg: string; text: string; border: string; dot: string }> = {
  ok: { label: 'ON TRACK', bg: 'bg-accent/10', text: 'text-accent', border: 'border-accent/25', dot: 'bg-accent' },
  watch: { label: 'WATCH', bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/25', dot: 'bg-warning' },
  verify: { label: 'REQUIRES VERIFICATION', bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/25', dot: 'bg-danger' },
};

function RailwayIntelligencePanel() {
  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="p-3 rounded-lg bg-info/5 border border-info/20 flex items-start gap-2">
        <Info size={14} className="text-info mt-0.5 flex-shrink-0" />
        <div className="text-xs text-muted-foreground">
          <strong className="text-foreground">Railway Progress Intelligence</strong> — Compares{' '}
          <strong className="text-foreground">PLANNED</strong> vs{' '}
          <strong className="text-foreground">DPR REPORTED</strong> vs{' '}
          <strong className="text-foreground">OBSERVED</strong> progress.
          Results are advisory — not automatic certification.
          Demo/Synthetic data for KARTAA Rail Corridor Demo Project.
        </div>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="card-elevated p-4 text-center">
          <div className="text-2xl font-700 text-danger">3</div>
          <div className="text-xs text-muted-foreground mt-0.5">Requires Verification</div>
        </div>
        <div className="card-elevated p-4 text-center">
          <div className="text-2xl font-700 text-warning">2</div>
          <div className="text-xs text-muted-foreground mt-0.5">Watch</div>
        </div>
        <div className="card-elevated p-4 text-center">
          <div className="text-2xl font-700 text-accent">1</div>
          <div className="text-xs text-muted-foreground mt-0.5">On Track</div>
        </div>
      </div>

      {/* Intelligence cards */}
      <div className="space-y-3">
        {railwayIntelligenceData.map(item => {
          const cfg = railwayResultCfg[item.result];
          return (
            <div key={item.id} className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`text-xs font-700 uppercase tracking-wide ${cfg.text}`}>{cfg.label}</span>
                    <span className="text-xs font-600 text-foreground">{item.activity}</span>
                    <span className="text-2xs text-muted-foreground font-mono">Ch. {item.chainage}</span>
                  </div>
                  {/* Comparison grid */}
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {[
                      { label: 'Planned', value: item.planned, color: 'text-muted-foreground' },
                      { label: 'DPR Reported', value: item.dprReported, color: 'text-info' },
                      { label: 'Observed', value: item.observed, color: 'text-foreground' },
                    ].map(col => (
                      <div key={col.label} className="text-center p-2 rounded-lg bg-background/50 border border-border/50">
                        <div className={`text-base font-700 ${col.color}`}>{col.value}%</div>
                        <div className="text-2xs text-muted-foreground">{col.label}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.notes}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="text-muted-foreground mb-1.5 font-500">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="text-foreground font-600">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SummaryKpiRow() {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {summaryKpis.map((kpi) => (
        <div key={kpi.id} className="card-elevated p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center ${kpi.color}`}>
              {kpi.icon}
            </div>
            <span className={`flex items-center gap-0.5 text-xs font-600 ${kpi.up ? 'text-accent' : 'text-danger'}`}>
              {kpi.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {kpi.trend}
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-700 text-foreground font-tabular">{kpi.value}</span>
              {kpi.unit && <span className="text-sm text-muted-foreground">{kpi.unit}</span>}
            </div>
            <p className="text-xs font-500 text-foreground mt-0.5">{kpi.label}</p>
            <p className="text-2xs text-muted-foreground mt-0.5">{kpi.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function VerificationTrendChart() {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-600 text-foreground">KARTAA Verification Score — Weekly Trend</h3>
          <p className="text-xs text-muted-foreground mt-0.5">All active projects · Jun – Aug 2026</p>
        </div>
        <div className="flex items-center gap-3 text-2xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary inline-block rounded" />NH-48</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-info inline-block rounded" />NH-19</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-accent inline-block rounded" />DL Exp.</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={verificationTrendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
          <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
          <YAxis domain={[55, 100]} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Line type="monotone" dataKey="nh48" name="NH-48 Pkg 3" stroke="var(--primary)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="nh19" name="NH-19 Pkg 1" stroke="var(--info)" strokeWidth={2} dot={false} strokeDasharray="4 2" />
          <Line type="monotone" dataKey="dl_exp" name="DL Exp. Pkg 2" stroke="var(--accent)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function PhaseScoreChart() {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-600 text-foreground">Scoring Logic by Phase</h3>
          <p className="text-xs text-muted-foreground mt-0.5">NH-48 Pkg 3 · Evidence + BOQ + Schedule components</p>
        </div>
        <div className="flex items-center gap-2 text-2xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-primary/70 inline-block" />Evidence</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-accent/70 inline-block" />BOQ</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-info/70 inline-block" />Schedule</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={phaseScoreData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
          <XAxis dataKey="phase" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="evidence" name="Evidence" fill="var(--primary)" opacity={0.8} radius={[2, 2, 0, 0]} />
          <Bar dataKey="boqMatch" name="BOQ Match" fill="var(--accent)" opacity={0.8} radius={[2, 2, 0, 0]} />
          <Bar dataKey="schedule" name="Schedule" fill="var(--info)" opacity={0.8} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function RadarComparisonChart() {
  return (
    <div className="card-elevated p-5">
      <div className="mb-4">
        <h3 className="text-sm font-600 text-foreground">Verification Dimension Radar</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Cross-project scoring across 6 verification dimensions</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <RadarChart data={radarData} margin={{ top: 8, right: 24, left: 24, bottom: 8 }}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="NH-48 Pkg 3" dataKey="nh48" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.12} strokeWidth={1.5} />
          <Radar name="NH-19 Pkg 1" dataKey="nh19" stroke="var(--info)" fill="var(--info)" fillOpacity={0.08} strokeWidth={1.5} />
          <Radar name="DL Exp. Pkg 2" dataKey="dl_exp" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.1} strokeWidth={1.5} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', color: 'var(--muted-foreground)' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function RiskHeatmap() {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-600 text-foreground">Risk Heatmap — Phase × Project</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Verification risk level per construction phase across all active projects</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['clear', 'low', 'medium', 'high', 'critical'] as RiskLevel[]).map((r) => (
            <span key={r} className={`text-2xs px-1.5 py-0.5 rounded border font-500 ${riskConfig[r].bg} ${riskConfig[r].text} ${riskConfig[r].border}`}>
              {riskConfig[r].label}
            </span>
          ))}
        </div>
      </div>

      {/* Header row */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="text-left text-2xs text-muted-foreground font-500 pb-2 pr-4 w-36">Project</th>
              {phases.map((p) => (
                <th key={p} className="text-center text-2xs text-muted-foreground font-500 pb-2 px-1 min-w-[90px]">{p}</th>
              ))}
            </tr>
          </thead>
          <tbody className="space-y-1">
            {projects.map((proj) => (
              <tr key={proj} className="group">
                <td className="pr-4 py-1.5">
                  <span className="text-xs font-500 text-foreground whitespace-nowrap">{proj}</span>
                </td>
                {phases.map((phase) => {
                  const cell = riskHeatmapData.find(c => c.project === proj && c.phase === phase);
                  if (!cell) return <td key={phase} className="px-1 py-1.5" />;
                  const cfg = riskConfig[cell.risk];
                  return (
                    <td key={phase} className="px-1 py-1.5">
                      <div
                        className={`relative group/cell rounded-md border px-2 py-2 text-center cursor-default transition-all ${cfg.bg} ${cfg.border}`}
                        title={cell.issue || cfg.label}
                      >
                        <div className={`text-xs font-700 font-tabular ${cfg.text}`}>
                          {cell.score > 0 ? cell.score : '—'}
                        </div>
                        <div className={`text-2xs font-500 ${cfg.text} opacity-80`}>{cfg.label}</div>
                        {cell.issue && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-44 bg-card border border-border rounded-lg px-2.5 py-2 text-2xs text-muted-foreground shadow-lg opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none z-10 text-left">
                            <span className={`font-600 ${cfg.text}`}>{cfg.label}:</span> {cell.issue}
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnomalyFeed() {
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const filtered = anomalies.filter(a => filter === 'all' || a.severity === filter);

  const counts = {
    all: anomalies.length,
    critical: anomalies.filter(a => a.severity === 'critical').length,
    high: anomalies.filter(a => a.severity === 'high').length,
    medium: anomalies.filter(a => a.severity === 'medium').length,
  };

  return (
    <div className="card-elevated p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-600 text-foreground">Performance Anomalies</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Auto-detected deviations across all active projects</p>
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'critical', 'high', 'medium'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-2xs px-2 py-1 rounded-md font-500 transition-colors capitalize ${
                filter === s
                  ? 'bg-primary/15 text-primary' :'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {s === 'all' ? `All (${counts.all})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${counts[s]})`}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((anomaly) => {
          const sev = severityConfig[anomaly.severity];
          const typeInfo = anomalyTypeConfig[anomaly.type];
          return (
            <div key={anomaly.id} className={`rounded-lg border px-4 py-3 ${sev.bg}`}>
              <div className="flex items-start gap-3">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${sev.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`flex items-center gap-1 text-2xs font-600 px-1.5 py-0.5 rounded border ${sev.bg} ${sev.text} border-current/20`}>
                      {typeInfo.icon}
                      {typeInfo.label}
                    </span>
                    <span className="text-2xs text-muted-foreground font-500">{anomaly.project}</span>
                    {anomaly.chainage && (
                      <span className="text-2xs text-muted-foreground chainage-mono">{anomaly.chainage}</span>
                    )}
                    {anomaly.delta && (
                      <span className={`text-2xs font-700 font-tabular ${sev.text}`}>{anomaly.delta}</span>
                    )}
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{anomaly.description}</p>
                  <p className="text-2xs text-muted-foreground mt-1">Detected: {anomaly.detectedOn}</p>
                </div>
                <button className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BottleneckSummary() {
  const bottlenecks = [
    { id: 'bn-1', project: 'NH-19 Pkg 1', phase: 'DBM Layer', issue: 'Verification stalled 21 days', action: 'Assign site engineer immediately', severity: 'critical' as const },
    { id: 'bn-2', project: 'NH-19 Pkg 1', phase: 'WMM Layer', issue: 'Evidence coverage <20%', action: 'Upload minimum 6 photos per 1,000 m²', severity: 'high' as const },
    { id: 'bn-3', project: 'NH-48 Pkg 3', phase: 'DBM Layer', issue: 'BOQ variance +18%', action: 'Cross-check drawing takeoff vs. site measurement', severity: 'high' as const },
  ];

  return (
    <div className="card-elevated p-5">
      <div className="flex items-center gap-2 mb-4">
        <Target size={15} className="text-danger" />
        <h3 className="text-sm font-600 text-foreground">PM Action Required</h3>
        <span className="ml-auto text-2xs text-muted-foreground">3 bottlenecks</span>
      </div>
      <div className="space-y-3">
        {bottlenecks.map((b) => {
          const sev = severityConfig[b.severity];
          return (
            <div key={b.id} className={`rounded-lg border p-3 ${sev.bg}`}>
              <div className="flex items-start gap-2">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${sev.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-2xs font-700 ${sev.text}`}>{b.severity.toUpperCase()}</span>
                    <span className="text-2xs text-muted-foreground">{b.project} · {b.phase}</span>
                  </div>
                  <p className="text-xs text-foreground font-500">{b.issue}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <CheckCircle2 size={11} className="text-accent flex-shrink-0" />
                    <p className="text-2xs text-muted-foreground">{b.action}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProgressIntelligencePage() {
  const { selectedProject } = useProject();
  const [activeTab, setActiveTab] = useState<'road' | 'railway' | 'industrial'>('road');

  return (
    <AppLayout currentPath="/progress-intelligence">
      <Topbar
        title="Progress Intelligence Engine"
        subtitle={`${selectedProject.name} · KARTAA Verification trends · Risk heatmap · Anomaly detection`}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
              <ShieldCheck size={12} className="text-accent" />
              <span className="text-2xs font-600 text-accent">Assisted verification, never automated certification</span>
            </div>
          </div>
        }
      />

      <div className="px-4 md:px-6 xl:px-8 py-6 max-w-screen-2xl mx-auto space-y-6">

        {/* Tab switcher */}
        <div className="flex gap-1 border-b border-border">
          {([
            { id: 'road', label: 'Road Intelligence', icon: null },
            { id: 'railway', label: 'Railway Intelligence', icon: <Train size={13} className="text-info" /> },
            { id: 'industrial', label: 'Industrial Visual Progress', icon: null },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-500 border-b-2 transition-colors -mb-px ${
                activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Road Intelligence (existing content) */}
        {activeTab === 'road' && (
          <>
            {/* Summary KPIs */}
            <SummaryKpiRow />

            {/* Trend + Phase Scoring */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <VerificationTrendChart />
              <PhaseScoreChart />
            </div>

            {/* Risk Heatmap */}
            <RiskHeatmap />

            {/* Radar + Bottlenecks */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
              <div className="xl:col-span-3">
                <RadarComparisonChart />
              </div>
              <div className="xl:col-span-2">
                <BottleneckSummary />
              </div>
            </div>

            {/* Anomaly Feed */}
            <AnomalyFeed />
          </>
        )}

        {/* Railway Intelligence */}
        {activeTab === 'railway' && <RailwayIntelligencePanel />}

        {/* Industrial Visual Progress placeholder */}
        {activeTab === 'industrial' && (
          <div className="card-elevated p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
              <Activity size={20} className="text-accent" />
            </div>
            <h3 className="text-sm font-600 text-foreground mb-1">Industrial Visual Progress</h3>
            <p className="text-xs text-muted-foreground">Industrial progress intelligence is available via the Industrial KARTAA Score module.</p>
            <a href="/industrial-verification" className="inline-flex items-center gap-1 mt-3 text-xs text-primary hover:underline">
              Open Industrial KARTAA Score <ChevronRight size={12} />
            </a>
          </div>
        )}

        {/* Footer note */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-muted/40 border border-border">
          <Info size={13} className="text-muted-foreground flex-shrink-0" />
          <p className="text-2xs text-muted-foreground">
            Intelligence scores are computed from evidence submissions, BOQ cross-references, GPS accuracy, and schedule adherence. 
            All findings require PM review before any formal certification. <span className="font-600 text-foreground">KARTAA OS v1.0 — Phase 2</span>
          </p>
        </div>

      </div>
    </AppLayout>
  );
}
