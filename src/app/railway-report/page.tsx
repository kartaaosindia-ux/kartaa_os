'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';

import { Train, BarChart3, Zap, Radio, Building2, Layers, Activity, ArrowDownRight, ArrowUpRight, FileText, AlertTriangle, CheckCircle2, TrendingDown, MapPin, Printer, Download, ChevronDown, ChevronUp, ShieldAlert, Eye } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ─── Demo Data ────────────────────────────────────────────────────────────────
const PROJECT = {
  name: 'KARTAA Rail Corridor Demo Project',
  code: 'KARTAA-RAIL-DEMO-001',
  location: 'Fictional Central India Rail Corridor',
  zone: 'Central Railway',
  division: 'Nagpur Division',
  routeLength: '86 km',
  startChainage: '120+000',
  endChainage: '206+000',
  contractValue: '₹3,250 Crore',
  startDate: '01 Apr 2023',
  plannedCompletion: '31 Mar 2027',
  reportDate: '25 Aug 2026',
  plannedProgress: 48,
  actualProgress: 44,
  scheduleVariance: -4,
};

const overallKpis = [
  { id: 'k1', label: 'Overall Progress', planned: 48, actual: 44, variance: -4, icon: <Activity size={16} />, color: 'text-primary', bg: 'bg-primary/10' },
  { id: 'k2', label: 'Track Laying', planned: 42, actual: 38, variance: -4, icon: <Train size={16} />, color: 'text-info', bg: 'bg-info/10' },
  { id: 'k3', label: 'Formation', planned: 68, actual: 61, variance: -7, icon: <Layers size={16} />, color: 'text-accent', bg: 'bg-accent/10' },
  { id: 'k4', label: 'Stations', planned: 28, actual: 22, variance: -6, icon: <Building2 size={16} />, color: 'text-warning', bg: 'bg-warning/10' },
  { id: 'k5', label: 'Bridges & Structures', planned: 62, actual: 55, variance: -7, icon: <BarChart3 size={16} />, color: 'text-accent', bg: 'bg-accent/10' },
  { id: 'k6', label: 'OHE / Electrification', planned: 22, actual: 18, variance: -4, icon: <Zap size={16} />, color: 'text-warning', bg: 'bg-warning/10' },
  { id: 'k7', label: 'Signalling & Telecom', planned: 15, actual: 12, variance: -3, icon: <Radio size={16} />, color: 'text-danger', bg: 'bg-danger/10' },
];

const wbsData = [
  { id: 'w1', code: '1.0', name: 'Earthwork & Formation', unit: 'm³', boqQty: 4200000, completedQty: 2562000, planned: 68, actual: 61, variance: -7 },
  { id: 'w2', code: '2.0', name: 'Drainage Works', unit: 'm', boqQty: 86000, completedQty: 47300, planned: 58, actual: 55, variance: -3 },
  { id: 'w3', code: '3.0', name: 'Track Works — Ballast', unit: 'm³', boqQty: 320000, completedQty: 115200, planned: 40, actual: 36, variance: -4 },
  { id: 'w4', code: '3.1', name: 'Track Works — Sleepers', unit: 'Nos.', boqQty: 258000, completedQty: 87720, planned: 38, actual: 34, variance: -4 },
  { id: 'w5', code: '3.2', name: 'Track Works — Rail Laying', unit: 'm', boqQty: 172000, completedQty: 65360, planned: 42, actual: 38, variance: -4 },
  { id: 'w6', code: '3.3', name: 'Turnouts', unit: 'Nos.', boqQty: 48, completedQty: 12, planned: 30, actual: 25, variance: -5 },
  { id: 'w7', code: '4.0', name: 'Bridges & Structures', unit: 'Nos.', boqQty: 24, completedQty: 13, planned: 62, actual: 55, variance: -7 },
  { id: 'w8', code: '4.1', name: 'Culverts', unit: 'Nos.', boqQty: 68, completedQty: 48, planned: 75, actual: 70, variance: -5 },
  { id: 'w9', code: '4.2', name: 'ROB / RUB', unit: 'Nos.', boqQty: 12, completedQty: 5, planned: 45, actual: 42, variance: -3 },
  { id: 'w10', code: '5.0', name: 'Stations & Platforms', unit: 'Nos.', boqQty: 8, completedQty: 2, planned: 28, actual: 22, variance: -6 },
  { id: 'w11', code: '6.0', name: 'OHE Foundations', unit: 'Nos.', boqQty: 3440, completedQty: 619, planned: 22, actual: 18, variance: -4 },
  { id: 'w12', code: '6.1', name: 'OHE Structures', unit: 'Nos.', boqQty: 3440, completedQty: 344, planned: 12, actual: 10, variance: -2 },
  { id: 'w13', code: '7.0', name: 'Signalling & Telecom', unit: 'Locations', boqQty: 8, completedQty: 1, planned: 15, actual: 12, variance: -3 },
  { id: 'w14', code: '8.0', name: 'Level Crossings', unit: 'Nos.', boqQty: 15, completedQty: 9, planned: 65, actual: 60, variance: -5 },
  { id: 'w15', code: '9.0', name: 'Testing & Commissioning', unit: 'Sections', boqQty: 8, completedQty: 0, planned: 0, actual: 0, variance: 0 },
];

const chainageData = [
  { segment: '120–130', formation: 80, track: 72, ohe: 15, station: 45 },
  { segment: '130–140', formation: 72, track: 48, ohe: 8, station: 30 },
  { segment: '140–150', formation: 60, track: 38, ohe: 0, station: 20 },
  { segment: '150–160', formation: 48, track: 28, ohe: 0, station: 15 },
  { segment: '160–170', formation: 40, track: 12, ohe: 0, station: 0 },
  { segment: '170–180', formation: 28, track: 0, ohe: 0, station: 0 },
  { segment: '180–190', formation: 15, track: 0, ohe: 0, station: 0 },
  { segment: '190–206', formation: 5, track: 0, ohe: 0, station: 0 },
];

const plannedVsActualTrend = [
  { month: 'Apr 23', planned: 2, actual: 1 },
  { month: 'Jul 23', planned: 6, actual: 5 },
  { month: 'Oct 23', planned: 12, actual: 10 },
  { month: 'Jan 24', planned: 18, actual: 16 },
  { month: 'Apr 24', planned: 25, actual: 22 },
  { month: 'Jul 24', planned: 32, actual: 28 },
  { month: 'Oct 24', planned: 38, actual: 34 },
  { month: 'Jan 25', planned: 42, actual: 38 },
  { month: 'Apr 25', planned: 46, actual: 41 },
  { month: 'Aug 25', planned: 48, actual: 44 },
];

const dprSummary = [
  { month: 'Apr 2026', entries: 28, approved: 24, pending: 2, rejected: 2 },
  { month: 'May 2026', entries: 31, approved: 28, pending: 2, rejected: 1 },
  { month: 'Jun 2026', entries: 26, approved: 22, pending: 3, rejected: 1 },
  { month: 'Jul 2026', entries: 30, approved: 27, pending: 2, rejected: 1 },
  { month: 'Aug 2026', entries: 20, approved: 15, pending: 4, rejected: 1 },
];

const verificationExceptions = [
  { id: 'e1', severity: 'critical', activity: 'Formation — Earthwork', chainage: '150+000 – 170+000', planned: 48, dpr: 61, observed: 55, variance: 6, status: 'REQUIRES VERIFICATION', action: 'Field check scheduled' },
  { id: 'e2', severity: 'watch', activity: 'Track Laying — Rail', chainage: '140+000 – 160+000', planned: 42, dpr: 38, observed: 35, variance: 3, status: 'WATCH', action: 'Monitor weekly' },
  { id: 'e3', severity: 'watch', activity: 'Stations — Platform Work', chainage: '128+000 – 128+600', planned: 28, dpr: 22, observed: 20, variance: 2, status: 'WATCH', action: 'Review DPR entries' },
  { id: 'e4', severity: 'critical', activity: 'Bridges — Substructure', chainage: '135+200 – 135+800', planned: 62, dpr: 55, observed: 48, variance: 7, status: 'REQUIRES VERIFICATION', action: 'Structural audit pending' },
  { id: 'e5', severity: 'ok', activity: 'Earthwork — Embankment', chainage: '120+000 – 130+000', planned: 85, dpr: 80, observed: 78, variance: 2, status: 'ON TRACK', action: '—' },
];

const structureProgress = [
  { name: 'Bridges', total: 24, completed: 13, inProgress: 5, notStarted: 6, pct: 55 },
  { name: 'Culverts', total: 68, completed: 48, inProgress: 8, notStarted: 12, pct: 70 },
  { name: 'ROB/RUB', total: 12, completed: 5, inProgress: 3, notStarted: 4, pct: 42 },
  { name: 'Level Crossings', total: 15, completed: 9, inProgress: 3, notStarted: 3, pct: 60 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function varColor(v: number) {
  if (v > 0) return 'text-accent';
  if (v >= -3) return 'text-warning';
  return 'text-danger';
}

function severityCfg(s: string) {
  switch (s) {
    case 'critical': return { bg: 'bg-danger/10 border-danger/25', text: 'text-danger', dot: 'bg-danger', label: 'REQUIRES VERIFICATION' };
    case 'watch': return { bg: 'bg-warning/10 border-warning/25', text: 'text-warning', dot: 'bg-warning', label: 'WATCH' };
    default: return { bg: 'bg-accent/10 border-accent/25', text: 'text-accent', dot: 'bg-accent', label: 'ON TRACK' };
  }
}

function ProgressBar({ planned, actual }: { planned: number; actual: number }) {
  const v = actual - planned;
  const barColor = v >= 0 ? 'bg-accent' : v >= -5 ? 'bg-warning' : 'bg-danger';
  return (
    <div className="relative h-2 bg-muted rounded-full overflow-hidden w-full">
      <div className="absolute inset-y-0 left-0 bg-border/60 rounded-full" style={{ width: `${Math.min(planned, 100)}%` }} />
      <div className={`absolute inset-y-0 left-0 rounded-full ${barColor}`} style={{ width: `${Math.min(actual, 100)}%` }} />
    </div>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="text-muted-foreground mb-1.5 font-500">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="text-foreground font-600">{p.value}%</span>
        </div>
      ))}
    </div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({ id, title, subtitle, children }: { id: string; title: string; subtitle?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div id={id} className="card-elevated overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
      >
        <div className="text-left">
          <h2 className="text-sm font-700 text-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {open ? <ChevronUp size={16} className="text-muted-foreground flex-shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RailwayReportPage() {
  return (
    <AppLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        <Topbar title="Railway Progress Report" subtitle={PROJECT.name} />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">

          {/* Report Header */}
          <div className="card-elevated p-5 border-info/30 bg-gradient-to-r from-info/5 to-transparent">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-info/15 flex items-center justify-center flex-shrink-0">
                  <FileText size={20} className="text-info" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-base font-700 text-foreground">{PROJECT.name}</h1>
                    <span className="text-2xs px-2 py-0.5 rounded-full bg-info/10 text-info border border-info/20 font-500">Railway</span>
                    <span className="text-2xs px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20 font-500">Demo / Synthetic</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{PROJECT.location} · {PROJECT.zone} · {PROJECT.division}</p>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={11} />{PROJECT.startChainage} – {PROJECT.endChainage}</span>
                    <span className="text-xs text-muted-foreground">Route: {PROJECT.routeLength}</span>
                    <span className="text-xs text-muted-foreground">Contract: {PROJECT.contractValue}</span>
                    <span className="text-xs text-muted-foreground">Report Date: {PROJECT.reportDate}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-foreground">
                  <Printer size={13} />
                  <span className="hidden sm:inline">Print</span>
                </button>
                <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-primary font-500">
                  <Download size={13} />
                  <span className="hidden sm:inline">Export PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* 1. Overall Progress Summary */}
          <Section id="sec-overall" title="1. Overall Progress Summary" subtitle="Planned vs Actual · As of 25 Aug 2026">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <div className="rounded-xl bg-muted/50 border border-border p-4 text-center">
                <div className="text-3xl font-800 text-foreground">{PROJECT.plannedProgress}%</div>
                <div className="text-xs text-muted-foreground mt-1">Planned Progress</div>
                <div className="h-1.5 bg-border rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-border rounded-full" style={{ width: `${PROJECT.plannedProgress}%` }} />
                </div>
              </div>
              <div className="rounded-xl bg-muted/50 border border-border p-4 text-center">
                <div className="text-3xl font-800 text-foreground">{PROJECT.actualProgress}%</div>
                <div className="text-xs text-muted-foreground mt-1">Actual Progress</div>
                <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-warning rounded-full" style={{ width: `${PROJECT.actualProgress}%` }} />
                </div>
              </div>
              <div className="rounded-xl bg-danger/5 border border-danger/20 p-4 text-center">
                <div className="text-3xl font-800 text-danger flex items-center justify-center gap-1">
                  <TrendingDown size={22} />
                  {PROJECT.scheduleVariance}pp
                </div>
                <div className="text-xs text-muted-foreground mt-1">Schedule Variance</div>
                <div className="text-xs text-danger mt-2 font-500">Behind Schedule</div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {overallKpis.map(kpi => (
                <div key={kpi.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-6 h-6 rounded-lg ${kpi.bg} flex items-center justify-center ${kpi.color}`}>{kpi.icon}</div>
                    <span className={`text-xs font-600 flex items-center gap-0.5 ${kpi.variance >= 0 ? 'text-accent' : 'text-danger'}`}>
                      {kpi.variance >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                      {kpi.variance > 0 ? '+' : ''}{kpi.variance}pp
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1 leading-tight">{kpi.label}</div>
                  <div className="flex items-baseline gap-1.5 mb-1.5">
                    <span className="text-base font-700 text-foreground">{kpi.actual}%</span>
                    <span className="text-2xs text-muted-foreground">/ {kpi.planned}%</span>
                  </div>
                  <ProgressBar planned={kpi.planned} actual={kpi.actual} />
                </div>
              ))}
            </div>
          </Section>

          {/* 2. WBS Breakdown */}
          <Section id="sec-wbs" title="2. WBS Progress Breakdown" subtitle="Work Breakdown Structure — Activity-wise progress">
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-xs min-w-[640px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 text-muted-foreground font-500 w-12">Code</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-500">Activity</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-500 w-20">BOQ Qty</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-500 w-20">Done Qty</th>
                    <th className="text-center py-2 px-2 text-muted-foreground font-500 w-16">Plan%</th>
                    <th className="text-center py-2 px-2 text-muted-foreground font-500 w-16">Actual%</th>
                    <th className="text-center py-2 px-2 text-muted-foreground font-500 w-16">Var</th>
                    <th className="py-2 px-2 text-muted-foreground font-500 w-32">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {wbsData.map((row, i) => (
                    <tr key={row.id} className={`border-b border-border/50 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                      <td className="py-2 px-2 text-muted-foreground font-500">{row.code}</td>
                      <td className="py-2 px-2 text-foreground font-500">{row.name}</td>
                      <td className="py-2 px-2 text-right text-muted-foreground">{row.boqQty.toLocaleString('en-IN')} {row.unit}</td>
                      <td className="py-2 px-2 text-right text-foreground">{row.completedQty.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-2 text-center text-muted-foreground">{row.planned}%</td>
                      <td className="py-2 px-2 text-center font-600 text-foreground">{row.actual}%</td>
                      <td className={`py-2 px-2 text-center font-600 ${varColor(row.variance)}`}>
                        {row.variance > 0 ? '+' : ''}{row.variance}pp
                      </td>
                      <td className="py-2 px-2">
                        <ProgressBar planned={row.planned} actual={row.actual} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* 3. Chainage-wise Progress */}
          <Section id="sec-chainage" title="3. Chainage-wise Progress" subtitle="Formation · Track · OHE · Station — by 10 km segment">
            <div className="flex items-center gap-4 mb-4 flex-wrap text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-info inline-block" />Formation</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-primary inline-block" />Track</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-warning inline-block" />OHE</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-accent inline-block" />Station</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chainageData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="segment" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="formation" name="Formation" fill="var(--info)" radius={[3, 3, 0, 0]} maxBarSize={18} />
                <Bar dataKey="track" name="Track" fill="var(--primary)" radius={[3, 3, 0, 0]} maxBarSize={18} />
                <Bar dataKey="ohe" name="OHE" fill="var(--warning)" radius={[3, 3, 0, 0]} maxBarSize={18} />
                <Bar dataKey="station" name="Station" fill="var(--accent)" radius={[3, 3, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs min-w-[480px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 text-muted-foreground font-500">Segment (km)</th>
                    <th className="text-center py-2 px-2 text-muted-foreground font-500">Formation%</th>
                    <th className="text-center py-2 px-2 text-muted-foreground font-500">Track%</th>
                    <th className="text-center py-2 px-2 text-muted-foreground font-500">OHE%</th>
                    <th className="text-center py-2 px-2 text-muted-foreground font-500">Station%</th>
                  </tr>
                </thead>
                <tbody>
                  {chainageData.map((row, i) => (
                    <tr key={row.segment} className={`border-b border-border/50 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                      <td className="py-2 px-2 font-500 text-foreground">Ch. {row.segment}+000</td>
                      <td className="py-2 px-2 text-center text-info font-600">{row.formation}%</td>
                      <td className="py-2 px-2 text-center text-primary font-600">{row.track}%</td>
                      <td className="py-2 px-2 text-center text-warning font-600">{row.ohe || '—'}{row.ohe ? '%' : ''}</td>
                      <td className="py-2 px-2 text-center text-accent font-600">{row.station || '—'}{row.station ? '%' : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* 4. Track / Structure / Station / OHE / Signalling */}
          <Section id="sec-discipline" title="4. Discipline-wise Progress" subtitle="Track · Structures · Stations · OHE · Signalling">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Track */}
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><Train size={14} className="text-primary" /></div>
                  <div>
                    <div className="text-sm font-600 text-foreground">Track Works</div>
                    <div className="text-xs text-muted-foreground">Ballast · Sleepers · Rail · Turnouts</div>
                  </div>
                </div>
                {[
                  { label: 'Ballast Spreading', planned: 40, actual: 36 },
                  { label: 'Sleeper Installation', planned: 38, actual: 34 },
                  { label: 'Rail Laying', planned: 42, actual: 38 },
                  { label: 'Turnouts', planned: 30, actual: 25 },
                ].map(item => (
                  <div key={item.label} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground">{item.label}</span>
                      <span className={`font-600 ${varColor(item.actual - item.planned)}`}>{item.actual}% <span className="text-muted-foreground font-400">/ {item.planned}%</span></span>
                    </div>
                    <ProgressBar planned={item.planned} actual={item.actual} />
                  </div>
                ))}
              </div>

              {/* Structures */}
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center"><BarChart3 size={14} className="text-accent" /></div>
                  <div>
                    <div className="text-sm font-600 text-foreground">Bridges & Structures</div>
                    <div className="text-xs text-muted-foreground">Bridges · Culverts · ROB/RUB · Level Crossings</div>
                  </div>
                </div>
                {structureProgress.map(item => (
                  <div key={item.name} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground">{item.name} <span className="text-muted-foreground">({item.completed}/{item.total})</span></span>
                      <span className="font-600 text-warning">{item.pct}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Stations */}
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center"><Building2 size={14} className="text-warning" /></div>
                  <div>
                    <div className="text-sm font-600 text-foreground">Stations & Platforms</div>
                    <div className="text-xs text-muted-foreground">8 Stations · Platform Works · Buildings</div>
                  </div>
                </div>
                {[
                  { label: 'STN-001 — Fictional Nagar', pct: 45, status: 'In Progress' },
                  { label: 'STN-002 — Demo Junction', pct: 30, status: 'In Progress' },
                  { label: 'STN-003 — Synthetic Halt', pct: 15, status: 'In Progress' },
                  { label: 'STN-004 to STN-008', pct: 5, status: 'Foundation' },
                ].map(item => (
                  <div key={item.label} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground">{item.label}</span>
                      <span className="font-600 text-warning">{item.pct}% <span className="text-muted-foreground font-400 text-2xs">{item.status}</span></span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-warning rounded-full" style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* OHE + Signalling */}
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-danger/10 flex items-center justify-center"><Zap size={14} className="text-danger" /></div>
                  <div>
                    <div className="text-sm font-600 text-foreground">OHE & Signalling</div>
                    <div className="text-xs text-muted-foreground">Electrification · Signalling · Telecom</div>
                  </div>
                </div>
                {[
                  { label: 'OHE Foundations', planned: 22, actual: 18, icon: <Zap size={11} /> },
                  { label: 'OHE Structures', planned: 12, actual: 10, icon: <Zap size={11} /> },
                  { label: 'Signalling Locations', planned: 15, actual: 12, icon: <Radio size={11} /> },
                  { label: 'Telecom Infrastructure', planned: 10, actual: 8, icon: <Radio size={11} /> },
                ].map(item => (
                  <div key={item.label} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground flex items-center gap-1">{item.icon}{item.label}</span>
                      <span className={`font-600 ${varColor(item.actual - item.planned)}`}>{item.actual}% <span className="text-muted-foreground font-400">/ {item.planned}%</span></span>
                    </div>
                    <ProgressBar planned={item.planned} actual={item.actual} />
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* 5. DPR Summary */}
          <Section id="sec-dpr" title="5. DPR Summary" subtitle="Monthly DPR submission and approval status">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Total Entries (Aug)', value: 20, color: 'text-foreground', bg: 'bg-muted/50' },
                { label: 'Approved', value: 15, color: 'text-accent', bg: 'bg-accent/10' },
                { label: 'Pending Review', value: 4, color: 'text-warning', bg: 'bg-warning/10' },
                { label: 'Rejected', value: 1, color: 'text-danger', bg: 'bg-danger/10' },
              ].map(item => (
                <div key={item.label} className={`rounded-xl border border-border p-3 text-center ${item.bg}`}>
                  <div className={`text-2xl font-800 ${item.color}`}>{item.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[480px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 text-muted-foreground font-500">Month</th>
                    <th className="text-center py-2 px-2 text-muted-foreground font-500">Total</th>
                    <th className="text-center py-2 px-2 text-muted-foreground font-500">Approved</th>
                    <th className="text-center py-2 px-2 text-muted-foreground font-500">Pending</th>
                    <th className="text-center py-2 px-2 text-muted-foreground font-500">Rejected</th>
                    <th className="py-2 px-2 text-muted-foreground font-500">Approval Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {dprSummary.map((row, i) => (
                    <tr key={row.month} className={`border-b border-border/50 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                      <td className="py-2 px-2 font-500 text-foreground">{row.month}</td>
                      <td className="py-2 px-2 text-center text-foreground">{row.entries}</td>
                      <td className="py-2 px-2 text-center text-accent font-600">{row.approved}</td>
                      <td className="py-2 px-2 text-center text-warning font-600">{row.pending}</td>
                      <td className="py-2 px-2 text-center text-danger font-600">{row.rejected}</td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-accent rounded-full" style={{ width: `${Math.round((row.approved / row.entries) * 100)}%` }} />
                          </div>
                          <span className="text-accent font-600 w-8 text-right">{Math.round((row.approved / row.entries) * 100)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* 6. Planned vs Actual Trend */}
          <Section id="sec-trend" title="6. Planned vs Actual Progress Trend" subtitle="Cumulative progress · Apr 2023 – Aug 2026 · Demo/Synthetic Data">
            <div className="flex items-center gap-4 mb-4 flex-wrap text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-border inline-block rounded border-dashed" />Planned</span>
              <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-info inline-block rounded" />Actual</span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={plannedVsActualTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 55]} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="planned" name="Planned" stroke="var(--border)" fill="var(--muted)" strokeWidth={1.5} strokeDasharray="4 2" fillOpacity={0.3} />
                <Area type="monotone" dataKey="actual" name="Actual" stroke="var(--info)" fill="var(--info)" strokeWidth={2} fillOpacity={0.12} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Current Planned', value: '48%', color: 'text-muted-foreground' },
                { label: 'Current Actual', value: '44%', color: 'text-info' },
                { label: 'Schedule Variance', value: '-4pp', color: 'text-danger' },
                { label: 'Months Elapsed', value: '29 / 48', color: 'text-foreground' },
              ].map(item => (
                <div key={item.label} className="rounded-lg border border-border p-3 text-center">
                  <div className={`text-lg font-700 ${item.color}`}>{item.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* 7. Verification Exceptions */}
          <Section id="sec-exceptions" title="7. Verification Exceptions" subtitle="Progress Intelligence — DPR vs Observed variance flags">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Requires Verification', count: verificationExceptions.filter(e => e.severity === 'critical').length, color: 'text-danger', bg: 'bg-danger/10', icon: <ShieldAlert size={14} /> },
                { label: 'Watch', count: verificationExceptions.filter(e => e.severity === 'watch').length, color: 'text-warning', bg: 'bg-warning/10', icon: <Eye size={14} /> },
                { label: 'On Track', count: verificationExceptions.filter(e => e.severity === 'ok').length, color: 'text-accent', bg: 'bg-accent/10', icon: <CheckCircle2 size={14} /> },
              ].map(item => (
                <div key={item.label} className={`rounded-xl border border-border p-3 flex items-center gap-3 ${item.bg}`}>
                  <div className={`${item.color}`}>{item.icon}</div>
                  <div>
                    <div className={`text-xl font-800 ${item.color}`}>{item.count}</div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {verificationExceptions.map(exc => {
                const cfg = severityCfg(exc.severity);
                return (
                  <div key={exc.id} className={`rounded-xl border p-4 ${cfg.bg}`}>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-start gap-2">
                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                        <div>
                          <div className="text-sm font-600 text-foreground">{exc.activity}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin size={10} />{exc.chainage}</div>
                        </div>
                      </div>
                      <span className={`text-2xs px-2 py-0.5 rounded-full border font-600 ${cfg.bg} ${cfg.text} border-current/20`}>{cfg.label}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs">
                      <div className="text-center">
                        <div className="text-muted-foreground mb-0.5">Planned</div>
                        <div className="font-700 text-foreground">{exc.planned}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground mb-0.5">DPR</div>
                        <div className="font-700 text-info">{exc.dpr}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground mb-0.5">Observed</div>
                        <div className="font-700 text-warning">{exc.observed}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground mb-0.5">Variance</div>
                        <div className={`font-700 ${cfg.text}`}>{exc.variance}pp</div>
                      </div>
                      <div className="text-center sm:text-left col-span-3 sm:col-span-1">
                        <div className="text-muted-foreground mb-0.5">Action</div>
                        <div className="font-500 text-foreground">{exc.action}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg p-3">
              <AlertTriangle size={13} className="flex-shrink-0 text-warning" />
              <span>Progress Intelligence compares Planned vs DPR Reported vs Observed. Flags are advisory only — not automatic certification. Field verification required for all exceptions.</span>
            </div>
          </Section>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground py-4 border-t border-border">
            <p>KARTAA OS · Railway Progress Report · {PROJECT.reportDate} · Demo/Synthetic Data Only</p>
            <p className="mt-1">This report uses fictional project data for demonstration purposes. No real railway project information is included.</p>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
