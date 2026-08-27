'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import { Train, Plus, Search, Package, Filter } from 'lucide-react';


// ─── Demo BOQ Data ─────────────────────────────────────────────────────────────
interface BoqItem {
  id: string;
  itemNo: string;
  description: string;
  unit: string;
  qty: string;
  rate: string;
  amount: string;
  progress: number;
  wbsCode: string;
}

const railwayBoqItems: BoqItem[] = [
  { id: 'rb-001', itemNo: '1.1', description: 'Earthwork in excavation and embankment — Sub-grade preparation', unit: 'm³', qty: '28,00,000', rate: '₹185', amount: '₹51,80,00,000', progress: 65, wbsCode: '1.1' },
  { id: 'rb-002', itemNo: '1.2', description: 'Subgrade formation — 300mm compacted layer', unit: 'm³', qty: '9,80,000', rate: '₹220', amount: '₹21,56,00,000', progress: 60, wbsCode: '1.2' },
  { id: 'rb-003', itemNo: '1.3', description: 'Blanketing layer — 300mm sand/moorum', unit: 'm³', qty: '2,80,000', rate: '₹380', amount: '₹10,64,00,000', progress: 40, wbsCode: '1.3' },
  { id: 'rb-004', itemNo: '1.4', description: 'Drainage works — side drains and catch water drains', unit: 'm', qty: '86,000', rate: '₹1,200', amount: '₹10,32,00,000', progress: 50, wbsCode: '1.4' },
  { id: 'rb-005', itemNo: '2.1', description: 'Stone ballast — 40mm graded, spread and compacted', unit: 'm³', qty: '2,58,000', rate: '₹2,400', amount: '₹61,92,00,000', progress: 35, wbsCode: '2.1' },
  { id: 'rb-006', itemNo: '2.2', description: 'Pre-stressed concrete sleepers — 60kg/m rail', unit: 'Nos.', qty: '3,44,000', rate: '₹1,850', amount: '₹63,64,00,000', progress: 35, wbsCode: '2.2' },
  { id: 'rb-007', itemNo: '2.3', description: 'Rail — UIC 60 kg/m, 13m panels, laying and linking', unit: 'm', qty: '1,72,000', rate: '₹4,200', amount: '₹72,24,00,000', progress: 38, wbsCode: '2.3' },
  { id: 'rb-008', itemNo: '2.4', description: 'Turnouts — 1 in 12, BG, 52kg rail', unit: 'Nos.', qty: '48', rate: '₹28,00,000', amount: '₹13,44,00,000', progress: 25, wbsCode: '2.4' },
  { id: 'rb-009', itemNo: '3.1', description: 'Box culverts — 2.0m × 1.5m RCC', unit: 'Nos.', qty: '68', rate: '₹18,50,000', amount: '₹12,58,00,000', progress: 66, wbsCode: '3.1' },
  { id: 'rb-010', itemNo: '3.2', description: 'Road Over Bridge (ROB) — RCC T-beam, 2-lane', unit: 'Nos.', qty: '12', rate: '₹4,20,00,000', amount: '₹50,40,00,000', progress: 42, wbsCode: '3.2' },
  { id: 'rb-011', itemNo: '4.1', description: 'Platform works — RCC platform, 12m wide × 600m long', unit: 'm²', qty: '48,000', rate: '₹3,800', amount: '₹18,24,00,000', progress: 20, wbsCode: '4.1' },
  { id: 'rb-012', itemNo: '4.2', description: 'Station buildings — RCC framed structure', unit: 'm²', qty: '32,000', rate: '₹12,500', amount: '₹40,00,00,000', progress: 20, wbsCode: '4.2' },
  { id: 'rb-013', itemNo: '5.1', description: 'OHE foundations — RCC M25, 1.2m dia × 6m deep', unit: 'Nos.', qty: '3,440', rate: '₹45,000', amount: '₹15,48,00,000', progress: 18, wbsCode: '5' },
  { id: 'rb-014', itemNo: '5.2', description: 'OHE mast erection — 9m steel mast with bracket', unit: 'Nos.', qty: '3,440', rate: '₹85,000', amount: '₹29,24,00,000', progress: 12, wbsCode: '5' },
  { id: 'rb-015', itemNo: '6.1', description: 'Signalling — IBS, LC gates, point machines', unit: 'Lot', qty: '1', rate: '₹1,20,00,00,000', amount: '₹1,20,00,00,000', progress: 12, wbsCode: '6' },
  { id: 'rb-016', itemNo: '6.2', description: 'Telecom — OFC cable, SCADA, PA system', unit: 'Lot', qty: '1', rate: '₹45,00,00,000', amount: '₹45,00,00,000', progress: 8, wbsCode: '6' },
  { id: 'rb-017', itemNo: '7.1', description: 'Level crossings — interlocked, with gates and signals', unit: 'Nos.', qty: '15', rate: '₹35,00,000', amount: '₹5,25,00,000', progress: 27, wbsCode: '7' },
];

function progressColor(pct: number) {
  if (pct >= 80) return 'bg-accent';
  if (pct >= 50) return 'bg-info';
  if (pct >= 25) return 'bg-warning';
  return 'bg-danger';
}

const totalAmount = '₹5,62,29,00,000';
const contractValue = '₹3,250 Crore';

export default function RailwayBoqPage() {
  const [search, setSearch] = useState('');
  const [filterWbs, setFilterWbs] = useState('All');

  const wbsGroups = ['All', '1', '2', '3', '4', '5', '6', '7'];
  const wbsLabels: Record<string, string> = {
    '1': 'Earthwork', '2': 'Track', '3': 'Bridges', '4': 'Stations',
    '5': 'OHE', '6': 'Signalling', '7': 'Level Crossings'
  };

  const filtered = railwayBoqItems.filter(item => {
    const matchSearch = !search || item.description.toLowerCase().includes(search.toLowerCase()) || item.itemNo.includes(search);
    const matchWbs = filterWbs === 'All' || item.wbsCode.startsWith(filterWbs);
    return matchSearch && matchWbs;
  });

  const completedItems = railwayBoqItems.filter(i => i.progress === 100).length;
  const inProgressItems = railwayBoqItems.filter(i => i.progress > 0 && i.progress < 100).length;

  return (
    <AppLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        <Topbar title="Railway BOQ" subtitle="KARTAA Rail Corridor Demo Project" />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">

          {/* Header */}
          <div className="card-elevated p-5 border-info/30 bg-gradient-to-r from-info/5 to-transparent">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-info/15 flex items-center justify-center">
                  <Train size={18} className="text-info" />
                </div>
                <div>
                  <h2 className="text-base font-700 text-foreground">Bill of Quantities — Railway</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">KARTAA Rail Corridor Demo Project · Demo/Synthetic Data</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-lg font-700 text-foreground">{contractValue}</div>
                  <div className="text-xs text-muted-foreground">Contract Value</div>
                </div>
                <button className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                  <Plus size={13} />Add Item
                </button>
              </div>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card-elevated p-3 text-center">
              <div className="text-xl font-700 text-foreground">{railwayBoqItems.length}</div>
              <div className="text-2xs text-muted-foreground">Total Items</div>
            </div>
            <div className="card-elevated p-3 text-center">
              <div className="text-xl font-700 text-accent">{completedItems}</div>
              <div className="text-2xs text-muted-foreground">Completed</div>
            </div>
            <div className="card-elevated p-3 text-center">
              <div className="text-xl font-700 text-info">{inProgressItems}</div>
              <div className="text-2xs text-muted-foreground">In Progress</div>
            </div>
            <div className="card-elevated p-3 text-center">
              <div className="text-xl font-700 text-warning">{railwayBoqItems.filter(i => i.progress === 0).length}</div>
              <div className="text-2xs text-muted-foreground">Not Started</div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search BOQ items..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input pl-9 w-full"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={13} className="text-muted-foreground" />
              {wbsGroups.map(g => (
                <button
                  key={g}
                  onClick={() => setFilterWbs(g)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    filterWbs === g ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {g === 'All' ? 'All' : wbsLabels[g] || g}
                </button>
              ))}
            </div>
          </div>

          {/* BOQ Table */}
          <div className="card-elevated overflow-hidden">
            {/* Desktop header */}
            <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-border bg-muted/30 text-2xs text-muted-foreground uppercase tracking-wider">
              <span className="col-span-1">Item No.</span>
              <span className="col-span-4">Description</span>
              <span className="col-span-1 text-center">Unit</span>
              <span className="col-span-1 text-right">Qty</span>
              <span className="col-span-1 text-right">Rate</span>
              <span className="col-span-2 text-right">Amount</span>
              <span className="col-span-2 text-center">Progress</span>
            </div>
            <div className="divide-y divide-border/30">
              {filtered.map(item => (
                <div key={item.id} className="px-4 py-3 hover:bg-muted/20 transition-colors">
                  {/* Desktop layout */}
                  <div className="hidden md:grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-1 text-xs font-mono text-muted-foreground">{item.itemNo}</span>
                    <div className="col-span-4">
                      <p className="text-xs text-foreground leading-snug">{item.description}</p>
                      <span className="text-2xs text-muted-foreground">WBS {item.wbsCode}</span>
                    </div>
                    <span className="col-span-1 text-xs text-center text-muted-foreground">{item.unit}</span>
                    <span className="col-span-1 text-xs text-right font-mono text-foreground">{item.qty}</span>
                    <span className="col-span-1 text-xs text-right font-mono text-foreground">{item.rate}</span>
                    <span className="col-span-2 text-xs text-right font-700 text-foreground">{item.amount}</span>
                    <div className="col-span-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${progressColor(item.progress)}`} style={{ width: `${item.progress}%` }} />
                      </div>
                      <span className={`text-xs font-700 w-8 text-right ${item.progress >= 80 ? 'text-accent' : item.progress >= 50 ? 'text-info' : item.progress >= 25 ? 'text-warning' : 'text-danger'}`}>
                        {item.progress}%
                      </span>
                    </div>
                  </div>
                  {/* Mobile layout */}
                  <div className="md:hidden">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1">
                        <span className="text-2xs font-mono text-muted-foreground">{item.itemNo} · WBS {item.wbsCode}</span>
                        <p className="text-xs text-foreground leading-snug mt-0.5">{item.description}</p>
                      </div>
                      <span className={`text-sm font-700 flex-shrink-0 ${item.progress >= 80 ? 'text-accent' : item.progress >= 50 ? 'text-info' : item.progress >= 25 ? 'text-warning' : 'text-danger'}`}>
                        {item.progress}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      <span>{item.qty} {item.unit}</span>
                      <span>{item.rate}</span>
                      <span className="font-600 text-foreground">{item.amount}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${progressColor(item.progress)}`} style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Total row */}
            <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
              <span className="text-sm font-600 text-foreground">Total BOQ Value (Demo)</span>
              <span className="text-sm font-700 text-foreground">{totalAmount}</span>
            </div>
          </div>

          {/* Takeoff placeholder */}
          <div className="card-elevated p-5 border-dashed border-2 border-border">
            <div className="flex items-center gap-3 mb-2">
              <Package size={16} className="text-muted-foreground" />
              <h3 className="text-sm font-600 text-foreground">Railway Takeoff Module</h3>
              <span className="text-2xs px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20 font-500">Planned</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Future takeoff module will support railway drawing measurements: Rail length, Sleeper count, Platform area, Chainage-based quantities, Asset count.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {['Rail Length (m)', 'Sleepers (Nos.)', 'Platform Area (m²)', 'Chainage (km)', 'Asset Count'].map(m => (
                <div key={m} className="p-2 rounded-lg bg-muted/30 border border-border text-center">
                  <div className="text-2xs text-muted-foreground">{m}</div>
                  <div className="text-xs font-600 text-muted-foreground mt-0.5">— Planned —</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
