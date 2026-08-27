'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import Link from 'next/link';
import { Train, MapPin, BarChart3, Zap, Radio, Building2, ArrowUpRight, ArrowDownRight, ChevronRight, Info, Satellite, Activity, Target, Layers } from 'lucide-react';
import { Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// ─── Demo Data ────────────────────────────────────────────────────────────────
const PROJECT = {
  name: 'KARTAA Rail Corridor Demo Project',
  code: 'KARTAA-RAIL-DEMO-001',
  location: 'Fictional Central India Rail Corridor',
  zone: 'Central Railway',
  division: 'Nagpur Division',
  gauge: 'Broad Gauge (1676mm)',
  trackType: 'Double Line',
  routeLength: '86 km',
  startChainage: '120+000',
  endChainage: '206+000',
  contractValue: '₹3,250 Crore',
  startDate: '01 Apr 2023',
  plannedCompletion: '31 Mar 2027',
  client: 'Indian Railways / RVNL (Demo)',
  contractor: 'Fictional Rail Constructions Ltd.',
  consultant: 'RITES Ltd. (Demo)',
  stations: 8,
  bridges: 24,
  robRub: 12,
  culverts: 68,
  levelCrossings: 15,
};

const progressKpis = [
  { id: 'kpi-overall', label: 'Overall Progress', planned: 48, actual: 44, variance: -4, unit: '%', icon: <Activity size={16} />, color: 'text-primary', bg: 'bg-primary/10' },
  { id: 'kpi-track', label: 'Track Laying', planned: 42, actual: 38, variance: -4, unit: '%', icon: <Train size={16} />, color: 'text-info', bg: 'bg-info/10' },
  { id: 'kpi-formation', label: 'Formation', planned: 68, actual: 61, variance: -7, unit: '%', icon: <Layers size={16} />, color: 'text-accent', bg: 'bg-accent/10' },
  { id: 'kpi-station', label: 'Stations', planned: 28, actual: 22, variance: -6, unit: '%', icon: <Building2 size={16} />, color: 'text-warning', bg: 'bg-warning/10' },
  { id: 'kpi-bridge', label: 'Bridges & Structures', planned: 62, actual: 55, variance: -7, unit: '%', icon: <BarChart3 size={16} />, color: 'text-accent', bg: 'bg-accent/10' },
  { id: 'kpi-ohe', label: 'Electrification / OHE', planned: 22, actual: 18, variance: -4, unit: '%', icon: <Zap size={16} />, color: 'text-warning', bg: 'bg-warning/10' },
  { id: 'kpi-signal', label: 'Signalling & Telecom', planned: 15, actual: 12, variance: -3, unit: '%', icon: <Radio size={16} />, color: 'text-danger', bg: 'bg-danger/10' },
];

const progressTrendData = [
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

const chainageProgressData = [
  { segment: '120–130', formation: 80, track: 72, ohe: 0 },
  { segment: '130–140', formation: 72, track: 48, ohe: 0 },
  { segment: '140–150', formation: 60, track: 38, ohe: 0 },
  { segment: '150–160', formation: 48, track: 28, ohe: 0 },
  { segment: '160–170', formation: 40, track: 12, ohe: 0 },
  { segment: '170–180', formation: 28, track: 0, ohe: 0 },
  { segment: '180–190', formation: 15, track: 0, ohe: 0 },
  { segment: '190–206', formation: 5, track: 0, ohe: 0 },
];

const recentDprEntries = [
  { id: 'd1', date: '25 Aug 2026', chainage: '134+200 – 134+850', activity: 'Rail Laying', qty: '850 m', status: 'approved', engineer: 'R. Sharma' },
  { id: 'd2', date: '25 Aug 2026', chainage: '128+400 – 128+600', activity: 'Platform Work — STN-001', qty: '75 m²', status: 'pending', engineer: 'A. Verma' },
  { id: 'd3', date: '24 Aug 2026', chainage: '131+000 – 131+500', activity: 'Ballast Spreading', qty: '420 m³', status: 'approved', engineer: 'R. Sharma' },
  { id: 'd4', date: '24 Aug 2026', chainage: '120+000 – 121+200', activity: 'Earthwork — Embankment', qty: '1,250 m³', status: 'approved', engineer: 'P. Nair' },
  { id: 'd5', date: '23 Aug 2026', chainage: '134+000 – 134+200', activity: 'Sleeper Installation', qty: '350 Nos.', status: 'submitted', engineer: 'R. Sharma' },
];

const intelligenceAlerts = [
  { id: 'ia1', severity: 'watch', title: 'Track Laying — Schedule Variance', desc: 'DPR: 38% vs Planned: 42%. Variance: 4 pp. Monitor closely.', chainage: '140+000 – 160+000' },
  { id: 'ia2', severity: 'verify', title: 'Formation — Requires Verification', desc: 'DPR: 61% vs Observed: 55%. Variance: 6 pp. Field check needed.', chainage: '150+000 – 170+000' },
  { id: 'ia3', severity: 'ok', title: 'Earthwork — On Track', desc: 'DPR: 80% vs Planned: 85%. Within acceptable range.', chainage: '120+000 – 130+000' },
];

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

function statusCfg(s: string) {
  switch (s) {
    case 'approved': return { bg: 'bg-accent/10', text: 'text-accent', label: 'Approved' };
    case 'submitted': return { bg: 'bg-info/10', text: 'text-info', label: 'Submitted' };
    case 'pending': return { bg: 'bg-warning/10', text: 'text-warning', label: 'Pending' };
    default: return { bg: 'bg-muted', text: 'text-muted-foreground', label: s };
  }
}

function alertCfg(s: string) {
  switch (s) {
    case 'verify': return { bg: 'bg-danger/10 border-danger/25', text: 'text-danger', dot: 'bg-danger', label: 'REQUIRES VERIFICATION' };
    case 'watch': return { bg: 'bg-warning/10 border-warning/25', text: 'text-warning', dot: 'bg-warning', label: 'WATCH' };
    default: return { bg: 'bg-accent/10 border-accent/25', text: 'text-accent', dot: 'bg-accent', label: 'ON TRACK' };
  }
}

export default function RailwayDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'chainage' | 'intelligence'>('overview');

  return (
    <AppLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        <Topbar title="Railway Dashboard" subtitle={PROJECT.name} />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">

          {/* Header Banner */}
          <div className="card-elevated p-5 border-info/30 bg-gradient-to-r from-info/5 to-transparent">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-info/15 flex items-center justify-center flex-shrink-0">
                  <Train size={20} className="text-info" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-base font-700 text-foreground">{PROJECT.name}</h1>
                    <span className="text-2xs px-2 py-0.5 rounded-full bg-info/10 text-info border border-info/20 font-500">Railway</span>
                    <span className="text-2xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-500">Active</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{PROJECT.location} · {PROJECT.zone} · {PROJECT.division}</p>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={11} />{PROJECT.startChainage} – {PROJECT.endChainage}</span>
                    <span className="text-xs text-muted-foreground">Route: {PROJECT.routeLength}</span>
                    <span className="text-xs text-muted-foreground">{PROJECT.gauge}</span>
                    <span className="text-xs text-muted-foreground">{PROJECT.trackType}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className="text-xl font-700 text-foreground">{PROJECT.contractValue}</div>
                <div className="text-xs text-muted-foreground">Contract Value</div>
                <div className="flex gap-2 mt-1">
                  <Link href="/railway-dpr" className="btn-primary text-xs px-3 py-1.5">+ DPR Entry</Link>
                  <Link href="/railway-wbs" className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-foreground">WBS</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure Counts */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {[
              { label: 'Stations', value: PROJECT.stations, icon: <Building2 size={14} /> },
              { label: 'Bridges', value: PROJECT.bridges, icon: <BarChart3 size={14} /> },
              { label: 'ROB/RUB', value: PROJECT.robRub, icon: <Train size={14} /> },
              { label: 'Culverts', value: PROJECT.culverts, icon: <Layers size={14} /> },
              { label: 'Level Crossings', value: PROJECT.levelCrossings, icon: <Target size={14} /> },
            ].map(item => (
              <div key={item.label} className="card-elevated p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">{item.icon}</div>
                <div className="text-xl font-700 text-foreground">{item.value}</div>
                <div className="text-2xs text-muted-foreground leading-tight">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border">
            {(['overview', 'chainage', 'intelligence'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-500 capitalize border-b-2 transition-colors -mb-px ${
                  activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'intelligence' ? 'Progress Intelligence' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Progress KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {progressKpis.map(kpi => (
                  <div key={kpi.id} className="card-elevated p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-7 h-7 rounded-lg ${kpi.bg} flex items-center justify-center ${kpi.color}`}>
                        {kpi.icon}
                      </div>
                      <span className={`text-xs font-600 flex items-center gap-0.5 ${kpi.variance >= 0 ? 'text-accent' : 'text-danger'}`}>
                        {kpi.variance >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                        {kpi.variance > 0 ? '+' : ''}{kpi.variance}pp
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">{kpi.label}</div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-lg font-700 text-foreground">{kpi.actual}%</span>
                      <span className="text-xs text-muted-foreground">/ {kpi.planned}% planned</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-muted rounded-full relative">
                        <div className="absolute inset-y-0 left-0 bg-border rounded-full" style={{ width: `${kpi.planned}%` }} />
                        <div className={`absolute inset-y-0 left-0 rounded-full ${kpi.variance < -5 ? 'bg-danger' : kpi.variance < 0 ? 'bg-warning' : 'bg-accent'}`} style={{ width: `${kpi.actual}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Trend Chart */}
              <div className="card-elevated p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-600 text-foreground">Overall Progress Trend</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Planned vs Actual · Apr 2023 – Aug 2026 · Demo/Synthetic Data</p>
                  </div>
                  <div className="flex items-center gap-3 text-2xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-border inline-block rounded border-dashed" />Planned</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-info inline-block rounded" />Actual</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={progressTrendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 55]} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="planned" name="Planned" stroke="var(--border)" fill="var(--muted)" strokeWidth={1.5} strokeDasharray="4 2" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="actual" name="Actual" stroke="var(--info)" fill="var(--info)" strokeWidth={2} fillOpacity={0.12} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Recent DPR */}
              <div className="card-elevated p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-600 text-foreground">Recent DPR Entries</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Last 5 entries · Demo/Synthetic Data</p>
                  </div>
                  <Link href="/railway-dpr" className="text-xs text-primary hover:underline flex items-center gap-1">View All <ChevronRight size={12} /></Link>
                </div>
                <div className="space-y-2">
                  {recentDprEntries.map(entry => {
                    const cfg = statusCfg(entry.status);
                    return (
                      <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-600 text-foreground">{entry.activity}</span>
                            <span className={`text-2xs px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text} font-500`}>{cfg.label}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            <span className="text-2xs text-muted-foreground font-mono">Ch. {entry.chainage}</span>
                            <span className="text-2xs text-muted-foreground">{entry.qty}</span>
                            <span className="text-2xs text-muted-foreground">{entry.engineer}</span>
                          </div>
                        </div>
                        <span className="text-2xs text-muted-foreground flex-shrink-0">{entry.date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Chainage */}
          {activeTab === 'chainage' && (
            <div className="space-y-5">
              <div className="card-elevated p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-600 text-foreground">Chainage-wise Progress</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Formation, Track & OHE by 10km segment · Demo/Synthetic Data</p>
                  </div>
                  <div className="flex items-center gap-3 text-2xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-accent/70 inline-block" />Formation</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-info/70 inline-block" />Track</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-warning/70 inline-block" />OHE</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chainageProgressData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
                    <XAxis dataKey="segment" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="formation" name="Formation" fill="var(--accent)" opacity={0.8} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="track" name="Track" fill="var(--info)" opacity={0.8} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="ohe" name="OHE" fill="var(--warning)" opacity={0.8} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Schematic alignment */}
              <div className="card-elevated p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-600 text-foreground">Railway Alignment — Schematic</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Synthetic schematic · Not real GIS data</p>
                  </div>
                  <span className="text-2xs px-2 py-1 rounded-full bg-warning/10 text-warning border border-warning/20 font-500 flex items-center gap-1">
                    <Satellite size={11} />GIS / Satellite Integration — Planned
                  </span>
                </div>
                <div className="relative bg-muted/30 rounded-xl border border-border p-4 overflow-x-auto">
                  <div className="min-w-[600px]">
                    {/* Track line */}
                    <div className="relative h-16 flex items-center">
                      <div className="absolute inset-x-0 top-1/2 h-1 bg-info/40 rounded-full" />
                      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-info/20 rounded-full mt-1.5" />
                      {/* Chainage markers */}
                      {['120+000', '130+000', '140+000', '150+000', '160+000', '170+000', '180+000', '190+000', '206+000'].map((ch, i) => (
                        <div key={ch} className="absolute flex flex-col items-center" style={{ left: `${(i / 8) * 100}%` }}>
                          <div className="w-0.5 h-3 bg-muted-foreground/40" />
                          <span className="text-2xs text-muted-foreground mt-0.5 font-mono whitespace-nowrap">{ch}</span>
                        </div>
                      ))}
                      {/* Stations */}
                      {[
                        { ch: 0.1, name: 'STN-001\nKoradi' },
                        { ch: 0.29, name: 'STN-002\nKamptee' },
                        { ch: 0.62, name: 'STN-003\nRamtek' },
                      ].map((stn, i) => (
                        <div key={`stn-${i}`} className="absolute flex flex-col items-center" style={{ left: `${stn.ch * 100}%` }}>
                          <div className="w-3 h-3 rounded-sm bg-warning border-2 border-warning/60 -mt-1" />
                          <span className="text-2xs text-warning mt-1 text-center leading-tight whitespace-pre">{stn.name}</span>
                        </div>
                      ))}
                      {/* Bridges */}
                      {[0.17, 0.45, 0.9].map((pos, i) => (
                        <div key={`br-${i}`} className="absolute" style={{ left: `${pos * 100}%` }}>
                          <div className="w-2 h-4 bg-accent/60 border border-accent/40 rounded-sm -mt-2" title="Bridge" />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-2xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><span className="w-3 h-1 bg-info/40 inline-block rounded" />Track Alignment</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-warning inline-block" />Station</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-3 bg-accent/60 inline-block rounded-sm" />Bridge</span>
                      <span className="text-warning/80 flex items-center gap-1"><Info size={10} />Synthetic schematic only — GIS integration planned</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Intelligence */}
          {activeTab === 'intelligence' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-info/5 border border-info/20 flex items-start gap-2">
                <Info size={14} className="text-info mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Progress Intelligence compares <strong className="text-foreground">Planned</strong> vs <strong className="text-foreground">DPR Reported</strong> vs <strong className="text-foreground">Observed</strong> progress. Results are advisory — not automatic certification.
                </p>
              </div>
              {intelligenceAlerts.map(alert => {
                const cfg = alertCfg(alert.severity);
                return (
                  <div key={alert.id} className={`p-4 rounded-xl border ${cfg.bg}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-xs font-700 uppercase tracking-wide ${cfg.text}`}>{cfg.label}</span>
                          <span className="text-xs font-600 text-foreground">{alert.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{alert.desc}</p>
                        <span className="text-2xs text-muted-foreground font-mono mt-1 block">Ch. {alert.chainage}</span>
                      </div>
                      <Link href="/progress-intelligence" className="text-xs text-primary hover:underline flex-shrink-0 flex items-center gap-1">
                        Details <ChevronRight size={11} />
                      </Link>
                    </div>
                  </div>
                );
              })}
              <div className="card-elevated p-4 text-center">
                <p className="text-xs text-muted-foreground mb-3">Full Railway Intelligence analysis available in Progress Intelligence</p>
                <Link href="/progress-intelligence" className="btn-primary text-xs px-4 py-2">
                  Open Progress Intelligence
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </AppLayout>
  );
}
