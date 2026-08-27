'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import { CheckCircle2, AlertTriangle, Calendar, Target, BarChart2, Zap, ArrowUp, ArrowDown, Minus, Activity, AlertCircle, ChevronRight } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
type ScheduleStatus = 'Ahead' | 'On Track' | 'Behind Schedule';

interface ActivityVariance {
  activity_id: string;
  activity_name: string;
  date: string;
  planned_daily_target: number;
  actual_qty: number;
  unit: string;
  variance_pct: number;
  shortfall_qty: number;
  delay_reason: string;
  cumulative_planned: number;
  cumulative_actual: number;
  schedule_status: ScheduleStatus;
}

interface DailyTrend {
  date: string;
  planned: number;
  actual: number;
  variance_pct: number;
}

// ─── Demo variance data ───────────────────────────────────────────────────────
const VARIANCE_DATA: ActivityVariance[] = [
  {
    activity_id: 'ACT-001', activity_name: 'RCC Foundation — Zone A',
    date: '27 Aug 2026', planned_daily_target: 45, actual_qty: 38, unit: 'm³',
    variance_pct: -15.6, shortfall_qty: 7, delay_reason: 'Weather',
    cumulative_planned: 1800, cumulative_actual: 1620, schedule_status: 'Behind Schedule',
  },
  {
    activity_id: 'ACT-002', activity_name: 'Structural Steel Erection',
    date: '27 Aug 2026', planned_daily_target: 12, actual_qty: 10, unit: 'MT',
    variance_pct: -16.7, shortfall_qty: 2, delay_reason: 'Weather',
    cumulative_planned: 480, cumulative_actual: 430, schedule_status: 'Behind Schedule',
  },
  {
    activity_id: 'ACT-003', activity_name: 'Electrical Cable Laying',
    date: '27 Aug 2026', planned_daily_target: 320, actual_qty: 290, unit: 'm',
    variance_pct: -9.4, shortfall_qty: 30, delay_reason: 'None',
    cumulative_planned: 12800, cumulative_actual: 11600, schedule_status: 'Behind Schedule',
  },
  {
    activity_id: 'ACT-005', activity_name: 'RCC Columns & Beams — Zone B',
    date: '27 Aug 2026', planned_daily_target: 60, actual_qty: 65, unit: 'm³',
    variance_pct: 8.3, shortfall_qty: 0, delay_reason: 'None',
    cumulative_planned: 2400, cumulative_actual: 2500, schedule_status: 'Ahead',
  },
  {
    activity_id: 'ACT-006', activity_name: 'Brick Masonry — External Walls',
    date: '27 Aug 2026', planned_daily_target: 180, actual_qty: 180, unit: 'm²',
    variance_pct: 0, shortfall_qty: 0, delay_reason: 'None',
    cumulative_planned: 7200, cumulative_actual: 7200, schedule_status: 'On Track',
  },
  {
    activity_id: 'ACT-007', activity_name: 'Plumbing & Sanitation',
    date: '27 Aug 2026', planned_daily_target: 85, actual_qty: 92, unit: 'm',
    variance_pct: 8.2, shortfall_qty: 0, delay_reason: 'None',
    cumulative_planned: 3400, cumulative_actual: 3680, schedule_status: 'Ahead',
  },
];

const DAILY_TREND: DailyTrend[] = [
  { date: '21 Aug', planned: 100, actual: 88, variance_pct: -12 },
  { date: '22 Aug', planned: 100, actual: 72, variance_pct: -28 },
  { date: '23 Aug', planned: 100, actual: 95, variance_pct: -5 },
  { date: '24 Aug', planned: 100, actual: 103, variance_pct: 3 },
  { date: '25 Aug', planned: 100, actual: 91, variance_pct: -9 },
  { date: '26 Aug', planned: 100, actual: 84, variance_pct: -16 },
  { date: '27 Aug', planned: 100, actual: 87, variance_pct: -13 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function statusCfg(status: ScheduleStatus) {
  switch (status) {
    case 'Ahead': return { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30', icon: <ArrowUp size={11} /> };
    case 'On Track': return { bg: 'bg-info/10', text: 'text-info', border: 'border-info/30', icon: <Minus size={11} /> };
    case 'Behind Schedule': return { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/30', icon: <ArrowDown size={11} /> };
  }
}

function computeProjectedCompletion(avgVelocityPct: number): string {
  const baseDate = new Date('2027-06-30');
  const daysAdjust = Math.round(((100 - avgVelocityPct) / 100) * 60);
  baseDate.setDate(baseDate.getDate() + daysAdjust);
  return baseDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Variance Card (reusable, also used on Dashboard) ─────────────────────────
export function VarianceSummaryCard() {
  const metCount = VARIANCE_DATA.filter(v => v.variance_pct >= 0).length;
  const missedCount = VARIANCE_DATA.filter(v => v.variance_pct < 0).length;
  const avgVelocity = Math.round(VARIANCE_DATA.reduce((s, v) => s + (v.actual_qty / v.planned_daily_target) * 100, 0) / VARIANCE_DATA.length);
  const projectedCompletion = computeProjectedCompletion(avgVelocity);
  const worstMissed = VARIANCE_DATA.filter(v => v.variance_pct < 0).sort((a, b) => a.variance_pct - b.variance_pct)[0];

  return (
    <div className="card-elevated p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-700 text-foreground">Daily Target vs. Actual Progress</h3>
            <p className="text-xs text-muted-foreground">27 Aug 2026 · Variance Engine</p>
          </div>
        </div>
        <a href="/variance-engine" className="flex items-center gap-1 text-xs text-primary hover:underline">
          Full Report <ChevronRight size={12} />
        </a>
      </div>

      {/* Met / Missed badges */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10 border border-success/20">
          <div className="w-9 h-9 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={18} className="text-success" />
          </div>
          <div>
            <div className="text-lg font-700 text-success">{metCount}</div>
            <div className="text-xs text-success/80">Target Met (≥100%)</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-danger/10 border border-danger/20">
          <div className="w-9 h-9 rounded-lg bg-danger/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-danger" />
          </div>
          <div>
            <div className="text-lg font-700 text-danger">{missedCount}</div>
            <div className="text-xs text-danger/80">Target Missed (&lt;100%)</div>
          </div>
        </div>
      </div>

      {/* Worst miss alert */}
      {worstMissed && (
        <div className="p-3 rounded-xl bg-danger/5 border border-danger/20">
          <div className="flex items-start gap-2">
            <AlertCircle size={14} className="text-danger flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-600 text-danger">Worst Shortfall — {worstMissed.activity_name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Shortfall: <span className="text-danger font-600">{worstMissed.shortfall_qty} {worstMissed.unit}</span> · Variance: <span className="text-danger font-600">{worstMissed.variance_pct.toFixed(1)}%</span>
                {worstMissed.delay_reason !== 'None' && <> · Reason: <span className="text-foreground">{worstMissed.delay_reason}</span></>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Execution velocity + projected completion */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-muted/40 border border-border">
          <div className="text-xs text-muted-foreground mb-1">Avg Execution Velocity</div>
          <div className={`text-xl font-700 ${avgVelocity >= 100 ? 'text-success' : avgVelocity >= 85 ? 'text-warning' : 'text-danger'}`}>{avgVelocity}%</div>
          <div className="text-2xs text-muted-foreground">of daily baseline</div>
        </div>
        <div className="p-3 rounded-xl bg-muted/40 border border-border">
          <div className="text-xs text-muted-foreground mb-1">Projected Completion</div>
          <div className="text-sm font-700 text-foreground">{projectedCompletion}</div>
          <div className="text-2xs text-warning">+{Math.round(((100 - avgVelocity) / 100) * 60)}d delay est.</div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VarianceEnginePage() {
  const { selectedProject } = useProject();
  const [activeTab, setActiveTab] = useState<'today' | 'trend' | 'projection'>('today');

  const metCount = VARIANCE_DATA.filter(v => v.variance_pct >= 0).length;
  const missedCount = VARIANCE_DATA.filter(v => v.variance_pct < 0).length;
  const avgVelocity = Math.round(VARIANCE_DATA.reduce((s, v) => s + (v.actual_qty / v.planned_daily_target) * 100, 0) / VARIANCE_DATA.length);
  const projectedCompletion = computeProjectedCompletion(avgVelocity);
  const delayDays = Math.round(((100 - avgVelocity) / 100) * 60);

  return (
    <AppLayout currentPath="/variance-engine">
      <Topbar
        title="Variance Engine"
        subtitle={`Daily Target vs. Actual · Schedule Monitoring — ${selectedProject.name}`}
      />
      <div className="px-6 xl:px-8 2xl:px-10 py-6 max-w-screen-2xl mx-auto space-y-6">

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Target Met', value: `${metCount} / ${VARIANCE_DATA.length}`, icon: <CheckCircle2 size={16} />, color: 'text-success', bg: 'bg-success/10' },
            { label: 'Target Missed', value: String(missedCount), icon: <AlertTriangle size={16} />, color: 'text-danger', bg: 'bg-danger/10' },
            { label: 'Avg Execution Velocity', value: `${avgVelocity}%`, icon: <Zap size={16} />, color: avgVelocity >= 100 ? 'text-success' : 'text-warning', bg: avgVelocity >= 100 ? 'bg-success/10' : 'bg-warning/10' },
            { label: 'Projected Completion', value: projectedCompletion, icon: <Calendar size={16} />, color: delayDays > 0 ? 'text-warning' : 'text-success', bg: delayDays > 0 ? 'bg-warning/10' : 'bg-success/10' },
          ].map(k => (
            <div key={k.label} className="card-elevated p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${k.bg}`}>
                  <span className={k.color}>{k.icon}</span>
                </div>
                <span className="text-xs text-muted-foreground">{k.label}</span>
              </div>
              <div className={`text-lg font-700 ${k.color}`}>{k.value}</div>
              {k.label === 'Projected Completion' && delayDays > 0 && (
                <div className="text-2xs text-warning mt-0.5">+{delayDays}d delay estimated</div>
              )}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {[
            { id: 'today' as const, label: "Today's Variance", icon: <Target size={14} /> },
            { id: 'trend' as const, label: '7-Day Trend', icon: <BarChart2 size={14} /> },
            { id: 'projection' as const, label: 'Schedule Projection', icon: <Calendar size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-500 border-b-2 transition-colors -mb-px ${
                activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* ── Today's Variance ── */}
        {activeTab === 'today' && (
          <div className="space-y-4">
            {VARIANCE_DATA.map(v => {
              const met = v.variance_pct >= 0;
              const sCfg = statusCfg(v.schedule_status);
              const progressPct = Math.min(100, Math.round((v.actual_qty / v.planned_daily_target) * 100));
              return (
                <div key={v.activity_id} className={`card-elevated p-5 border-l-4 ${met ? 'border-success' : 'border-danger'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">{v.activity_id}</span>
                        <span className="text-sm font-600 text-foreground">{v.activity_name}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-500 border ${sCfg.bg} ${sCfg.text} ${sCfg.border}`}>
                          {sCfg.icon} {v.schedule_status}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{v.date}</div>
                    </div>
                    {/* Variance badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-700 text-sm border ${met ? 'bg-success/10 text-success border-success/30' : 'bg-danger/10 text-danger border-danger/30'}`}>
                      {met ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      {met ? '+' : ''}{v.variance_pct.toFixed(1)}%
                    </div>
                  </div>

                  {/* Qty comparison */}
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">Planned Target</div>
                      <div className="text-base font-700 text-foreground">{v.planned_daily_target.toLocaleString()} <span className="text-xs font-400 text-muted-foreground">{v.unit}</span></div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">Actual Executed</div>
                      <div className={`text-base font-700 ${met ? 'text-success' : 'text-danger'}`}>{v.actual_qty.toLocaleString()} <span className="text-xs font-400 text-muted-foreground">{v.unit}</span></div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">{met ? 'Surplus' : 'Shortfall'}</div>
                      <div className={`text-base font-700 ${met ? 'text-success' : 'text-danger'}`}>
                        {met ? '+' : '-'}{Math.abs(v.shortfall_qty || (v.actual_qty - v.planned_daily_target))} <span className="text-xs font-400 text-muted-foreground">{v.unit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Daily execution</span>
                      <span className={`font-600 ${met ? 'text-success' : 'text-danger'}`}>{progressPct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${met ? 'bg-success' : 'bg-danger'}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Cumulative */}
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <BarChart2 size={12} />
                      Cumulative: <span className="text-foreground font-500">{v.cumulative_actual.toLocaleString()}</span> / {v.cumulative_planned.toLocaleString()} {v.unit}
                    </div>
                    {v.delay_reason !== 'None' && (
                      <div className="flex items-center gap-1.5 text-warning">
                        <AlertTriangle size={12} />
                        Delay: <span className="font-500">{v.delay_reason}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── 7-Day Trend ── */}
        {activeTab === 'trend' && (
          <div className="card-elevated p-5">
            <h3 className="text-sm font-600 text-foreground mb-1">7-Day Daily Execution vs. Baseline (Normalised %)</h3>
            <p className="text-xs text-muted-foreground mb-5">Planned = 100% baseline. Bars show actual execution as % of planned daily target.</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DAILY_TREND} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} domain={[0, 120]} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number) => [`${value}%`, 'Execution']}
                  />
                  <ReferenceLine y={100} stroke="#C9A84C" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Target', fill: '#C9A84C', fontSize: 10, position: 'right' }} />
                  <Bar dataKey="actual" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {DAILY_TREND.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.actual >= 100 ? '#22c55e' : entry.actual >= 85 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-success inline-block" /> ≥100% — Target Met</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-warning inline-block" /> 85–99% — Minor Shortfall</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-danger inline-block" /> &lt;85% — Significant Miss</div>
            </div>
          </div>
        )}

        {/* ── Schedule Projection ── */}
        {activeTab === 'projection' && (
          <div className="space-y-4">
            <div className="card-elevated p-5 border border-warning/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <Calendar size={22} className="text-warning" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-700 text-foreground">Master Plan Projection Update</h3>
                  <p className="text-xs text-muted-foreground mt-1">Based on current daily execution velocity of <span className="text-warning font-600">{avgVelocity}%</span></p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                      <div className="text-xs text-muted-foreground mb-1">Original Completion</div>
                      <div className="text-sm font-700 text-foreground">30 Jun 2027</div>
                      <div className="text-2xs text-muted-foreground">Baseline</div>
                    </div>
                    <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
                      <div className="text-xs text-muted-foreground mb-1">Projected Completion</div>
                      <div className="text-sm font-700 text-warning">{projectedCompletion}</div>
                      <div className="text-2xs text-warning">+{delayDays} days delay</div>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                      <div className="text-xs text-muted-foreground mb-1">Required Velocity to Recover</div>
                      <div className="text-sm font-700 text-primary">{Math.min(140, Math.round(100 / (avgVelocity / 100) * 1.05))}%</div>
                      <div className="text-2xs text-muted-foreground">of daily baseline</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity-level schedule status */}
            <div className="card-elevated overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-600 text-foreground">Activity-Level Schedule Status</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Cumulative progress vs. master baseline</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 text-muted-foreground font-600">Activity</th>
                      <th className="text-right px-4 py-3 text-muted-foreground font-600">Cumulative Planned</th>
                      <th className="text-right px-4 py-3 text-muted-foreground font-600">Cumulative Actual</th>
                      <th className="text-right px-4 py-3 text-muted-foreground font-600">Cum. Variance</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {VARIANCE_DATA.map((v, i) => {
                      const cumVar = ((v.cumulative_actual - v.cumulative_planned) / v.cumulative_planned) * 100;
                      const sCfg = statusCfg(v.schedule_status);
                      return (
                        <tr key={v.activity_id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                          <td className="px-4 py-3">
                            <div className="font-500 text-foreground">{v.activity_name}</div>
                            <div className="text-muted-foreground font-mono mt-0.5">{v.activity_id}</div>
                          </td>
                          <td className="px-4 py-3 text-right text-foreground">{v.cumulative_planned.toLocaleString()} {v.unit}</td>
                          <td className="px-4 py-3 text-right font-600 text-foreground">{v.cumulative_actual.toLocaleString()} {v.unit}</td>
                          <td className={`px-4 py-3 text-right font-700 ${cumVar >= 0 ? 'text-success' : 'text-danger'}`}>
                            {cumVar >= 0 ? '+' : ''}{cumVar.toFixed(1)}%
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-500 border ${sCfg.bg} ${sCfg.text} ${sCfg.border}`}>
                              {sCfg.icon} {v.schedule_status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
