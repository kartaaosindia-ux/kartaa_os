'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import {
  Train, Plus, CheckCircle2, Clock, AlertCircle, XCircle,
  Camera, Upload, MapPin, ChevronDown, ChevronUp, Filter,
  CloudSun, CloudRain, Sun, Wind, Save, Send, Eye
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type DprStatus = 'draft' | 'submitted' | 'approved' | 'rejected';
type WeatherType = 'Clear' | 'Cloudy' | 'Rain' | 'Windy';

interface DprEntry {
  id: string;
  date: string;
  startChainage: string;
  endChainage: string;
  location: string;
  wbsCode: string;
  activity: string;
  plannedQty: number;
  todaysQty: number;
  cumulativeQty: number;
  unit: string;
  manpower: number;
  equipment: string;
  materials: string;
  weather: WeatherType;
  remarks: string;
  status: DprStatus;
  engineer: string;
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const wbsOptions = [
  { code: '1.1', label: '1.1 — Embankment' },
  { code: '1.2', label: '1.2 — Subgrade' },
  { code: '1.3', label: '1.3 — Blanketing' },
  { code: '1.4', label: '1.4 — Drainage' },
  { code: '2.1', label: '2.1 — Ballast' },
  { code: '2.2', label: '2.2 — Sleepers' },
  { code: '2.3', label: '2.3 — Rails' },
  { code: '2.4', label: '2.4 — Turnouts' },
  { code: '3.1', label: '3.1 — Culverts' },
  { code: '3.2', label: '3.2 — ROB/RUB' },
  { code: '4.1', label: '4.1 — Platform Works' },
  { code: '4.2', label: '4.2 — Station Buildings' },
  { code: '5', label: '5 — Electrical / OHE' },
  { code: '6', label: '6 — Signalling & Telecom' },
  { code: '7', label: '7 — Level Crossings' },
];

const activityOptions: Record<string, { label: string; unit: string }[]> = {
  '1.1': [{ label: 'Earthwork — Embankment', unit: 'm³' }],
  '1.2': [{ label: 'Subgrade Preparation', unit: 'm³' }],
  '1.3': [{ label: 'Blanketing Layer', unit: 'm³' }],
  '1.4': [{ label: 'Drainage Works', unit: 'm' }],
  '2.1': [{ label: 'Ballast Spreading', unit: 'm³' }],
  '2.2': [{ label: 'Sleeper Installation', unit: 'Nos.' }],
  '2.3': [{ label: 'Rail Laying', unit: 'm' }],
  '2.4': [{ label: 'Turnout Installation', unit: 'Nos.' }],
  '3.1': [{ label: 'Culvert Construction', unit: 'Nos.' }],
  '3.2': [{ label: 'ROB/RUB Works', unit: 'm³' }],
  '4.1': [{ label: 'Platform Work', unit: 'm²' }],
  '4.2': [{ label: 'Station Building', unit: 'm²' }],
  '5': [{ label: 'OHE Foundation', unit: 'Nos.' }, { label: 'OHE Mast Erection', unit: 'Nos.' }],
  '6': [{ label: 'Signal Foundation', unit: 'Nos.' }, { label: 'Cable Laying', unit: 'm' }],
  '7': [{ label: 'Level Crossing Works', unit: 'Nos.' }],
};

const demoDprEntries: DprEntry[] = [
  { id: 'dpr-001', date: '25 Aug 2026', startChainage: '134+200', endChainage: '134+850', location: 'Segment 3', wbsCode: '2.3', activity: 'Rail Laying', plannedQty: 1000, todaysQty: 850, cumulativeQty: 32500, unit: 'm', manpower: 28, equipment: 'Rail Laying Machine, Crane', materials: 'UIC 60 Rails — 850m', weather: 'Clear', remarks: 'Good progress. P-way gang working efficiently.', status: 'approved', engineer: 'R. Sharma' },
  { id: 'dpr-002', date: '25 Aug 2026', startChainage: '128+400', endChainage: '128+600', location: 'STN-001 Koradi', wbsCode: '4.1', activity: 'Platform Work', plannedQty: 100, todaysQty: 75, cumulativeQty: 1200, unit: 'm²', manpower: 18, equipment: 'Concrete Mixer, Vibrator', materials: 'M25 Concrete, Tiles', weather: 'Clear', remarks: 'Platform 1 — Bay 3 to 6 completed.', status: 'pending', engineer: 'A. Verma' },
  { id: 'dpr-003', date: '24 Aug 2026', startChainage: '131+000', endChainage: '131+500', location: 'Segment 2', wbsCode: '2.1', activity: 'Ballast Spreading', plannedQty: 500, todaysQty: 420, cumulativeQty: 18500, unit: 'm³', manpower: 22, equipment: 'Ballast Tamping Machine, Dumpers', materials: 'Stone Ballast 40mm — 420m³', weather: 'Cloudy', remarks: 'Tamping completed for 500m stretch.', status: 'approved', engineer: 'R. Sharma' },
  { id: 'dpr-004', date: '24 Aug 2026', startChainage: '120+000', endChainage: '121+200', location: 'Segment 1', wbsCode: '1.1', activity: 'Earthwork — Embankment', plannedQty: 1500, todaysQty: 1250, cumulativeQty: 820000, unit: 'm³', manpower: 45, equipment: 'Excavator ×3, Compactor ×2, Dumpers ×8', materials: 'Borrow earth from approved quarry', weather: 'Clear', remarks: 'Embankment height achieved at design level.', status: 'approved', engineer: 'P. Nair' },
  { id: 'dpr-005', date: '23 Aug 2026', startChainage: '134+000', endChainage: '134+200', location: 'Segment 3', wbsCode: '2.2', activity: 'Sleeper Installation', plannedQty: 400, todaysQty: 350, cumulativeQty: 120400, unit: 'Nos.', manpower: 20, equipment: 'Sleeper Laying Machine', materials: 'PSC Sleepers — 350 Nos.', weather: 'Clear', remarks: 'Sleeper spacing maintained at 600mm c/c.', status: 'submitted', engineer: 'R. Sharma' },
];

function statusCfg(s: DprStatus) {
  switch (s) {
    case 'approved': return { bg: 'bg-accent/10', text: 'text-accent', border: 'border-accent/30', label: 'Approved', icon: <CheckCircle2 size={12} /> };
    case 'submitted': return { bg: 'bg-info/10', text: 'text-info', border: 'border-info/30', label: 'Submitted', icon: <Send size={12} /> };
    case 'pending': return { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30', label: 'Pending', icon: <Clock size={12} /> };
    case 'rejected': return { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/30', label: 'Rejected', icon: <XCircle size={12} /> };
    default: return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border', label: 'Draft', icon: <AlertCircle size={12} /> };
  }
}

function weatherIcon(w: WeatherType) {
  switch (w) {
    case 'Clear': return <Sun size={14} className="text-warning" />;
    case 'Cloudy': return <CloudSun size={14} className="text-muted-foreground" />;
    case 'Rain': return <CloudRain size={14} className="text-info" />;
    case 'Windy': return <Wind size={14} className="text-muted-foreground" />;
  }
}

// ─── New DPR Form ─────────────────────────────────────────────────────────────
function NewDprForm({ onClose }: { onClose: () => void }) {
  const [wbsCode, setWbsCode] = useState('');
  const [activity, setActivity] = useState('');
  const [unit, setUnit] = useState('');
  const [weather, setWeather] = useState<WeatherType>('Clear');
  const [submitted, setSubmitted] = useState(false);

  const handleWbsChange = (code: string) => {
    setWbsCode(code);
    const acts = activityOptions[code];
    if (acts?.length) {
      setActivity(acts[0].label);
      setUnit(acts[0].unit);
    } else {
      setActivity('');
      setUnit('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { onClose(); }, 1500);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center">
          <CheckCircle2 size={24} className="text-accent" />
        </div>
        <p className="text-sm font-600 text-foreground">DPR Submitted Successfully</p>
        <p className="text-xs text-muted-foreground">Entry sent for approval</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date & Chainage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="form-label">Date <span className="text-danger">*</span></label>
          <input type="date" required className="form-input mt-1" defaultValue="2026-08-25" />
        </div>
        <div>
          <label className="form-label">Weather</label>
          <select className="form-input mt-1" value={weather} onChange={e => setWeather(e.target.value as WeatherType)}>
            {(['Clear', 'Cloudy', 'Rain', 'Windy'] as WeatherType[]).map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Start Chainage <span className="text-danger">*</span></label>
          <input type="text" required placeholder="120+000" className="form-input mt-1 font-mono" />
        </div>
        <div>
          <label className="form-label">End Chainage <span className="text-danger">*</span></label>
          <input type="text" required placeholder="121+000" className="form-input mt-1 font-mono" />
        </div>
      </div>

      <div>
        <label className="form-label">Location / Structure</label>
        <input type="text" placeholder="e.g. Segment 1, STN-001 Koradi, BR-001" className="form-input mt-1" />
      </div>

      {/* WBS & Activity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="form-label">WBS Code <span className="text-danger">*</span></label>
          <select required className="form-input mt-1" value={wbsCode} onChange={e => handleWbsChange(e.target.value)}>
            <option value="">Select WBS</option>
            {wbsOptions.map(w => <option key={w.code} value={w.code}>{w.label}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Activity <span className="text-danger">*</span></label>
          <input type="text" required placeholder="Activity description" className="form-input mt-1" value={activity} onChange={e => setActivity(e.target.value)} />
        </div>
      </div>

      {/* Quantities */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="form-label">Planned Qty</label>
          <input type="number" min="0" placeholder="0" className="form-input mt-1" />
        </div>
        <div>
          <label className="form-label">Today&apos;s Qty <span className="text-danger">*</span></label>
          <input type="number" min="0" required placeholder="0" className="form-input mt-1" />
        </div>
        <div>
          <label className="form-label">Cumulative Qty</label>
          <input type="number" min="0" placeholder="0" className="form-input mt-1" />
        </div>
        <div>
          <label className="form-label">Unit</label>
          <input type="text" placeholder="m³" className="form-input mt-1" value={unit} onChange={e => setUnit(e.target.value)} />
        </div>
      </div>

      {/* Resources */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="form-label">Manpower</label>
          <input type="number" min="0" placeholder="0" className="form-input mt-1" />
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Equipment</label>
          <input type="text" placeholder="e.g. Excavator ×2, Dumpers ×4" className="form-input mt-1" />
        </div>
      </div>

      <div>
        <label className="form-label">Materials Used</label>
        <input type="text" placeholder="e.g. PSC Sleepers — 350 Nos., UIC 60 Rails — 850m" className="form-input mt-1" />
      </div>

      <div>
        <label className="form-label">Remarks</label>
        <textarea rows={2} placeholder="Site observations, issues, delays..." className="form-input resize-none" />
      </div>

      {/* Photo upload placeholder */}
      <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
          <Camera size={16} />
          <Upload size={16} />
        </div>
        <p className="text-xs text-muted-foreground">Tap to add photos / documents</p>
        <p className="text-2xs text-muted-foreground/60 mt-0.5">Photo upload — Planned integration</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">
          Cancel
        </button>
        <button type="button" className="px-4 py-2.5 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2">
          <Save size={14} />Draft
        </button>
        <button type="submit" className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2">
          <Send size={14} />Submit DPR
        </button>
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RailwayDprPage() {
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = filterStatus === 'all' ? demoDprEntries : demoDprEntries.filter(e => e.status === filterStatus);

  return (
    <AppLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        <Topbar title="Railway DPR" subtitle="KARTAA Rail Corridor Demo Project" />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">

          {/* Header */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-700 text-foreground flex items-center gap-2">
                <Train size={16} className="text-info" />
                Daily Progress Report
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Draft → Submitted → Approved → Rejected workflow</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
            >
              <Plus size={15} />New DPR Entry
            </button>
          </div>

          {/* New DPR Form */}
          {showForm && (
            <div className="card-elevated p-5 border-info/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-600 text-foreground flex items-center gap-2">
                  <Plus size={14} className="text-info" />New DPR Entry
                </h3>
                <button onClick={() => setShowForm(false)} className="text-xs text-muted-foreground hover:text-foreground">✕ Close</button>
              </div>
              <NewDprForm onClose={() => setShowForm(false)} />
            </div>
          )}

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Entries', value: demoDprEntries.length, color: 'text-foreground' },
              { label: 'Approved', value: demoDprEntries.filter(e => e.status === 'approved').length, color: 'text-accent' },
              { label: 'Pending Review', value: demoDprEntries.filter(e => e.status === 'pending' || e.status === 'submitted').length, color: 'text-warning' },
              { label: 'Rejected', value: demoDprEntries.filter(e => e.status === 'rejected').length, color: 'text-danger' },
            ].map(stat => (
              <div key={stat.label} className="card-elevated p-3 text-center">
                <div className={`text-2xl font-700 ${stat.color}`}>{stat.value}</div>
                <div className="text-2xs text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={13} className="text-muted-foreground" />
            {['all', 'approved', 'submitted', 'pending', 'rejected'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors capitalize ${
                  filterStatus === s ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* DPR List */}
          <div className="space-y-3">
            {filtered.map(entry => {
              const cfg = statusCfg(entry.status);
              const isExpanded = expandedId === entry.id;
              return (
                <div key={entry.id} className="card-elevated overflow-hidden">
                  <button
                    className="w-full p-4 text-left flex items-start gap-3"
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-600 text-foreground">{entry.activity}</span>
                        <span className={`text-2xs px-1.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} flex items-center gap-1 font-500`}>
                          {cfg.icon}{cfg.label}
                        </span>
                        <span className="text-2xs text-muted-foreground">{entry.wbsCode}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                          <MapPin size={10} />Ch. {entry.startChainage} – {entry.endChainage}
                        </span>
                        <span className="text-xs font-600 text-foreground">{entry.todaysQty} {entry.unit}</span>
                        <span className="text-xs text-muted-foreground">{entry.engineer}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">{weatherIcon(entry.weather)}{entry.weather}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">{entry.date}</span>
                      {isExpanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-border/50 pt-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                        <div><span className="text-muted-foreground block">Planned Qty</span><span className="font-600 text-foreground">{entry.plannedQty} {entry.unit}</span></div>
                        <div><span className="text-muted-foreground block">Today&apos;s Qty</span><span className="font-600 text-foreground">{entry.todaysQty} {entry.unit}</span></div>
                        <div><span className="text-muted-foreground block">Cumulative</span><span className="font-600 text-foreground">{entry.cumulativeQty.toLocaleString('en-IN')} {entry.unit}</span></div>
                        <div><span className="text-muted-foreground block">Manpower</span><span className="font-600 text-foreground">{entry.manpower} persons</span></div>
                        <div className="col-span-2"><span className="text-muted-foreground block">Equipment</span><span className="font-600 text-foreground">{entry.equipment}</span></div>
                        <div className="col-span-2"><span className="text-muted-foreground block">Materials</span><span className="font-600 text-foreground">{entry.materials}</span></div>
                        <div className="col-span-2 sm:col-span-3 md:col-span-4"><span className="text-muted-foreground block">Remarks</span><span className="text-foreground">{entry.remarks}</span></div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <button className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-1 text-muted-foreground">
                          <Eye size={12} />View Full
                        </button>
                        <div className="flex items-center gap-1 text-2xs text-muted-foreground border border-dashed border-border rounded-lg px-2 py-1">
                          <Camera size={11} />Photo upload — Planned
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
