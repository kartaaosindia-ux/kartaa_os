'use client';
import React, { useState, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import { Upload, FileSpreadsheet, Image, CheckCircle2, Trash2, Eye, Download, Calendar, Target, Layers, FileText, X, Info } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface BaselineActivity {
  activity_id: string;
  activity_name: string;
  planned_daily_target_qty: number;
  unit: string;
  planned_start_date: string;
  planned_end_date: string;
  total_qty?: number;
  location?: string;
}

interface UploadedFile {
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  status: 'processing' | 'ready' | 'error';
  rowCount?: number;
}

// ─── Demo baseline activities ─────────────────────────────────────────────────
const DEMO_ACTIVITIES: BaselineActivity[] = [
  { activity_id: 'ACT-001', activity_name: 'RCC Foundation — Zone A', planned_daily_target_qty: 45, unit: 'm³', planned_start_date: '2026-08-01', planned_end_date: '2026-09-15', total_qty: 2700, location: 'Zone A' },
  { activity_id: 'ACT-002', activity_name: 'Structural Steel Erection', planned_daily_target_qty: 12, unit: 'MT', planned_start_date: '2026-09-01', planned_end_date: '2026-11-30', total_qty: 1080, location: 'Zone A, B' },
  { activity_id: 'ACT-003', activity_name: 'Electrical Cable Laying', planned_daily_target_qty: 320, unit: 'm', planned_start_date: '2026-10-01', planned_end_date: '2026-12-15', total_qty: 22400, location: 'Zone A' },
  { activity_id: 'ACT-004', activity_name: 'Mechanical Equipment Installation', planned_daily_target_qty: 1, unit: 'units', planned_start_date: '2026-11-01', planned_end_date: '2027-01-31', total_qty: 92, location: 'Zone B, C' },
  { activity_id: 'ACT-005', activity_name: 'RCC Columns & Beams — Zone B', planned_daily_target_qty: 60, unit: 'm³', planned_start_date: '2026-09-15', planned_end_date: '2026-11-15', total_qty: 3600, location: 'Zone B' },
  { activity_id: 'ACT-006', activity_name: 'Brick Masonry — External Walls', planned_daily_target_qty: 180, unit: 'm²', planned_start_date: '2026-11-01', planned_end_date: '2027-02-28', total_qty: 18000, location: 'Zone A, B, C' },
  { activity_id: 'ACT-007', activity_name: 'Plumbing & Sanitation', planned_daily_target_qty: 85, unit: 'm', planned_start_date: '2026-12-01', planned_end_date: '2027-03-31', total_qty: 8500, location: 'All Zones' },
  { activity_id: 'ACT-008', activity_name: 'Flooring — Vitrified Tiles', planned_daily_target_qty: 220, unit: 'm²', planned_start_date: '2027-01-01', planned_end_date: '2027-04-30', total_qty: 26400, location: 'Zone A, B' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d: string) {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function durationDays(start: string, end: string) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.round((e - s) / (1000 * 60 * 60 * 24));
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MasterPlanPage() {
  const { selectedProject } = useProject();
  const [activities, setActivities] = useState<BaselineActivity[]>(DEMO_ACTIVITIES);
  const [scheduleFile, setScheduleFile] = useState<UploadedFile | null>(null);
  const [keyPlanFiles, setKeyPlanFiles] = useState<UploadedFile[]>([]);
  const [dragOverSchedule, setDragOverSchedule] = useState(false);
  const [dragOverKeyPlan, setDragOverKeyPlan] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'keyplan'>('schedule');
  const scheduleInputRef = useRef<HTMLInputElement>(null);
  const keyPlanInputRef = useRef<HTMLInputElement>(null);

  function handleScheduleFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['csv', 'xlsx', 'xls', 'json'];
    if (!ext || !allowed.includes(ext)) return;

    const uploaded: UploadedFile = {
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: ext.toUpperCase(),
      uploadedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      status: 'processing',
      rowCount: DEMO_ACTIVITIES.length,
    };
    setScheduleFile(uploaded);
    // Simulate processing
    setTimeout(() => {
      setScheduleFile(prev => prev ? { ...prev, status: 'ready' } : null);
      setActivities(DEMO_ACTIVITIES);
    }, 1200);
  }

  function handleKeyPlanFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['pdf', 'png', 'jpg', 'jpeg', 'webp'];
    if (!ext || !allowed.includes(ext)) return;

    const uploaded: UploadedFile = {
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: ext.toUpperCase(),
      uploadedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      status: 'ready',
    };
    setKeyPlanFiles(prev => [...prev, uploaded]);
  }

  return (
    <AppLayout currentPath="/master-plan">
      <Topbar
        title="Master Plan & Key Plan"
        subtitle={`Baseline Schedule Upload & Site Layout — ${selectedProject.name}`}
      />
      <div className="px-6 xl:px-8 2xl:px-10 py-6 max-w-screen-2xl mx-auto space-y-6">

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Baseline Activities', value: String(activities.length), icon: <Layers size={16} />, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Schedule Uploaded', value: scheduleFile?.status === 'ready' ? 'Yes' : 'Pending', icon: <FileSpreadsheet size={16} />, color: scheduleFile?.status === 'ready' ? 'text-success' : 'text-warning', bg: scheduleFile?.status === 'ready' ? 'bg-success/10' : 'bg-warning/10' },
            { label: 'Key Plans Pinned', value: String(keyPlanFiles.length), icon: <Image size={16} />, color: 'text-accent', bg: 'bg-accent/10' },
            { label: 'Project Duration', value: '18 months', icon: <Calendar size={16} />, color: 'text-info', bg: 'bg-info/10' },
          ].map(k => (
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

        {/* Info banner */}
        <div className="card-elevated p-4 border-l-4 border-accent bg-accent/5">
          <div className="flex items-start gap-3">
            <Info size={16} className="text-accent flex-shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              Upload your Master Baseline Schedule (CSV / Excel / JSON) containing <span className="text-foreground font-500">activity_id, activity_name, planned_daily_target_qty, unit, planned_start_date, planned_end_date</span>. The DPR Entry Form will auto-fill planned targets from this baseline.
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {[
            { id: 'schedule' as const, label: 'Baseline Schedule', icon: <FileSpreadsheet size={14} /> },
            { id: 'keyplan' as const, label: 'Key Plan / Site Layout', icon: <Image size={14} /> },
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

        {/* ── Schedule Tab ── */}
        {activeTab === 'schedule' && (
          <div className="space-y-5">
            {/* Upload zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                dragOverSchedule ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/20'
              }`}
              onDragOver={e => { e.preventDefault(); setDragOverSchedule(true); }}
              onDragLeave={() => setDragOverSchedule(false)}
              onDrop={e => {
                e.preventDefault();
                setDragOverSchedule(false);
                const file = e.dataTransfer.files[0];
                if (file) handleScheduleFile(file);
              }}
              onClick={() => scheduleInputRef.current?.click()}
            >
              <input
                ref={scheduleInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.json"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleScheduleFile(f); }}
              />
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileSpreadsheet size={24} className="text-primary" />
                </div>
              </div>
              <p className="text-sm font-600 text-foreground mb-1">Drop Master Schedule File Here</p>
              <p className="text-xs text-muted-foreground mb-3">Supports CSV, Excel (.xlsx / .xls), JSON</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {['CSV', 'XLSX', 'XLS', 'JSON'].map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-md bg-muted text-xs text-muted-foreground border border-border">{t}</span>
                ))}
              </div>
            </div>

            {/* Uploaded file status */}
            {scheduleFile && (
              <div className={`card-elevated p-4 flex items-center gap-4 ${scheduleFile.status === 'processing' ? 'border-warning/30' : 'border-success/30'} border`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${scheduleFile.status === 'ready' ? 'bg-success/10' : 'bg-warning/10'}`}>
                  {scheduleFile.status === 'ready' ? <CheckCircle2 size={20} className="text-success" /> : <div className="w-4 h-4 border-2 border-warning border-t-transparent rounded-full animate-spin" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-600 text-foreground truncate">{scheduleFile.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {scheduleFile.size} · {scheduleFile.type} · Uploaded {scheduleFile.uploadedAt}
                    {scheduleFile.status === 'ready' && scheduleFile.rowCount && ` · ${scheduleFile.rowCount} activities parsed`}
                  </div>
                </div>
                <span className={`text-xs font-500 px-2 py-1 rounded-full ${scheduleFile.status === 'ready' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                  {scheduleFile.status === 'ready' ? 'Ready' : 'Processing…'}
                </span>
                <button onClick={() => setScheduleFile(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <Trash2 size={14} className="text-muted-foreground" />
                </button>
              </div>
            )}

            {/* Baseline activities table */}
            <div className="card-elevated overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-600 text-foreground">Baseline Activity Schedule</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{activities.length} activities · Master Baseline</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:border-primary/40 transition-colors">
                  <Download size={13} /> Export
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 text-muted-foreground font-600">Activity ID</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-600">Activity Name</th>
                      <th className="text-right px-4 py-3 text-muted-foreground font-600">Daily Target</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-600">Unit</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-600">Start Date</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-600">End Date</th>
                      <th className="text-right px-4 py-3 text-muted-foreground font-600">Duration</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-600">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((act, i) => (
                      <tr key={act.activity_id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                        <td className="px-4 py-3 font-mono text-primary font-500">{act.activity_id}</td>
                        <td className="px-4 py-3 font-500 text-foreground">{act.activity_name}</td>
                        <td className="px-4 py-3 text-right font-700 text-accent">{act.planned_daily_target_qty.toLocaleString()}</td>
                        <td className="px-4 py-3 text-muted-foreground">{act.unit}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(act.planned_start_date)}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(act.planned_end_date)}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{durationDays(act.planned_start_date, act.planned_end_date)}d</td>
                        <td className="px-4 py-3 text-muted-foreground">{act.location || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Key Plan Tab ── */}
        {activeTab === 'keyplan' && (
          <div className="space-y-5">
            {/* Upload zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                dragOverKeyPlan ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40 hover:bg-muted/20'
              }`}
              onDragOver={e => { e.preventDefault(); setDragOverKeyPlan(true); }}
              onDragLeave={() => setDragOverKeyPlan(false)}
              onDrop={e => {
                e.preventDefault();
                setDragOverKeyPlan(false);
                Array.from(e.dataTransfer.files).forEach(f => handleKeyPlanFile(f));
              }}
              onClick={() => keyPlanInputRef.current?.click()}
            >
              <input
                ref={keyPlanInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                multiple
                className="hidden"
                onChange={e => { Array.from(e.target.files || []).forEach(f => handleKeyPlanFile(f)); }}
              />
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Image size={24} className="text-accent" />
                </div>
              </div>
              <p className="text-sm font-600 text-foreground mb-1">Upload Key Plan / Site Layout Map</p>
              <p className="text-xs text-muted-foreground mb-3">PDF, PNG, JPG, WEBP — Multiple files supported</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {['PDF', 'PNG', 'JPG', 'WEBP'].map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-md bg-muted text-xs text-muted-foreground border border-border">{t}</span>
                ))}
              </div>
            </div>

            {/* Pinned key plans */}
            {keyPlanFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {keyPlanFiles.map((f, i) => (
                  <div key={i} className="card-elevated p-4 border border-accent/20">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        {f.type === 'PDF' ? <FileText size={18} className="text-accent" /> : <Image size={18} className="text-accent" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-600 text-foreground truncate">{f.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{f.size} · {f.type} · {f.uploadedAt}</div>
                      </div>
                      <button onClick={() => setKeyPlanFiles(prev => prev.filter((_, idx) => idx !== i))} className="p-1 rounded hover:bg-muted transition-colors flex-shrink-0">
                        <X size={13} className="text-muted-foreground" />
                      </button>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:border-primary/40 transition-colors">
                        <Eye size={12} /> Preview
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent/30 text-xs text-accent hover:bg-accent/5 transition-colors">
                        <Download size={12} /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card-elevated p-8 text-center">
                <Image size={32} className="text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No key plans uploaded yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Upload site layout maps and floor plans above</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
