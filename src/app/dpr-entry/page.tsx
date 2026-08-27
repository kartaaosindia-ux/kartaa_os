'use client';
import React, { useState, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import { FileText, Plus, CheckCircle2, Send, Save, Camera, X, Sun, Cloud, CloudRain, Wind, Wrench, AlertTriangle, TrendingUp, Calendar, Target, Layers } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';

// ─── Types ────────────────────────────────────────────────────────────────────
type Shift = 'Day' | 'Night';
type Weather = 'Clear' | 'Partly Cloudy' | 'Overcast' | 'Rain' | 'Heavy Rain' | 'Windy' | 'Fog';
type DelayReason = 'None' | 'Weather' | 'Material Delay' | 'Drawing Issue' | 'Labour Shortage' | 'Equipment Breakdown' | 'Safety Hold' | 'Client Instruction' | 'Utility Conflict';

interface BaselineActivity {
  activity_id: string;
  activity_name: string;
  planned_daily_target_qty: number;
  unit: string;
  location: string;
}

interface WorkRow {
  id: string;
  activity_id: string;
  activity_name: string;
  location: string;
  unit: string;
  planned_daily_target: number;
  actual_qty: string;
}

interface DPRRecord {
  id: string;
  date: string;
  shift: Shift;
  weather: Weather;
  engineer: string;
  work_rows: WorkRow[];
  labour_count: number;
  machinery_hours: number;
  delay_reason: DelayReason;
  delay_notes: string;
  photo_count: number;
  submitted_at: string;
}

// ─── Baseline activities (from Master Plan) ───────────────────────────────────
const BASELINE_ACTIVITIES: BaselineActivity[] = [
  { activity_id: 'ACT-001', activity_name: 'RCC Foundation — Zone A', planned_daily_target_qty: 45, unit: 'm³', location: 'Zone A' },
  { activity_id: 'ACT-002', activity_name: 'Structural Steel Erection', planned_daily_target_qty: 12, unit: 'MT', location: 'Zone A, B' },
  { activity_id: 'ACT-003', activity_name: 'Electrical Cable Laying', planned_daily_target_qty: 320, unit: 'm', location: 'Zone A' },
  { activity_id: 'ACT-004', activity_name: 'Mechanical Equipment Installation', planned_daily_target_qty: 1, unit: 'units', location: 'Zone B, C' },
  { activity_id: 'ACT-005', activity_name: 'RCC Columns & Beams — Zone B', planned_daily_target_qty: 60, unit: 'm³', location: 'Zone B' },
  { activity_id: 'ACT-006', activity_name: 'Brick Masonry — External Walls', planned_daily_target_qty: 180, unit: 'm²', location: 'Zone A, B, C' },
  { activity_id: 'ACT-007', activity_name: 'Plumbing & Sanitation', planned_daily_target_qty: 85, unit: 'm', location: 'All Zones' },
  { activity_id: 'ACT-008', activity_name: 'Flooring — Vitrified Tiles', planned_daily_target_qty: 220, unit: 'm²', location: 'Zone A, B' },
];

// ─── Demo submitted DPRs ──────────────────────────────────────────────────────
const DEMO_DPRS: DPRRecord[] = [
  {
    id: 'DPR-2026-001', date: '26 Aug 2026', shift: 'Day', weather: 'Clear', engineer: 'P. Nair',
    work_rows: [
      { id: 'wr-1', activity_id: 'ACT-001', activity_name: 'RCC Foundation — Zone A', location: 'Zone A / Grid F1-F6', unit: 'm³', planned_daily_target: 45, actual_qty: '38' },
      { id: 'wr-2', activity_id: 'ACT-002', activity_name: 'Structural Steel Erection', location: 'Zone A / Column Grid A1-A5', unit: 'MT', planned_daily_target: 12, actual_qty: '10' },
    ],
    labour_count: 42, machinery_hours: 14, delay_reason: 'Weather', delay_notes: 'Wind speed exceeded 35 km/h post 14:00',
    photo_count: 6, submitted_at: '26 Aug 2026, 18:30',
  },
  {
    id: 'DPR-2026-002', date: '25 Aug 2026', shift: 'Day', weather: 'Partly Cloudy', engineer: 'A. Patel',
    work_rows: [
      { id: 'wr-3', activity_id: 'ACT-003', activity_name: 'Electrical Cable Laying', location: 'Zone A / Sector A2', unit: 'm', planned_daily_target: 320, actual_qty: '290' },
    ],
    labour_count: 18, machinery_hours: 8, delay_reason: 'None', delay_notes: '',
    photo_count: 4, submitted_at: '25 Aug 2026, 17:45',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function weatherIcon(w: Weather) {
  switch (w) {
    case 'Clear': return <Sun size={14} className="text-warning" />;
    case 'Rain': case 'Heavy Rain': return <CloudRain size={14} className="text-info" />;
    case 'Windy': return <Wind size={14} className="text-muted-foreground" />;
    default: return <Cloud size={14} className="text-muted-foreground" />;
  }
}

function variancePct(actual: string, planned: number): number | null {
  const a = parseFloat(actual);
  if (isNaN(a) || planned === 0) return null;
  return ((a - planned) / planned) * 100;
}

function newWorkRow(): WorkRow {
  return { id: `wr-${Date.now()}`, activity_id: '', activity_name: '', location: '', unit: '', planned_daily_target: 0, actual_qty: '' };
}

// ─── DPR Form ─────────────────────────────────────────────────────────────────
function DPRForm({ onSubmit, onCancel }: { onSubmit: (dpr: DPRRecord) => void; onCancel: () => void }) {
  const [date, setDate] = useState('2026-08-27');
  const [shift, setShift] = useState<Shift>('Day');
  const [weather, setWeather] = useState<Weather>('Clear');
  const [engineer, setEngineer] = useState('');
  const [workRows, setWorkRows] = useState<WorkRow[]>([newWorkRow()]);
  const [labourCount, setLabourCount] = useState('');
  const [machineryHours, setMachineryHours] = useState('');
  const [delayReason, setDelayReason] = useState<DelayReason>('None');
  const [delayNotes, setDelayNotes] = useState('');
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  function handleActivitySelect(rowId: string, activityId: string) {
    const act = BASELINE_ACTIVITIES.find(a => a.activity_id === activityId);
    setWorkRows(prev => prev.map(r => r.id === rowId ? {
      ...r,
      activity_id: activityId,
      activity_name: act?.activity_name || '',
      unit: act?.unit || '',
      planned_daily_target: act?.planned_daily_target_qty || 0,
      location: act?.location || '',
    } : r));
  }

  function addWorkRow() {
    setWorkRows(prev => [...prev, newWorkRow()]);
  }

  function removeWorkRow(id: string) {
    setWorkRows(prev => prev.filter(r => r.id !== id));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dpr: DPRRecord = {
      id: `DPR-2026-${String(DEMO_DPRS.length + 3).padStart(3, '0')}`,
      date: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      shift, weather, engineer, work_rows: workRows,
      labour_count: parseInt(labourCount) || 0,
      machinery_hours: parseFloat(machineryHours) || 0,
      delay_reason: delayReason, delay_notes: delayNotes,
      photo_count: photoFiles.length,
      submitted_at: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
    setSubmitted(true);
    setTimeout(() => { onSubmit(dpr); }, 1400);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center">
          <CheckCircle2 size={28} className="text-success" />
        </div>
        <p className="text-base font-600 text-foreground">DPR Submitted Successfully</p>
        <p className="text-xs text-muted-foreground">Variance engine computing results…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Header Fields ── */}
      <div className="card-elevated p-5 space-y-4">
        <h3 className="text-sm font-600 text-foreground flex items-center gap-2">
          <FileText size={15} className="text-primary" /> Header Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Date <span className="text-danger">*</span></label>
            <input type="date" required className="form-input mt-1" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Shift <span className="text-danger">*</span></label>
            <select required className="form-input mt-1" value={shift} onChange={e => setShift(e.target.value as Shift)}>
              <option value="Day">Day Shift</option>
              <option value="Night">Night Shift</option>
            </select>
          </div>
          <div>
            <label className="form-label">Weather Conditions</label>
            <select className="form-input mt-1" value={weather} onChange={e => setWeather(e.target.value as Weather)}>
              {(['Clear', 'Partly Cloudy', 'Overcast', 'Rain', 'Heavy Rain', 'Windy', 'Fog'] as Weather[]).map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Site Manager / Engineer <span className="text-danger">*</span></label>
            <input type="text" required placeholder="e.g. P. Nair" className="form-input mt-1" value={engineer} onChange={e => setEngineer(e.target.value)} />
          </div>
        </div>
      </div>

      {/* ── Work Execution Table ── */}
      <div className="card-elevated p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-600 text-foreground flex items-center gap-2">
            <Target size={15} className="text-accent" /> Work Execution
          </h3>
          <button type="button" onClick={addWorkRow} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-500 hover:bg-primary/20 transition-colors">
            <Plus size={13} /> Add Activity
          </button>
        </div>

        <div className="space-y-3">
          {workRows.map((row, idx) => {
            const vPct = variancePct(row.actual_qty, row.planned_daily_target);
            return (
              <div key={row.id} className="border border-border rounded-xl p-4 space-y-3 bg-muted/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-600 text-muted-foreground">Activity #{idx + 1}</span>
                  {workRows.length > 1 && (
                    <button type="button" onClick={() => removeWorkRow(row.id)} className="p-1 rounded hover:bg-muted transition-colors">
                      <X size={13} className="text-muted-foreground" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="lg:col-span-2">
                    <label className="form-label">Select Activity (from Master Schedule) <span className="text-danger">*</span></label>
                    <select
                      required
                      className="form-input mt-1"
                      value={row.activity_id}
                      onChange={e => handleActivitySelect(row.id, e.target.value)}
                    >
                      <option value="">— Select Activity —</option>
                      {BASELINE_ACTIVITIES.map(a => (
                        <option key={a.activity_id} value={a.activity_id}>{a.activity_id} — {a.activity_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Work Location / Grid</label>
                    <input type="text" placeholder="e.g. Zone A / Grid F1-F6" className="form-input mt-1" value={row.location} onChange={e => setWorkRows(prev => prev.map(r => r.id === row.id ? { ...r, location: e.target.value } : r))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="form-label">Unit</label>
                    <input type="text" readOnly className="form-input mt-1 bg-muted/50 cursor-not-allowed" value={row.unit} placeholder="Auto-filled" />
                  </div>
                  <div>
                    <label className="form-label">Planned Daily Target</label>
                    <div className="relative mt-1">
                      <input type="number" readOnly className="form-input bg-muted/50 cursor-not-allowed pr-8" value={row.planned_daily_target || ''} placeholder="Auto-filled" />
                      {row.planned_daily_target > 0 && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-2xs text-accent font-500">✓</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Actual Executed Qty <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required={!!row.activity_id}
                      placeholder="Enter qty"
                      className="form-input mt-1"
                      value={row.actual_qty}
                      onChange={e => setWorkRows(prev => prev.map(r => r.id === row.id ? { ...r, actual_qty: e.target.value } : r))}
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    {vPct !== null && (
                      <div className={`mt-1 px-3 py-2 rounded-lg text-center border ${vPct >= 0 ? 'bg-success/10 border-success/30' : 'bg-danger/10 border-danger/30'}`}>
                        <div className={`text-sm font-700 ${vPct >= 0 ? 'text-success' : 'text-danger'}`}>
                          {vPct >= 0 ? '+' : ''}{vPct.toFixed(1)}%
                        </div>
                        <div className="text-2xs text-muted-foreground">Variance</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Resources & Blockers ── */}
      <div className="card-elevated p-5 space-y-4">
        <h3 className="text-sm font-600 text-foreground flex items-center gap-2">
          <Wrench size={15} className="text-warning" /> Resources & Blockers
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Labour Count Deployed</label>
            <input type="number" min="0" placeholder="0" className="form-input mt-1" value={labourCount} onChange={e => setLabourCount(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Machinery Deployed (hours)</label>
            <input type="number" min="0" step="0.5" placeholder="0.0" className="form-input mt-1" value={machineryHours} onChange={e => setMachineryHours(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Delay / Constraint Reason</label>
            <select className="form-input mt-1" value={delayReason} onChange={e => setDelayReason(e.target.value as DelayReason)}>
              {(['None', 'Weather', 'Material Delay', 'Drawing Issue', 'Labour Shortage', 'Equipment Breakdown', 'Safety Hold', 'Client Instruction', 'Utility Conflict'] as DelayReason[]).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
        {delayReason !== 'None' && (
          <div>
            <label className="form-label">Delay Notes</label>
            <textarea rows={2} placeholder="Describe the delay or constraint in detail…" className="form-input resize-none mt-1" value={delayNotes} onChange={e => setDelayNotes(e.target.value)} />
          </div>
        )}
      </div>

      {/* ── Site Photos ── */}
      <div className="card-elevated p-5 space-y-4">
        <h3 className="text-sm font-600 text-foreground flex items-center gap-2">
          <Camera size={15} className="text-info" /> Site Photo Evidence
        </h3>
        <div
          className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-info/40 hover:bg-muted/20 transition-all"
          onClick={() => photoInputRef.current?.click()}
        >
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => setPhotoFiles(prev => [...prev, ...Array.from(e.target.files || [])])}
          />
          <Camera size={24} className="text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Tap to upload site photos</p>
          <p className="text-xs text-muted-foreground/60 mt-1">JPG, PNG, WEBP — Multiple files</p>
        </div>
        {photoFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {photoFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-info/10 border border-info/20 text-xs text-info">
                <Camera size={12} />
                <span className="max-w-[120px] truncate">{f.name}</span>
                <button type="button" onClick={() => setPhotoFiles(prev => prev.filter((_, idx) => idx !== i))}>
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">
          Cancel
        </button>
        <button type="button" className="px-5 py-2.5 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2">
          <Save size={14} /> Save Draft
        </button>
        <button type="submit" className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2">
          <Send size={14} /> Submit DPR & Compute Variance
        </button>
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DPREntryPage() {
  const { selectedProject } = useProject();
  const [showForm, setShowForm] = useState(false);
  const [dprs, setDprs] = useState<DPRRecord[]>(DEMO_DPRS);

  function handleSubmit(dpr: DPRRecord) {
    setDprs(prev => [dpr, ...prev]);
    setShowForm(false);
  }

  const kpis = [
    { label: 'DPRs Filed', value: String(dprs.length), icon: <FileText size={16} />, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Today\'s Entries', value: '1', icon: <Calendar size={16} />, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Activities Tracked', value: String(BASELINE_ACTIVITIES.length), icon: <Layers size={16} />, color: 'text-info', bg: 'bg-info/10' },
    { label: 'Avg Variance', value: '−12%', icon: <TrendingUp size={16} />, color: 'text-warning', bg: 'bg-warning/10' },
  ];

  return (
    <AppLayout currentPath="/dpr-entry">
      <Topbar
        title="DPR Entry"
        subtitle={`Daily Progress Report Filing — ${selectedProject.name}`}
      />
      <div className="px-6 xl:px-8 2xl:px-10 py-6 max-w-screen-2xl mx-auto space-y-6">

        {/* KPIs */}
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
            </div>
          ))}
        </div>

        {/* New DPR button / form */}
        {!showForm ? (
          <div className="flex justify-end">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 btn-primary px-5 py-2.5 text-sm"
            >
              <Plus size={15} /> New DPR Entry
            </button>
          </div>
        ) : (
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-700 text-foreground">New Daily Progress Report</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            <DPRForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {/* Submitted DPRs */}
        <div className="card-elevated overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-600 text-foreground">Submitted DPRs</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{dprs.length} reports filed</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-muted-foreground font-600">DPR ID</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-600">Date / Shift</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-600">Weather</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-600">Engineer</th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-600">Activities</th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-600">Labour</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-600">Delay</th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-600">Photos</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-600">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {dprs.map((dpr, i) => (
                  <tr key={dpr.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                    <td className="px-4 py-3 font-mono text-primary font-500">{dpr.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-500 text-foreground">{dpr.date}</div>
                      <div className="text-muted-foreground mt-0.5">{dpr.shift} Shift</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {weatherIcon(dpr.weather)}
                        <span className="text-muted-foreground">{dpr.weather}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{dpr.engineer}</td>
                    <td className="px-4 py-3 text-right font-600 text-foreground">{dpr.work_rows.length}</td>
                    <td className="px-4 py-3 text-right text-foreground">{dpr.labour_count}</td>
                    <td className="px-4 py-3">
                      {dpr.delay_reason !== 'None' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-500 bg-warning/10 text-warning border border-warning/30">
                          <AlertTriangle size={10} /> {dpr.delay_reason}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">{dpr.photo_count}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{dpr.submitted_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
