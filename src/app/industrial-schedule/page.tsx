'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';

import { CheckCircle2, Clock, AlertCircle, TrendingUp, Flag, AlertTriangle, Target } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';

// ─── Types ────────────────────────────────────────────────────────────────────
type TaskStatus = 'completed' | 'in-progress' | 'delayed' | 'not-started' | 'at-risk';

interface ScheduleTask {
  id: string;
  zone: string;
  activity: string;
  category: string;
  plannedStart: string;
  plannedEnd: string;
  actualStart: string;
  actualEnd: string;
  plannedPct: number;
  actualPct: number;
  status: TaskStatus;
  spi: number;
  delayDays: number;
  assignee: string;
  dependencies: string[];
}

interface Milestone {
  id: string;
  name: string;
  targetDate: string;
  forecastDate: string;
  status: 'achieved' | 'on-track' | 'at-risk' | 'delayed';
  delayDays: number;
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const scheduleTasks: ScheduleTask[] = [
  { id: 't-001', zone: 'Zone A', activity: 'Site Clearance & Grading', category: 'Civil', plannedStart: '01 Mar', plannedEnd: '31 Mar', actualStart: '01 Mar', actualEnd: '28 Mar', plannedPct: 100, actualPct: 100, status: 'completed', spi: 1.08, delayDays: -3, assignee: 'R. Sharma', dependencies: [] },
  { id: 't-002', zone: 'Zone A', activity: 'RCC Foundation', category: 'Civil', plannedStart: '01 Apr', plannedEnd: '30 Apr', actualStart: '01 Apr', actualEnd: '02 May', plannedPct: 100, actualPct: 100, status: 'completed', spi: 0.94, delayDays: 2, assignee: 'R. Sharma', dependencies: ['t-001'] },
  { id: 't-003', zone: 'Zone A', activity: 'Structural Steel Erection', category: 'Structural', plannedStart: '01 May', plannedEnd: '30 Jun', actualStart: '05 May', actualEnd: '', plannedPct: 100, actualPct: 72, status: 'in-progress', spi: 0.88, delayDays: 8, assignee: 'P. Nair', dependencies: ['t-002'] },
  { id: 't-004', zone: 'Zone A', activity: 'Mechanical Equipment Install', category: 'Mechanical', plannedStart: '01 Jul', plannedEnd: '31 Aug', actualStart: '08 Jul', actualEnd: '', plannedPct: 75, actualPct: 55, status: 'at-risk', spi: 0.79, delayDays: 14, assignee: 'K. Singh', dependencies: ['t-003'] },
  { id: 't-005', zone: 'Zone A', activity: 'Electrical Works', category: 'Electrical', plannedStart: '15 Jul', plannedEnd: '15 Sep', actualStart: '20 Jul', actualEnd: '', plannedPct: 55, actualPct: 38, status: 'delayed', spi: 0.72, delayDays: 18, assignee: 'A. Patel', dependencies: ['t-003'] },
  { id: 't-006', zone: 'Zone B', activity: 'RCC Foundation', category: 'Civil', plannedStart: '15 Mar', plannedEnd: '15 May', actualStart: '15 Mar', actualEnd: '12 May', plannedPct: 100, actualPct: 100, status: 'completed', spi: 1.03, delayDays: -3, assignee: 'R. Sharma', dependencies: [] },
  { id: 't-007', zone: 'Zone B', activity: 'Structural Steel Erection', category: 'Structural', plannedStart: '16 May', plannedEnd: '31 Jul', actualStart: '18 May', actualEnd: '', plannedPct: 90, actualPct: 84, status: 'in-progress', spi: 0.93, delayDays: 5, assignee: 'P. Nair', dependencies: ['t-006'] },
  { id: 't-008', zone: 'Zone C', activity: 'RCC Foundation', category: 'Civil', plannedStart: '01 Jun', plannedEnd: '31 Jul', actualStart: '10 Jun', actualEnd: '', plannedPct: 80, actualPct: 68, status: 'at-risk', spi: 0.82, delayDays: 12, assignee: 'S. Verma', dependencies: [] },
  { id: 't-009', zone: 'Zone D', activity: 'RCC Foundation', category: 'Civil', plannedStart: '01 Jul', plannedEnd: '31 Aug', actualStart: '15 Jul', actualEnd: '', plannedPct: 50, actualPct: 28, status: 'delayed', spi: 0.61, delayDays: 22, assignee: 'M. Rao', dependencies: [] },
  { id: 't-010', zone: 'Zone E', activity: 'Site Preparation', category: 'Civil', plannedStart: '01 Sep', plannedEnd: '30 Sep', actualStart: '', actualEnd: '', plannedPct: 0, actualPct: 0, status: 'not-started', spi: 0, delayDays: 0, assignee: '—', dependencies: [] },
  { id: 't-011', zone: 'Zone F', activity: 'Site Preparation', category: 'Civil', plannedStart: '01 Oct', plannedEnd: '31 Oct', actualStart: '', actualEnd: '', plannedPct: 0, actualPct: 0, status: 'not-started', spi: 0, delayDays: 0, assignee: '—', dependencies: [] },
];

const milestones: Milestone[] = [
  { id: 'ms-001', name: 'Zone A Civil Works Complete', targetDate: '30 Apr 2026', forecastDate: '02 May 2026', status: 'achieved', delayDays: 2 },
  { id: 'ms-002', name: 'Zone A & B Structural Erection', targetDate: '31 Jul 2026', forecastDate: '15 Aug 2026', status: 'at-risk', delayDays: 15 },
  { id: 'ms-003', name: 'Zone A Mechanical Commissioning', targetDate: '31 Aug 2026', forecastDate: '20 Sep 2026', status: 'delayed', delayDays: 20 },
  { id: 'ms-004', name: 'Zone C Foundation Complete', targetDate: '31 Jul 2026', forecastDate: '18 Aug 2026', status: 'at-risk', delayDays: 18 },
  { id: 'ms-005', name: 'Phase 1 Structural Completion', targetDate: '31 Dec 2026', forecastDate: '28 Jan 2027', status: 'at-risk', delayDays: 28 },
  { id: 'ms-006', name: 'Full Plant Commissioning', targetDate: '30 Jun 2027', forecastDate: '30 Jun 2027', status: 'on-track', delayDays: 0 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function taskCfg(status: TaskStatus) {
  switch (status) {
    case 'completed': return { bg: 'bg-success/15', bar: 'bg-success', text: 'text-success', border: 'border-success/30', label: 'Completed', icon: <CheckCircle2 size={12} /> };
    case 'in-progress': return { bg: 'bg-primary/12', bar: 'bg-primary', text: 'text-primary', border: 'border-primary/30', label: 'In Progress', icon: <Clock size={12} /> };
    case 'at-risk': return { bg: 'bg-warning/12', bar: 'bg-warning', text: 'text-warning', border: 'border-warning/30', label: 'At Risk', icon: <AlertCircle size={12} /> };
    case 'delayed': return { bg: 'bg-danger/12', bar: 'bg-danger', text: 'text-danger', border: 'border-danger/30', label: 'Delayed', icon: <AlertTriangle size={12} /> };
    case 'not-started': return { bg: 'bg-muted/60', bar: 'bg-muted-foreground/30', text: 'text-muted-foreground', border: 'border-border', label: 'Not Started', icon: <Clock size={12} /> };
  }
}

function milestoneCfg(status: Milestone['status']) {
  switch (status) {
    case 'achieved': return { text: 'text-success', bg: 'bg-success/10', border: 'border-success/30', label: 'Achieved' };
    case 'on-track': return { text: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30', label: 'On Track' };
    case 'at-risk': return { text: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', label: 'At Risk' };
    case 'delayed': return { text: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30', label: 'Delayed' };
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function IndustrialSchedulePage() {
  const [filterZone, setFilterZone] = useState<string>('all');
  const { selectedProject } = useProject();
  const zones = ['all', 'Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E', 'Zone F'];

  const filtered = filterZone === 'all' ? scheduleTasks : scheduleTasks.filter(t => t.zone === filterZone);

  const overallSPI = scheduleTasks.filter(t => t.spi > 0).reduce((sum, t) => sum + t.spi, 0) / scheduleTasks.filter(t => t.spi > 0).length;
  const delayedCount = scheduleTasks.filter(t => t.status === 'delayed').length;
  const atRiskCount = scheduleTasks.filter(t => t.status === 'at-risk').length;
  const completedCount = scheduleTasks.filter(t => t.status === 'completed').length;

  const kpis = [
    { label: 'Overall SPI', value: overallSPI.toFixed(2), sub: overallSPI >= 1 ? 'Ahead of schedule' : 'Behind schedule', icon: <TrendingUp size={16} />, color: overallSPI >= 0.9 ? 'text-success' : overallSPI >= 0.75 ? 'text-warning' : 'text-danger', bg: 'bg-primary/10' },
    { label: 'Delayed Tasks', value: `${delayedCount}`, sub: `${atRiskCount} more at risk`, icon: <AlertTriangle size={16} />, color: 'text-danger', bg: 'bg-danger/10' },
    { label: 'Completed Tasks', value: `${completedCount}/${scheduleTasks.length}`, sub: 'Fully closed out', icon: <CheckCircle2 size={16} />, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Milestones', value: `${milestones.filter(m => m.status === 'achieved').length}/${milestones.length}`, sub: `${milestones.filter(m => m.status === 'delayed').length} delayed`, icon: <Flag size={16} />, color: 'text-accent', bg: 'bg-accent/10' },
  ];

  return (
    <AppLayout currentPath="/industrial-schedule">
      <Topbar
        title="Industrial Schedule"
        subtitle={`Schedule Management & SPI Tracking — ${selectedProject.name}`}
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

        {/* Milestones */}
        <div className="card-elevated p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-600 text-foreground">Key Milestones</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Project-level milestones with forecast dates</p>
            </div>
            <Flag size={16} className="text-muted-foreground" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {milestones.map(ms => {
              const cfg = milestoneCfg(ms.status);
              return (
                <div key={ms.id} className={`p-3 rounded-xl border ${cfg.border} ${cfg.bg}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="text-xs font-600 text-foreground leading-tight">{ms.name}</div>
                    <span className={`text-2xs font-500 px-2 py-0.5 rounded-full bg-card border ${cfg.border} ${cfg.text} whitespace-nowrap`}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="space-y-1 text-2xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Target</span>
                      <span className="font-500 text-foreground">{ms.targetDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Forecast</span>
                      <span className={`font-600 ${ms.delayDays > 0 ? 'text-danger' : 'text-success'}`}>{ms.forecastDate}</span>
                    </div>
                    {ms.delayDays > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delay</span>
                        <span className="font-700 text-danger">+{ms.delayDays} days</span>
                      </div>
                    )}
                    {ms.delayDays < 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Early</span>
                        <span className="font-700 text-success">{Math.abs(ms.delayDays)} days</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Zone filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-600 text-muted-foreground uppercase tracking-wider">Zone:</span>
          {zones.map(z => (
            <button
              key={z}
              onClick={() => setFilterZone(z)}
              className={`px-3 py-1.5 rounded-full text-xs font-500 border transition-all ${
                filterZone === z
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              {z === 'all' ? 'All Zones' : z}
            </button>
          ))}
        </div>

        {/* Schedule table */}
        <div className="card-elevated overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-600 text-foreground">Activity Schedule</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} tasks · Planned vs Actual progress</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-muted-foreground font-600 min-w-[160px]">Zone / Activity</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-600">Category</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-600">Planned Period</th>
                  <th className="text-center px-4 py-3 text-muted-foreground font-600 min-w-[160px]">Progress (Plan vs Actual)</th>
                  <th className="text-center px-4 py-3 text-muted-foreground font-600">SPI</th>
                  <th className="text-center px-4 py-3 text-muted-foreground font-600">Delay</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-600">Status</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-600">Assignee</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((task, i) => {
                  const cfg = taskCfg(task.status);
                  return (
                    <tr key={task.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                      <td className="px-4 py-3">
                        <div className="font-500 text-foreground">{task.zone}</div>
                        <div className="text-muted-foreground mt-0.5">{task.activity}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{task.category}</td>
                      <td className="px-4 py-3">
                        <div className="text-foreground">{task.plannedStart}</div>
                        <div className="text-muted-foreground">→ {task.plannedEnd}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1.5">
                          {/* Planned bar */}
                          <div>
                            <div className="flex justify-between text-2xs mb-0.5">
                              <span className="text-muted-foreground">Planned</span>
                              <span className="text-muted-foreground">{task.plannedPct}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-muted-foreground/40 rounded-full" style={{ width: `${task.plannedPct}%` }} />
                            </div>
                          </div>
                          {/* Actual bar */}
                          <div>
                            <div className="flex justify-between text-2xs mb-0.5">
                              <span className={cfg.text}>Actual</span>
                              <span className={`font-600 ${cfg.text}`}>{task.actualPct}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${task.actualPct}%` }} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {task.spi > 0 ? (
                          <span className={`font-700 ${task.spi >= 1 ? 'text-success' : task.spi >= 0.85 ? 'text-warning' : 'text-danger'}`}>
                            {task.spi.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {task.delayDays > 0 ? (
                          <span className="font-600 text-danger">+{task.delayDays}d</span>
                        ) : task.delayDays < 0 ? (
                          <span className="font-600 text-success">{task.delayDays}d</span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-500 border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{task.assignee}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SPI trend note */}
        <div className="card-elevated p-4 border-l-4 border-warning bg-warning/5">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-warning flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-600 text-foreground">Schedule Intelligence Alert</div>
              <div className="text-xs text-muted-foreground mt-1">
                Zone D foundation work is critically delayed (SPI 0.61, +22 days). This will cascade to structural erection and mechanical installation. Recommend resource reallocation from Zone E (not yet started) to Zone D to recover schedule.
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
