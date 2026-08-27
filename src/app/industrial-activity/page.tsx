'use client';
import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import Badge from '@/components/ui/Badge';
import { Grid3X3, CheckCircle2, Clock, XCircle, Filter, Download, Plus, Activity, Layers, Wrench, Zap, Droplets, Wind, Building2, BarChart3, TrendingUp, ShieldCheck, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRealtimeKartaa } from '@/hooks/useRealtimeKartaa';
import { useProject } from '@/contexts/ProjectContext';

// ─── Types ────────────────────────────────────────────────────────────────────
type CellStatus = 'completed' | 'in-progress' | 'pending' | 'blocked' | 'na';

interface GridCell {
  zone: string;
  activity: string;
  status: CellStatus;
  progress: number;
  assignee: string;
  lastUpdated: string;
  kartaaScore?: number;
}

interface ActivityCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

// ─── Static project info ──────────────────────────────────────────────────────
const project = {
  name: 'Greenfield Steel Plant — Phase 1',
  code: 'SAIL-RJT-2024-011',
  location: 'Rourkela, Odisha',
  totalArea: '4,20,000 m²',
  progress: 61.4,
  kartaaScore: 74,
  activeZones: 8,
  totalActivities: 48,
};

const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E', 'Zone F'];

const activityCategories: ActivityCategory[] = [
  { id: 'civil', label: 'Civil Works', icon: <Building2 size={14} />, color: 'text-primary' },
  { id: 'structural', label: 'Structural Steel', icon: <Layers size={14} />, color: 'text-accent' },
  { id: 'mechanical', label: 'Mechanical', icon: <Wrench size={14} />, color: 'text-warning' },
  { id: 'electrical', label: 'Electrical', icon: <Zap size={14} />, color: 'text-info' },
  { id: 'plumbing', label: 'Plumbing & Fire', icon: <Droplets size={14} />, color: 'text-success' },
  { id: 'hvac', label: 'HVAC', icon: <Wind size={14} />, color: 'text-muted-foreground' },
  { id: 'finishing', label: 'Finishing', icon: <Grid3X3 size={14} />, color: 'text-danger' },
  { id: 'commissioning', label: 'Commissioning', icon: <Activity size={14} />, color: 'text-primary' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function statusConfig(status: CellStatus) {
  switch (status) {
    case 'completed': return { bg: 'bg-success/15', border: 'border-success/30', text: 'text-success', icon: <CheckCircle2 size={12} />, label: 'Completed' };
    case 'in-progress': return { bg: 'bg-primary/12', border: 'border-primary/30', text: 'text-primary', icon: <Clock size={12} />, label: 'In Progress' };
    case 'pending': return { bg: 'bg-muted/60', border: 'border-border', text: 'text-muted-foreground', icon: <Clock size={12} />, label: 'Pending' };
    case 'blocked': return { bg: 'bg-danger/12', border: 'border-danger/30', text: 'text-danger', icon: <XCircle size={12} />, label: 'Blocked' };
    case 'na': return { bg: 'bg-transparent', border: 'border-border/30', text: 'text-muted-foreground/30', icon: null, label: 'N/A' };
  }
}

function scoreColor(score: number) {
  if (score >= 85) return 'text-success';
  if (score >= 70) return 'text-accent';
  if (score >= 55) return 'text-warning';
  return 'text-danger';
}

// ─── DB row → GridCell ────────────────────────────────────────────────────────
function rowToCell(row: any): GridCell {
  return {
    zone: row.zone,
    activity: row.activity,
    status: row.cell_status as CellStatus,
    progress: row.progress,
    assignee: row.assignee,
    lastUpdated: row.last_updated,
    kartaaScore: row.kartaa_score ?? undefined,
  };
}

// ─── Cell Detail Panel ────────────────────────────────────────────────────────
function CellDetailPanel({ cell, onClose }: { cell: GridCell; onClose: () => void }) {
  const cfg = statusConfig(cell.status);
  const cat = activityCategories.find(a => a.id === cell.activity);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="card-elevated p-6 w-80 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-muted-foreground">{cell.zone}</div>
            <div className="text-sm font-600 text-foreground">{cat?.label}</div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
            <XCircle size={16} className="text-muted-foreground" />
          </button>
        </div>
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-500 ${cfg.bg} ${cfg.text} border ${cfg.border} mb-4`}>
          {cfg.icon}
          {cfg.label}
        </div>
        {cell.status !== 'na' && cell.status !== 'pending' && (
          <>
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-600 text-foreground">{cell.progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${cell.progress}%` }} />
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assignee</span>
                <span className="font-500 text-foreground">{cell.assignee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-500 text-foreground">{cell.lastUpdated}</span>
              </div>
              {cell.kartaaScore && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">KARTAA Score</span>
                  <span className={`font-700 ${scoreColor(cell.kartaaScore)}`}>{cell.kartaaScore}/100</span>
                </div>
              )}
            </div>
          </>
        )}
        {cell.status === 'na' && (
          <p className="text-xs text-muted-foreground">This activity is not applicable for {cell.zone}.</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function IndustrialActivityPage() {
  const [selectedCell, setSelectedCell] = useState<GridCell | null>(null);
  const [filterStatus, setFilterStatus] = useState<CellStatus | 'all'>('all');
  const [gridData, setGridData] = useState<Record<string, Record<string, GridCell>>>({});
  const [loading, setLoading] = useState(true);
  const [liveIndicator, setLiveIndicator] = useState(false);
  const supabase = createClient();
  const { selectedProject } = useProject();

  const buildGridFromRows = useCallback((rows: any[]) => {
    const grid: Record<string, Record<string, GridCell>> = {};
    rows.forEach(row => {
      if (!grid[row.zone]) grid[row.zone] = {};
      grid[row.zone][row.activity] = rowToCell(row);
    });
    return grid;
  }, []);

  const fetchGrid = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_grid_cells')
        .select('*')
        .order('zone', { ascending: true });
      if (!error && data && data.length > 0) {
        setGridData(buildGridFromRows(data));
      }
    } catch {
      // keep empty grid
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrid();
  }, []);

  // Real-time updates
  useRealtimeKartaa({
    table: 'activity_grid_cells',
    onUpdate: (updated: any) => {
      setGridData(prev => {
        const next = { ...prev };
        if (!next[updated.zone]) next[updated.zone] = {};
        next[updated.zone] = { ...next[updated.zone], [updated.activity]: rowToCell(updated) };
        return next;
      });
      setLiveIndicator(true);
      setTimeout(() => setLiveIndicator(false), 2000);
    },
    onInsert: (inserted: any) => {
      setGridData(prev => {
        const next = { ...prev };
        if (!next[inserted.zone]) next[inserted.zone] = {};
        next[inserted.zone] = { ...next[inserted.zone], [inserted.activity]: rowToCell(inserted) };
        return next;
      });
      setLiveIndicator(true);
      setTimeout(() => setLiveIndicator(false), 2000);
    },
  });

  const kpis = [
    { label: 'Overall Progress', value: `${project.progress}%`, sub: 'vs 70% planned', icon: <TrendingUp size={16} />, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'KARTAA Score', value: `${project.kartaaScore}/100`, sub: 'Grid + Activity + Evidence', icon: <ShieldCheck size={16} />, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Active Zones', value: `${project.activeZones}/6`, sub: '2 zones pending start', icon: <Grid3X3 size={16} />, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Total Activities', value: `${project.totalActivities}`, sub: '18 completed · 12 active', icon: <Activity size={16} />, color: 'text-info', bg: 'bg-info/10' },
  ];

  const statusCounts = { completed: 0, 'in-progress': 0, pending: 0, blocked: 0, na: 0 };
  zones.forEach(z => {
    activityCategories.forEach(a => {
      const cell = gridData[z]?.[a.id];
      if (cell) statusCounts[cell.status]++;
    });
  });

  return (
    <AppLayout currentPath="/industrial-activity">
      <Topbar title="Industrial Activity Grid" subtitle={`${selectedProject.name} · ${selectedProject.code}`} />
      <div className="px-6 xl:px-8 2xl:px-10 py-6 max-w-screen-2xl mx-auto space-y-6">

        {/* Project banner */}
        <div className="card-elevated p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
              <Building2 size={20} className="text-accent" />
            </div>
            <div>
              <div className="text-sm font-600 text-foreground">{project.name}</div>
              <div className="text-xs text-muted-foreground">{project.location} · {project.totalArea}</div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-2xs text-muted-foreground">
              <RefreshCw size={10} className={`${liveIndicator ? 'text-success animate-spin' : 'text-success animate-pulse'}`} />
              <span>Live grid — WebSocket</span>
            </div>
            <Badge variant="warning" size="sm">Industrial</Badge>
            <Badge variant="success" size="sm">Active</Badge>
          </div>
        </div>

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

        {/* Status legend + filter */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-600 text-muted-foreground uppercase tracking-wider">Filter:</span>
          {(['all', 'completed', 'in-progress', 'pending', 'blocked'] as const).map(s => {
            const cfg = s === 'all' ? null : statusConfig(s);
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
                {s === 'all' ? 'All' : cfg?.label}
                <span className="ml-1 opacity-70">
                  {s === 'all' ? zones.length * activityCategories.length : statusCounts[s]}
                </span>
              </button>
            );
          })}
          <div className="ml-auto flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:border-primary/40 transition-colors">
              <Filter size={13} /> Filter Zone
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:border-primary/40 transition-colors">
              <Download size={13} /> Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-500 hover:bg-primary/90 transition-colors">
              <Plus size={13} /> Log Activity
            </button>
          </div>
        </div>

        {/* Activity Grid */}
        <div className="card-elevated overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-600 text-foreground">Zone × Activity Matrix</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {loading ? 'Loading live data…' : `Click any cell to view details · ${zones.length} zones × ${activityCategories.length} activity types`}
              </p>
            </div>
            <BarChart3 size={16} className="text-muted-foreground" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-muted-foreground font-600 w-24 sticky left-0 bg-muted/30 z-10">Zone</th>
                  {activityCategories.map(cat => (
                    <th key={cat.id} className="px-3 py-3 text-center min-w-[110px]">
                      <div className={`flex flex-col items-center gap-1 ${cat.color}`}>
                        {cat.icon}
                        <span className="text-2xs font-600 text-muted-foreground leading-tight">{cat.label}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {zones.map((zone, zi) => (
                  <tr key={zone} className={`border-b border-border/50 ${zi % 2 === 0 ? '' : 'bg-muted/10'}`}>
                    <td className="px-4 py-3 font-600 text-foreground sticky left-0 bg-card z-10 border-r border-border/30">
                      <div className="text-xs">{zone}</div>
                    </td>
                    {activityCategories.map(cat => {
                      const cell = gridData[zone]?.[cat.id];
                      if (!cell) return (
                        <td key={cat.id} className="px-3 py-3 text-center">
                          <span className="text-muted-foreground/30">—</span>
                        </td>
                      );
                      const cfg = statusConfig(cell.status);
                      const show = filterStatus === 'all' || cell.status === filterStatus;
                      return (
                        <td key={cat.id} className="px-2 py-2 text-center">
                          <button
                            onClick={() => setSelectedCell(cell)}
                            className={`w-full min-h-[52px] rounded-lg border transition-all hover:scale-105 hover:shadow-md ${cfg.bg} ${cfg.border} ${show ? 'opacity-100' : 'opacity-20'} flex flex-col items-center justify-center gap-1 p-2`}
                          >
                            <span className={cfg.text}>{cfg.icon}</span>
                            {cell.status !== 'na' && cell.status !== 'pending' && (
                              <span className={`text-2xs font-700 ${cfg.text}`}>{cell.progress}%</span>
                            )}
                            {cell.status === 'na' && <span className="text-2xs text-muted-foreground/40">N/A</span>}
                            {cell.status === 'pending' && <span className="text-2xs text-muted-foreground/60">—</span>}
                            {cell.kartaaScore && (
                              <span className={`text-2xs font-600 ${scoreColor(cell.kartaaScore)}`}>{cell.kartaaScore}</span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Legend */}
          <div className="px-4 py-3 border-t border-border bg-muted/20 flex flex-wrap gap-4">
            {(['completed', 'in-progress', 'pending', 'blocked', 'na'] as CellStatus[]).map(s => {
              const cfg = statusConfig(s);
              return (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`w-4 h-4 rounded border ${cfg.bg} ${cfg.border}`} />
                  <span className="text-2xs text-muted-foreground">{cfg.label}</span>
                </div>
              );
            })}
            <span className="text-2xs text-muted-foreground ml-2">· Number = KARTAA Score</span>
          </div>
        </div>

        {/* Zone summary cards */}
        <div>
          <h3 className="text-sm font-600 text-foreground mb-3">Zone-wise Summary</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {zones.map(zone => {
              const cells = activityCategories.map(a => gridData[zone]?.[a.id]).filter(Boolean) as GridCell[];
              const done = cells.filter(c => c.status === 'completed').length;
              const active = cells.filter(c => c.status === 'in-progress').length;
              const blocked = cells.filter(c => c.status === 'blocked').length;
              const applicable = cells.filter(c => c.status !== 'na').length;
              const pct = applicable > 0 ? Math.round((done / applicable) * 100) : 0;
              const scores = cells.filter(c => c.kartaaScore).map(c => c.kartaaScore!);
              const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
              return (
                <div key={zone} className="card-elevated p-4">
                  <div className="text-sm font-700 text-foreground mb-1">{zone}</div>
                  <div className="text-xl font-700 text-primary mb-1">{pct}%</div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="space-y-0.5 text-2xs text-muted-foreground">
                    <div className="flex justify-between"><span>Done</span><span className="text-success font-600">{done}</span></div>
                    <div className="flex justify-between"><span>Active</span><span className="text-primary font-600">{active}</span></div>
                    {blocked > 0 && <div className="flex justify-between"><span>Blocked</span><span className="text-danger font-600">{blocked}</span></div>}
                    {avgScore && <div className="flex justify-between"><span>Score</span><span className={`font-700 ${scoreColor(avgScore)}`}>{avgScore}</span></div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {selectedCell && (
        <CellDetailPanel cell={selectedCell} onClose={() => setSelectedCell(null)} />
      )}
    </AppLayout>
  );
}
