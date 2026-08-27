'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import Badge from '@/components/ui/Badge';
import { ShieldCheck, Grid3X3, Activity, Camera, Calendar, AlertCircle, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useProject } from '@/contexts/ProjectContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DimensionScore {
  id: string;
  label: string;
  shortLabel: string;
  score: number;
  weight: number;
  icon: React.ReactNode;
  color: string;
  description: string;
  issues: string[];
}

interface ZoneScore {
  zone: string;
  grid: number;
  activity: number;
  dpr: number;
  photo: number;
  schedule: number;
  composite: number;
  trend: 'up' | 'down' | 'stable';
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const dimensions: DimensionScore[] = [
  {
    id: 'grid',
    label: 'Grid Completion',
    shortLabel: 'Grid',
    score: 78,
    weight: 20,
    icon: <Grid3X3 size={16} />,
    color: '#6366f1',
    description: 'Zone × Activity matrix completion rate with dependency sequencing compliance',
    issues: ['Zone D structural blocked — dependency unresolved', 'Zone E & F not yet initiated'],
  },
  {
    id: 'activity',
    label: 'Activity Quality',
    shortLabel: 'Activity',
    score: 72,
    weight: 25,
    icon: <Activity size={16} />,
    color: '#0ea5e9',
    description: 'Workmanship quality, material compliance, and inspection sign-off rates',
    issues: ['Zone C rebar spacing non-conformance flagged', 'Zone D soil bearing test pending'],
  },
  {
    id: 'dpr',
    label: 'DPR Compliance',
    shortLabel: 'DPR',
    score: 81,
    weight: 20,
    icon: <BarChart3 size={16} />,
    color: '#f59e0b',
    description: 'Daily progress report submission rate, accuracy, and timeliness',
    issues: ['2 DPR entries pending verification', 'Zone D DPR achievement vs plan gap >30%'],
  },
  {
    id: 'photo',
    label: 'Photo Evidence',
    shortLabel: 'Photo',
    score: 68,
    weight: 20,
    icon: <Camera size={16} />,
    color: '#10b981',
    description: 'Geo-tagged photo evidence quality, coverage, and verification status',
    issues: ['Zone C & D evidence flagged for non-conformance', 'Average photo score below 70 threshold'],
  },
  {
    id: 'schedule',
    label: 'Schedule Adherence',
    shortLabel: 'Schedule',
    score: 71,
    weight: 15,
    icon: <Calendar size={16} />,
    color: '#ef4444',
    description: 'SPI-based schedule performance across all active zones and activities',
    issues: ['Zone D SPI 0.61 — critical delay', 'Zone A mechanical at risk (+14 days)'],
  },
];

const zoneScores: ZoneScore[] = [
  { zone: 'Zone A', grid: 88, activity: 85, dpr: 91, photo: 86, schedule: 82, composite: 86, trend: 'up' },
  { zone: 'Zone B', grid: 82, activity: 80, dpr: 88, photo: 84, schedule: 88, composite: 84, trend: 'stable' },
  { zone: 'Zone C', grid: 65, activity: 58, dpr: 72, photo: 52, schedule: 74, composite: 64, trend: 'down' },
  { zone: 'Zone D', grid: 42, activity: 44, dpr: 55, photo: 44, schedule: 38, composite: 45, trend: 'down' },
  { zone: 'Zone E', grid: 0, activity: 0, dpr: 0, photo: 0, schedule: 0, composite: 0, trend: 'stable' },
  { zone: 'Zone F', grid: 0, activity: 0, dpr: 0, photo: 0, schedule: 0, composite: 0, trend: 'stable' },
];

const radarData = dimensions.map(d => ({
  subject: d.shortLabel,
  score: d.score,
  fullMark: 100,
}));

const barData = zoneScores.filter(z => z.composite > 0).map(z => ({
  zone: z.zone,
  Grid: z.grid,
  Activity: z.activity,
  DPR: z.dpr,
  Photo: z.photo,
  Schedule: z.schedule,
}));

const COLORS = ['#6366f1', '#0ea5e9', '#f59e0b', '#10b981', '#ef4444'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function compositeScore(dims: DimensionScore[]) {
  return Math.round(dims.reduce((sum, d) => sum + (d.score * d.weight) / 100, 0));
}

function scoreGrade(score: number): { grade: string; color: string; bg: string } {
  if (score >= 90) return { grade: 'A+', color: 'text-success', bg: 'bg-success/15' };
  if (score >= 80) return { grade: 'A', color: 'text-success', bg: 'bg-success/10' };
  if (score >= 70) return { grade: 'B', color: 'text-accent', bg: 'bg-accent/10' };
  if (score >= 60) return { grade: 'C', color: 'text-warning', bg: 'bg-warning/10' };
  if (score >= 50) return { grade: 'D', color: 'text-danger', bg: 'bg-danger/10' };
  return { grade: 'F', color: 'text-danger', bg: 'bg-danger/15' };
}

function scoreBarColor(score: number) {
  if (score >= 80) return 'bg-success';
  if (score >= 70) return 'bg-accent';
  if (score >= 55) return 'bg-warning';
  return 'bg-danger';
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function IndustrialVerificationPage() {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const composite = compositeScore(dimensions);
  const grade = scoreGrade(composite);
  const { selectedProject } = useProject();

  return (
    <AppLayout currentPath="/industrial-verification">
      <Topbar
        title="Industrial KARTAA Score"
        subtitle={`Verification Score — Grid + Activity + DPR + Photo Evidence + Schedule — ${selectedProject.name}`}
      />
      <div className="px-6 xl:px-8 2xl:px-10 py-6 max-w-screen-2xl mx-auto space-y-6">

        {/* Hero score card */}
        <div className="card-elevated p-6">
          <div className="flex flex-wrap items-center gap-6">
            {/* Composite score */}
            <div className="flex items-center gap-5">
              <div className={`w-24 h-24 rounded-2xl ${grade.bg} flex flex-col items-center justify-center border-2 ${composite >= 70 ? 'border-success/30' : composite >= 55 ? 'border-warning/30' : 'border-danger/30'}`}>
                <span className={`text-3xl font-800 ${grade.color}`}>{composite}</span>
                <span className="text-xs text-muted-foreground font-500">/100</span>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">KARTAA Verification Score</div>
                <div className="text-2xl font-700 text-foreground">Industrial Grade <span className={grade.color}>{grade.grade}</span></div>
                <div className="text-sm text-muted-foreground mt-1">Greenfield Steel Plant — Phase 1</div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="warning" size="sm">Industrial</Badge>
                  <Badge variant="default" size="sm">5-Dimension Score</Badge>
                </div>
              </div>
            </div>

            {/* Dimension pills */}
            <div className="ml-auto flex flex-wrap gap-2">
              {dimensions.map(d => {
                const g = scoreGrade(d.score);
                return (
                  <div key={d.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${g.bg} ${g.color === 'text-success' ? 'border-success/20' : g.color === 'text-warning' ? 'border-warning/20' : 'border-danger/20'}`}>
                    <span className={g.color}>{d.icon}</span>
                    <div>
                      <div className="text-2xs text-muted-foreground">{d.shortLabel}</div>
                      <div className={`text-sm font-700 ${g.color}`}>{d.score}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Composite bar */}
          <div className="mt-5">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Composite Score (weighted)</span>
              <span className={`font-700 ${grade.color}`}>{composite}/100</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${scoreBarColor(composite)}`}
                style={{ width: `${composite}%` }}
              />
            </div>
            <div className="flex justify-between text-2xs text-muted-foreground mt-1">
              <span>0 — Unverified</span>
              <span>55 — Acceptable</span>
              <span>70 — Good</span>
              <span>85 — Excellent</span>
              <span>100 — Perfect</span>
            </div>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Radar */}
          <div className="card-elevated p-5">
            <h3 className="text-sm font-600 text-foreground mb-1">Verification Dimension Radar</h3>
            <p className="text-xs text-muted-foreground mb-4">5-dimension score profile for this project</p>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Zone bar chart */}
          <div className="card-elevated p-5">
            <h3 className="text-sm font-600 text-foreground mb-1">Zone-wise Dimension Breakdown</h3>
            <p className="text-xs text-muted-foreground mb-4">Active zones only (E & F not started)</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} barSize={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="zone" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {['Grid', 'Activity', 'DPR', 'Photo', 'Schedule'].map((key, i) => (
                  <Bar key={key} dataKey={key} fill={COLORS[i]} radius={[2, 2, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dimension detail cards */}
        <div>
          <h3 className="text-sm font-600 text-foreground mb-3">Dimension-wise Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {dimensions.map(d => {
              const g = scoreGrade(d.score);
              return (
                <div key={d.id} className="card-elevated p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${g.bg}`}>
                        <span className={g.color}>{d.icon}</span>
                      </div>
                      <div>
                        <div className="text-sm font-600 text-foreground">{d.label}</div>
                        <div className="text-2xs text-muted-foreground">Weight: {d.weight}%</div>
                      </div>
                    </div>
                    <div className={`text-2xl font-800 ${g.color}`}>{d.score}</div>
                  </div>

                  <div className="mb-3">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${scoreBarColor(d.score)}`} style={{ width: `${d.score}%` }} />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">{d.description}</p>

                  {d.issues.length > 0 && (
                    <div className="space-y-1.5">
                      {d.issues.map((issue, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-2xs text-danger">
                          <AlertCircle size={11} className="flex-shrink-0 mt-0.5" />
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Zone score table */}
        <div className="card-elevated overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-600 text-foreground">Zone-wise KARTAA Scores</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Click a zone row to drill down</p>
            </div>
            <ShieldCheck size={16} className="text-muted-foreground" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-muted-foreground font-600">Zone</th>
                  <th className="text-center px-4 py-3 text-muted-foreground font-600">Grid</th>
                  <th className="text-center px-4 py-3 text-muted-foreground font-600">Activity</th>
                  <th className="text-center px-4 py-3 text-muted-foreground font-600">DPR</th>
                  <th className="text-center px-4 py-3 text-muted-foreground font-600">Photo</th>
                  <th className="text-center px-4 py-3 text-muted-foreground font-600">Schedule</th>
                  <th className="text-center px-4 py-3 text-muted-foreground font-600">Composite</th>
                  <th className="text-center px-4 py-3 text-muted-foreground font-600">Grade</th>
                  <th className="text-center px-4 py-3 text-muted-foreground font-600">Trend</th>
                </tr>
              </thead>
              <tbody>
                {zoneScores.map((z, i) => {
                  const g = scoreGrade(z.composite);
                  const isNA = z.composite === 0;
                  return (
                    <tr
                      key={z.zone}
                      onClick={() => setSelectedZone(selectedZone === z.zone ? null : z.zone)}
                      className={`border-b border-border/50 cursor-pointer transition-colors ${
                        selectedZone === z.zone ? 'bg-primary/5' : i % 2 === 0 ? 'hover:bg-muted/20' : 'bg-muted/10 hover:bg-muted/20'
                      }`}
                    >
                      <td className="px-4 py-3 font-600 text-foreground">{z.zone}</td>
                      {(['grid', 'activity', 'dpr', 'photo', 'schedule'] as const).map(dim => (
                        <td key={dim} className="px-4 py-3 text-center">
                          {isNA ? (
                            <span className="text-muted-foreground/30">—</span>
                          ) : (
                            <span className={`font-600 ${scoreGrade(z[dim]).color}`}>{z[dim]}</span>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center">
                        {isNA ? (
                          <span className="text-muted-foreground/30">N/A</span>
                        ) : (
                          <span className={`text-base font-800 ${g.color}`}>{z.composite}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isNA ? (
                          <span className="text-2xs text-muted-foreground/40">—</span>
                        ) : (
                          <span className={`text-sm font-700 px-2 py-0.5 rounded ${g.bg} ${g.color}`}>{g.grade}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {z.trend === 'up' && <TrendingUp size={14} className="text-success mx-auto" />}
                        {z.trend === 'down' && <TrendingDown size={14} className="text-danger mx-auto" />}
                        {z.trend === 'stable' && <span className="text-muted-foreground/40 text-xs">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* KARTAA principle */}
        <div className="card-elevated p-4 border-l-4 border-primary bg-primary/5">
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-600 text-foreground">KARTAA Industrial Verification Principle</div>
              <div className="text-xs text-muted-foreground mt-1">
                The Industrial KARTAA Score is a composite of 5 weighted dimensions: Grid Completion (20%), Activity Quality (25%), DPR Compliance (20%), Photo Evidence (20%), and Schedule Adherence (15%). A score below 60 triggers mandatory PM review. Scores are never auto-certified — all flagged items require human sign-off.
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
