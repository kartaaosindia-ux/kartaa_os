'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import {
  Train, Plus, Trash2, Edit3, ChevronRight, ChevronDown,
  Building2, Layers, Zap, Radio, Target, BarChart3,
  CheckCircle2, Clock, AlertCircle, MapPin, Eye
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface WbsItem {
  id: string;
  code: string;
  parentCode: string | null;
  name: string;
  level: number;
  unit: string;
  plannedQty: number;
  achievedQty: number;
  progressPct: number;
  sortOrder: number;
}

interface Asset {
  id: string;
  assetId: string;
  assetType: string;
  name: string;
  chainage: string;
  location: string;
  plannedStatus: string;
  actualStatus: string;
  progressPct: number;
  remarks: string;
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const wbsItems: WbsItem[] = [
  { id: 'w1', code: '1', parentCode: null, name: 'Earthwork & Formation', level: 1, unit: 'm³', plannedQty: 4200000, achievedQty: 2562000, progressPct: 61, sortOrder: 10 },
  { id: 'w1.1', code: '1.1', parentCode: '1', name: 'Embankment', level: 2, unit: 'm³', plannedQty: 2800000, achievedQty: 1820000, progressPct: 65, sortOrder: 20 },
  { id: 'w1.2', code: '1.2', parentCode: '1', name: 'Subgrade', level: 2, unit: 'm³', plannedQty: 980000, achievedQty: 588000, progressPct: 60, sortOrder: 30 },
  { id: 'w1.3', code: '1.3', parentCode: '1', name: 'Blanketing', level: 2, unit: 'm³', plannedQty: 280000, achievedQty: 112000, progressPct: 40, sortOrder: 40 },
  { id: 'w1.4', code: '1.4', parentCode: '1', name: 'Drainage', level: 2, unit: 'm', plannedQty: 86000, achievedQty: 43000, progressPct: 50, sortOrder: 50 },
  { id: 'w2', code: '2', parentCode: null, name: 'Track Works', level: 1, unit: 'm', plannedQty: 172000, achievedQty: 65360, progressPct: 38, sortOrder: 60 },
  { id: 'w2.1', code: '2.1', parentCode: '2', name: 'Ballast', level: 2, unit: 'm³', plannedQty: 258000, achievedQty: 90300, progressPct: 35, sortOrder: 70 },
  { id: 'w2.2', code: '2.2', parentCode: '2', name: 'Sleepers', level: 2, unit: 'Nos.', plannedQty: 344000, achievedQty: 120400, progressPct: 35, sortOrder: 80 },
  { id: 'w2.3', code: '2.3', parentCode: '2', name: 'Rails', level: 2, unit: 'm', plannedQty: 172000, achievedQty: 65360, progressPct: 38, sortOrder: 90 },
  { id: 'w2.4', code: '2.4', parentCode: '2', name: 'Turnouts', level: 2, unit: 'Nos.', plannedQty: 48, achievedQty: 12, progressPct: 25, sortOrder: 100 },
  { id: 'w3', code: '3', parentCode: null, name: 'Bridges & Structures', level: 1, unit: 'Nos.', plannedQty: 24, achievedQty: 13, progressPct: 55, sortOrder: 110 },
  { id: 'w3.1', code: '3.1', parentCode: '3', name: 'Culverts', level: 2, unit: 'Nos.', plannedQty: 68, achievedQty: 45, progressPct: 66, sortOrder: 120 },
  { id: 'w3.2', code: '3.2', parentCode: '3', name: 'ROB/RUB', level: 2, unit: 'Nos.', plannedQty: 12, achievedQty: 5, progressPct: 42, sortOrder: 130 },
  { id: 'w4', code: '4', parentCode: null, name: 'Stations', level: 1, unit: 'Nos.', plannedQty: 8, achievedQty: 2, progressPct: 22, sortOrder: 140 },
  { id: 'w4.1', code: '4.1', parentCode: '4', name: 'Platform Works', level: 2, unit: 'm²', plannedQty: 48000, achievedQty: 9600, progressPct: 20, sortOrder: 150 },
  { id: 'w4.2', code: '4.2', parentCode: '4', name: 'Station Buildings', level: 2, unit: 'm²', plannedQty: 32000, achievedQty: 6400, progressPct: 20, sortOrder: 160 },
  { id: 'w5', code: '5', parentCode: null, name: 'Electrical / OHE', level: 1, unit: 'm', plannedQty: 172000, achievedQty: 30960, progressPct: 18, sortOrder: 170 },
  { id: 'w6', code: '6', parentCode: null, name: 'Signalling & Telecom', level: 1, unit: 'Nos.', plannedQty: 186, achievedQty: 22, progressPct: 12, sortOrder: 180 },
  { id: 'w7', code: '7', parentCode: null, name: 'Level Crossings', level: 1, unit: 'Nos.', plannedQty: 15, achievedQty: 4, progressPct: 27, sortOrder: 190 },
  { id: 'w8', code: '8', parentCode: null, name: 'Testing & Commissioning', level: 1, unit: 'Lot', plannedQty: 1, achievedQty: 0, progressPct: 0, sortOrder: 200 },
];

const assets: Asset[] = [
  { id: 'a1', assetId: 'BR-001', assetType: 'Bridge', name: 'Major Bridge — Wainganga River', chainage: '134+250', location: 'Fictional Wainganga Crossing', plannedStatus: 'In Progress', actualStatus: 'In Progress', progressPct: 72, remarks: 'Pier construction complete. Deck in progress.' },
  { id: 'a2', assetId: 'BR-002', assetType: 'Bridge', name: 'Minor Bridge — Fictional Nala', chainage: '141+800', location: 'Fictional Nala Crossing', plannedStatus: 'Completed', actualStatus: 'Completed', progressPct: 100, remarks: 'Completed and handed over.' },
  { id: 'a3', assetId: 'BR-003', assetType: 'Bridge', name: 'Major Bridge — Fictional Canal', chainage: '158+400', location: 'Fictional Canal Crossing', plannedStatus: 'In Progress', actualStatus: 'In Progress', progressPct: 45, remarks: 'Foundation complete. Pier work ongoing.' },
  { id: 'a4', assetId: 'ROB-001', assetType: 'ROB', name: 'ROB — Fictional NH-44 Crossing', chainage: '127+600', location: 'Fictional NH-44', plannedStatus: 'In Progress', actualStatus: 'In Progress', progressPct: 38, remarks: 'Abutment work in progress.' },
  { id: 'a5', assetId: 'ROB-002', assetType: 'ROB', name: 'ROB — Fictional SH-26 Crossing', chainage: '163+200', location: 'Fictional SH-26', plannedStatus: 'Not Started', actualStatus: 'Not Started', progressPct: 0, remarks: 'Design approval pending.' },
  { id: 'a6', assetId: 'STN-001', assetType: 'Station', name: 'Fictional Koradi Station', chainage: '128+400', location: 'Fictional Koradi', plannedStatus: 'In Progress', actualStatus: 'In Progress', progressPct: 35, remarks: 'Platform 1 under construction.' },
  { id: 'a7', assetId: 'STN-002', assetType: 'Station', name: 'Fictional Kamptee Station', chainage: '145+200', location: 'Fictional Kamptee', plannedStatus: 'In Progress', actualStatus: 'In Progress', progressPct: 28, remarks: 'Foundation works in progress.' },
  { id: 'a8', assetId: 'STN-003', assetType: 'Station', name: 'Fictional Ramtek Station', chainage: '172+800', location: 'Fictional Ramtek', plannedStatus: 'Not Started', actualStatus: 'Not Started', progressPct: 5, remarks: 'Site clearance started.' },
  { id: 'a9', assetId: 'LC-001', assetType: 'Level Crossing', name: 'LC No. 14 — Fictional Village Road', chainage: '131+500', location: 'Fictional Village Road', plannedStatus: 'Completed', actualStatus: 'Completed', progressPct: 100, remarks: 'Completed.' },
  { id: 'a10', assetId: 'LC-002', assetType: 'Level Crossing', name: 'LC No. 22 — Fictional District Road', chainage: '149+800', location: 'Fictional District Road', plannedStatus: 'In Progress', actualStatus: 'In Progress', progressPct: 60, remarks: 'Interlocking works in progress.' },
];

function progressColor(pct: number) {
  if (pct >= 80) return 'bg-accent';
  if (pct >= 50) return 'bg-info';
  if (pct >= 25) return 'bg-warning';
  return 'bg-danger';
}

function assetStatusCfg(s: string) {
  switch (s) {
    case 'Completed': return { bg: 'bg-accent/10', text: 'text-accent', icon: <CheckCircle2 size={11} /> };
    case 'In Progress': return { bg: 'bg-info/10', text: 'text-info', icon: <Clock size={11} /> };
    default: return { bg: 'bg-muted', text: 'text-muted-foreground', icon: <AlertCircle size={11} /> };
  }
}

function assetTypeIcon(t: string) {
  switch (t) {
    case 'Bridge': return <BarChart3 size={14} className="text-accent" />;
    case 'ROB': case 'RUB': return <Train size={14} className="text-info" />;
    case 'Station': return <Building2 size={14} className="text-warning" />;
    case 'Level Crossing': return <Target size={14} className="text-danger" />;
    case 'OHE': return <Zap size={14} className="text-warning" />;
    case 'Signal': return <Radio size={14} className="text-primary" />;
    default: return <Layers size={14} className="text-muted-foreground" />;
  }
}

// ─── WBS Tree ─────────────────────────────────────────────────────────────────
function WbsTree() {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<WbsItem[]>(wbsItems);

  const toggleCollapse = (code: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const rootItems = items.filter(i => i.parentCode === null);

  const renderItem = (item: WbsItem) => {
    const children = items.filter(i => i.parentCode === item.code);
    const hasChildren = children.length > 0;
    const isCollapsed = collapsed.has(item.code);

    return (
      <div key={item.id}>
        <div className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors group ${item.level === 1 ? 'bg-muted/20' : ''}`}
          style={{ paddingLeft: `${(item.level - 1) * 20 + 12}px` }}>
          {hasChildren ? (
            <button onClick={() => toggleCollapse(item.code)} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
          ) : (
            <span className="w-3.5 flex-shrink-0" />
          )}
          <span className={`text-xs font-mono text-muted-foreground flex-shrink-0 w-10 ${item.level === 1 ? 'font-700' : ''}`}>{item.code}</span>
          <span className={`flex-1 text-xs min-w-0 truncate ${item.level === 1 ? 'font-600 text-foreground' : 'text-foreground'}`}>{item.name}</span>
          <span className="text-2xs text-muted-foreground flex-shrink-0 w-16 text-right hidden sm:block">
            {item.achievedQty >= 1000 ? `${(item.achievedQty / 1000).toFixed(0)}k` : item.achievedQty} / {item.plannedQty >= 1000 ? `${(item.plannedQty / 1000).toFixed(0)}k` : item.plannedQty} {item.unit}
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
              <div className={`h-full rounded-full ${progressColor(item.progressPct)}`} style={{ width: `${item.progressPct}%` }} />
            </div>
            <span className={`text-xs font-700 w-8 text-right ${item.progressPct >= 80 ? 'text-accent' : item.progressPct >= 50 ? 'text-info' : item.progressPct >= 25 ? 'text-warning' : 'text-danger'}`}>
              {item.progressPct}%
            </span>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit3 size={12} /></button>
            {item.level > 1 && <button className="p-1 rounded hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors"><Trash2 size={12} /></button>}
          </div>
        </div>
        {!isCollapsed && children.map(child => renderItem(child))}
      </div>
    );
  };

  return (
    <div className="card-elevated overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="text-sm font-600 text-foreground">Railway WBS — Work Breakdown Structure</h3>
          <p className="text-xs text-muted-foreground mt-0.5">KARTAA Rail Corridor Demo Project · Demo/Synthetic Data</p>
        </div>
        <button className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
          <Plus size={13} />Add Item
        </button>
      </div>
      {/* Header row */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30 text-2xs text-muted-foreground uppercase tracking-wider">
        <span className="w-3.5 flex-shrink-0" />
        <span className="w-10 flex-shrink-0">Code</span>
        <span className="flex-1">Description</span>
        <span className="w-16 text-right hidden sm:block">Achieved / Planned</span>
        <span className="w-16 hidden sm:block" />
        <span className="w-8 text-right">%</span>
        <span className="w-12" />
      </div>
      <div className="divide-y divide-border/30">
        {rootItems.map(item => renderItem(item))}
      </div>
    </div>
  );
}

// ─── Asset Register ───────────────────────────────────────────────────────────
function AssetRegister() {
  const [filterType, setFilterType] = useState('All');
  const assetTypes = ['All', 'Bridge', 'ROB', 'Station', 'Level Crossing'];
  const filtered = filterType === 'All' ? assets : assets.filter(a => a.assetType === filterType);

  return (
    <div className="card-elevated overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-600 text-foreground">Railway Asset Register</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Bridges, Stations, ROB/RUB, Level Crossings · Demo/Synthetic Data</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {assetTypes.map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                filterType === t ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-border/30">
        {filtered.map(asset => {
          const statusCfg = assetStatusCfg(asset.actualStatus);
          return (
            <div key={asset.id} className="p-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  {assetTypeIcon(asset.assetType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-600 text-foreground">{asset.name}</span>
                    <span className={`text-2xs px-1.5 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.text} flex items-center gap-1 font-500`}>
                      {statusCfg.icon}{asset.actualStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className="text-2xs text-muted-foreground font-mono flex items-center gap-1"><MapPin size={9} />Ch. {asset.chainage}</span>
                    <span className="text-2xs text-muted-foreground">{asset.assetId}</span>
                    <span className="text-2xs text-muted-foreground">{asset.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-32">
                      <div className={`h-full rounded-full ${progressColor(asset.progressPct)}`} style={{ width: `${asset.progressPct}%` }} />
                    </div>
                    <span className={`text-xs font-700 ${asset.progressPct >= 80 ? 'text-accent' : asset.progressPct >= 50 ? 'text-info' : asset.progressPct >= 25 ? 'text-warning' : 'text-danger'}`}>
                      {asset.progressPct}%
                    </span>
                    <span className="text-2xs text-muted-foreground">{asset.remarks}</span>
                  </div>
                </div>
                <button className="flex-shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <Eye size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RailwayWbsPage() {
  const [activeTab, setActiveTab] = useState<'wbs' | 'assets'>('wbs');

  return (
    <AppLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        <Topbar title="Railway WBS & Assets" subtitle="KARTAA Rail Corridor Demo Project" />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-info/15 flex items-center justify-center">
              <Train size={18} className="text-info" />
            </div>
            <div>
              <h2 className="text-base font-700 text-foreground">WBS & Asset Register</h2>
              <p className="text-xs text-muted-foreground">KARTAA Rail Corridor Demo Project · Fictional Central India Rail Corridor</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border">
            {(['wbs', 'assets'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-500 border-b-2 transition-colors -mb-px ${
                  activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'wbs' ? 'Work Breakdown Structure' : 'Asset Register'}
              </button>
            ))}
          </div>

          {activeTab === 'wbs' && <WbsTree />}
          {activeTab === 'assets' && <AssetRegister />}

        </div>
      </div>
    </AppLayout>
  );
}
