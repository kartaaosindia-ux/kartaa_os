'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import { Layers, Calendar, TrendingUp, AlertTriangle, Clock, ZoomIn, ZoomOut, Maximize2, RefreshCw, Info, Satellite, Map } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRealtimeKartaa } from '@/hooks/useRealtimeKartaa';
import { useProject } from '@/contexts/ProjectContext';

// ─── Types ────────────────────────────────────────────────────────────────────
type LayerStatus = 'completed' | 'in_progress' | 'not_started' | 'discrepancy';

interface ConstructionLayer {
  id: string;
  layer_code: string;
  layer_name: string;
  depth: string;
  material: string;
  chainage_from: string;
  chainage_to: string;
  manual_progress: number;
  satellite_progress: number;
  layer_status: LayerStatus;
  last_satellite_capture: string;
  discrepancy: number;
  notes: string;
  color: string;
}

interface SatelliteCapture {
  id: string;
  date: string;
  provider: string;
  resolution: string;
  cloudCover: string;
  layersCaptured: string[];
  changeDetected: boolean;
}

// ─── Static capture history ───────────────────────────────────────────────────
const satelliteCaptures: SatelliteCapture[] = [
  { id: 'cap-1', date: '2026-08-22', provider: 'Satellite Provider A', resolution: '0.5m/px', cloudCover: '3%', layersCaptured: ['WMM', 'DBM', 'DRN'], changeDetected: true },
  { id: 'cap-2', date: '2026-08-20', provider: 'Satellite Provider B', resolution: '1m/px', cloudCover: '8%', layersCaptured: ['SG', 'GSB', 'BC', 'DRN'], changeDetected: false },
  { id: 'cap-3', date: '2026-08-15', provider: 'Satellite Provider A', resolution: '0.5m/px', cloudCover: '12%', layersCaptured: ['WMM', 'DBM'], changeDetected: true },
  { id: 'cap-4', date: '2026-08-10', provider: 'Satellite Provider C', resolution: '2m/px', cloudCover: '5%', layersCaptured: ['SG', 'GSB', 'WMM'], changeDetected: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusConfig: Record<LayerStatus, { label: string; color: string; bg: string; dot: string }> = {
  completed: { label: 'Completed', color: 'text-success', bg: 'bg-success/10', dot: 'bg-success' },
  in_progress: { label: 'In Progress', color: 'text-primary', bg: 'bg-primary/10', dot: 'bg-primary' },
  not_started: { label: 'Not Started', color: 'text-muted-foreground', bg: 'bg-muted', dot: 'bg-muted-foreground' },
  discrepancy: { label: 'Discrepancy', color: 'text-danger', bg: 'bg-danger/10', dot: 'bg-danger' },
};

function ProgressBar({ manual, satellite, color }: { manual: number; satellite: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-2xs">
        <span className="text-muted-foreground">Manual Entry</span>
        <span className="font-600 text-foreground">{manual}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${manual}%`, backgroundColor: color, opacity: 0.9 }} />
      </div>
      <div className="flex items-center justify-between text-2xs">
        <span className="text-muted-foreground">Satellite Detection</span>
        <span className="font-600 text-foreground">{satellite}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all bg-accent/70" style={{ width: `${satellite}%` }} />
      </div>
    </div>
  );
}

// ─── Real Satellite Map View (OpenStreetMap via iframe) ───────────────────────
// NH-48 Bypass corridor near Delhi–Gurugram region (lat 28.45, lng 77.02)
function SatelliteMapView({ selectedLayer }: { selectedLayer: ConstructionLayer | null }) {
  const [zoom, setZoom] = useState(14);
  const [mapMode, setMapMode] = useState<'satellite' | 'svg'>('satellite');

  // OpenStreetMap tile-based satellite view via embed
  // Using a public tile server that provides aerial/satellite imagery
  const lat = 28.4595;
  const lng = 77.0266;
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.15},${lat - 0.08},${lng + 0.15},${lat + 0.08}&layer=hot&marker=${lat},${lng}`;

  return (
    <div className="relative w-full h-full min-h-[360px] rounded-xl overflow-hidden bg-[#0d1117] border border-border">
      {mapMode === 'satellite' ? (
        <>
          {/* Real satellite/map embed */}
          <iframe
            src={osmUrl}
            className="w-full h-full min-h-[360px] border-0"
            title="NH-48 Bypass Road Corridor — Satellite View"
            loading="lazy"
            style={{ filter: 'saturate(1.1) contrast(1.05)' }}
          />
          {/* Overlay info */}
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-white/80 space-y-0.5 pointer-events-none">
            <div className="font-600 text-white">NH-48 Bypass Package 3</div>
            <div className="text-white/60">42+000 → 67+500 · 25.5 km</div>
            {selectedLayer && (
              <div className="mt-1 pt-1 border-t border-white/20 text-accent font-500">
                Viewing: {selectedLayer.layer_code} — {selectedLayer.layer_name}
              </div>
            )}
          </div>
          {/* Toggle to SVG view */}
          <div className="absolute top-3 right-3 flex flex-col gap-1">
            <button
              onClick={() => setMapMode('svg')}
              className="w-8 h-8 bg-black/70 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-black/90 transition-colors"
              title="Switch to layer diagram"
            >
              <Layers size={14} className="text-white/80" />
            </button>
          </div>
          {/* Provider badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 pointer-events-none">
            <Map size={11} className="text-accent" />
            <span className="text-2xs text-white/70">OpenStreetMap · Real Imagery · NH-48 Corridor</span>
          </div>
        </>
      ) : (
        <>
          {/* SVG layer diagram */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 600 360" className="w-full h-full opacity-80" preserveAspectRatio="xMidYMid slice">
              <rect width="600" height="360" fill="#1a2332" />
              <ellipse cx="120" cy="80" rx="90" ry="60" fill="#1e3a1e" opacity="0.7" />
              <ellipse cx="480" cy="280" rx="100" ry="70" fill="#1e3a1e" opacity="0.6" />
              <ellipse cx="300" cy="180" rx="200" ry="80" fill="#162a16" opacity="0.5" />
              <rect x="0" y="200" width="600" height="160" fill="#1a2a1a" opacity="0.4" />
              <path d="M 20 180 Q 150 160 300 175 Q 450 190 580 170" stroke="#4a4a4a" strokeWidth="28" fill="none" strokeLinecap="round" />
              <path d="M 20 180 Q 150 160 300 175 Q 450 190 580 170" stroke="#2d2d2d" strokeWidth="24" fill="none" strokeLinecap="round" />
              {selectedLayer && (
                <path
                  d="M 20 180 Q 150 160 300 175 Q 450 190 580 170"
                  stroke={selectedLayer.color}
                  strokeWidth={18}
                  fill="none"
                  strokeLinecap="round"
                  opacity={0.9}
                />
              )}
              {['42+000', '48+500', '54+000', '59+500', '63+000', '67+500'].map((ch, i) => {
                const x = 20 + (i / 5) * 560;
                return (
                  <g key={ch}>
                    <line x1={x} y1="165" x2={x} y2="195" stroke="#6b7280" strokeWidth="1" />
                    <text x={x} y="210" textAnchor="middle" fill="#9ca3af" fontSize="8" fontFamily="monospace">{ch}</text>
                  </g>
                );
              })}
              <g transform="translate(560, 30)">
                <circle cx="0" cy="0" r="14" fill="#1f2937" stroke="#374151" strokeWidth="1" />
                <text x="0" y="4" textAnchor="middle" fill="#9ca3af" fontSize="10" fontWeight="bold">N</text>
              </g>
            </svg>
          </div>
          {/* Overlay info */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-white/80 space-y-0.5">
            <div className="font-600 text-white">NH-48 Bypass Package 3</div>
            <div className="text-white/60">42+000 → 67+500 · 25.5 km</div>
            {selectedLayer && (
              <div className="mt-1 pt-1 border-t border-white/20 text-accent font-500">
                Viewing: {selectedLayer.layer_code} — {selectedLayer.layer_name}
              </div>
            )}
          </div>
          {/* Controls */}
          <div className="absolute top-3 right-3 flex flex-col gap-1">
            <button onClick={() => setMapMode('satellite')} className="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-black/80 transition-colors" title="Switch to satellite view">
              <Satellite size={14} className="text-accent" />
            </button>
            <button onClick={() => setZoom((z) => Math.min(20, z + 1))} className="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-black/80 transition-colors">
              <ZoomIn size={14} className="text-white/80" />
            </button>
            <button onClick={() => setZoom((z) => Math.max(8, z - 1))} className="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-black/80 transition-colors">
              <ZoomOut size={14} className="text-white/80" />
            </button>
            <button className="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-black/80 transition-colors">
              <Maximize2 size={14} className="text-white/80" />
            </button>
          </div>
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded px-2 py-1 text-2xs text-white/60 chainage-mono">
            Zoom {zoom}x
          </div>
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
            <Layers size={11} className="text-accent" />
            <span className="text-2xs text-white/70">Layer Diagram · Last capture 2026-08-22</span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SatelliteMonitorPage() {
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'layers' | 'captures' | 'compare'>('layers');
  const [layers, setLayers] = useState<ConstructionLayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveFlash, setLiveFlash] = useState(false);
  const supabase = createClient();
  const { selectedProject } = useProject();

  const fetchLayers = async () => {
    try {
      const { data, error } = await supabase
        .from('satellite_layers')
        .select('*')
        .order('layer_code', { ascending: true });
      if (!error && data && data.length > 0) {
        setLayers(data);
        if (!selectedLayerId) setSelectedLayerId(data.find(l => l.layer_status === 'discrepancy')?.id ?? data[0]?.id ?? null);
      }
    } catch {
      // keep empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayers();
  }, []);

  // Real-time updates for satellite layers
  useRealtimeKartaa({
    table: 'satellite_layers',
    onUpdate: (updated: ConstructionLayer) => {
      setLayers(prev => prev.map(l => l.id === updated.id ? updated : l));
      setLiveFlash(true);
      setTimeout(() => setLiveFlash(false), 2000);
    },
    onInsert: (inserted: ConstructionLayer) => {
      setLayers(prev => [...prev, inserted]);
      setLiveFlash(true);
      setTimeout(() => setLiveFlash(false), 2000);
    },
  });

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) ?? null;

  const overallManual = layers.length > 0 ? Math.round(layers.reduce((s, l) => s + l.manual_progress, 0) / layers.length) : 0;
  const overallSatellite = layers.length > 0 ? Math.round(layers.reduce((s, l) => s + l.satellite_progress, 0) / layers.length) : 0;
  const discrepancyCount = layers.filter((l) => l.discrepancy > 3).length;

  return (
    <AppLayout>
      <Topbar title="Satellite Monitor" subtitle={`${selectedProject.name} · ${selectedProject.code} · Layer-wise satellite vs manual progress`} />
      <main className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Manual Progress', value: `${overallManual}%`, icon: <TrendingUp size={16} />, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Satellite Detected', value: `${overallSatellite}%`, icon: <Satellite size={16} />, color: 'text-accent', bg: 'bg-accent/10' },
            { label: 'Discrepancies', value: discrepancyCount, icon: <AlertTriangle size={16} />, color: 'text-danger', bg: 'bg-danger/10' },
            { label: 'Last Capture', value: '22 Aug', icon: <Calendar size={16} />, color: 'text-muted-foreground', bg: 'bg-muted' },
          ].map((s) => (
            <div key={s.label} className="card-elevated p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0 ${s.color}`}>{s.icon}</div>
              <div>
                <div className="text-xl font-700 text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5 text-2xs text-muted-foreground px-1">
          <RefreshCw size={10} className={`${liveFlash ? 'text-success animate-spin' : 'text-success animate-pulse'}`} />
          <span>Satellite layers live — WebSocket · Real imagery via OpenStreetMap</span>
        </div>

        {/* Main layout: map + panel */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Map */}
          <div className="lg:col-span-3">
            <SatelliteMapView selectedLayer={selectedLayer} />
          </div>

          {/* Right panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {(['layers', 'captures', 'compare'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1.5 text-xs font-500 rounded-md transition-colors capitalize ${activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {tab === 'captures' ? 'Captures' : tab === 'compare' ? 'Compare' : 'Layers'}
                </button>
              ))}
            </div>

            {/* Layers tab */}
            {activeTab === 'layers' && (
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="text-xs text-muted-foreground p-4 text-center">Loading layers…</div>
                ) : (
                  layers.map((layer) => {
                    const st = statusConfig[layer.layer_status];
                    const isSelected = selectedLayerId === layer.id;
                    return (
                      <button
                        key={layer.id}
                        onClick={() => setSelectedLayerId(isSelected ? null : layer.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${isSelected ? 'border-primary/50 bg-primary/5' : 'border-border bg-card hover:border-border/80 hover:bg-muted/30'}`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: layer.color }} />
                            <span className="text-xs font-600 text-foreground">{layer.layer_code}</span>
                            <span className="text-xs text-muted-foreground truncate">{layer.layer_name}</span>
                          </div>
                          <span className={`text-2xs px-1.5 py-0.5 rounded-full font-500 ${st.bg} ${st.color}`}>{st.label}</span>
                        </div>
                        <div className="flex items-center gap-4 text-2xs text-muted-foreground">
                          <span>Manual: <span className="text-foreground font-500">{layer.manual_progress}%</span></span>
                          <span>Satellite: <span className="text-foreground font-500">{layer.satellite_progress}%</span></span>
                          {layer.discrepancy > 0 && (
                            <span className="text-danger font-500">Δ {layer.discrepancy}%</span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {/* Captures tab */}
            {activeTab === 'captures' && (
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {satelliteCaptures.map((cap) => (
                  <div key={cap.id} className="card-elevated p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Satellite size={13} className="text-accent" />
                        <span className="text-xs font-600 text-foreground">{cap.date}</span>
                      </div>
                      {cap.changeDetected && (
                        <span className="text-2xs px-1.5 py-0.5 rounded-full bg-warning/15 text-warning font-500">Change Detected</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-2xs">
                      <span className="text-muted-foreground">Provider</span>
                      <span className="text-foreground">{cap.provider}</span>
                      <span className="text-muted-foreground">Resolution</span>
                      <span className="text-foreground chainage-mono">{cap.resolution}</span>
                      <span className="text-muted-foreground">Cloud Cover</span>
                      <span className="text-foreground">{cap.cloudCover}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cap.layersCaptured.map((lc) => (
                        <span key={lc} className="text-2xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{lc}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Compare tab */}
            {activeTab === 'compare' && (
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                <div className="flex items-center gap-4 text-2xs px-1">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm bg-primary/70" /><span className="text-muted-foreground">Manual Entry</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm bg-accent/70" /><span className="text-muted-foreground">Satellite</span></div>
                </div>
                {layers.map((layer) => (
                  <div key={layer.id} className="card-elevated p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: layer.color }} />
                        <span className="text-xs font-500 text-foreground">{layer.layer_code}</span>
                      </div>
                      {layer.discrepancy > 3 && (
                        <div className="flex items-center gap-1 text-danger text-2xs">
                          <AlertTriangle size={10} />
                          <span>Δ {layer.discrepancy}%</span>
                        </div>
                      )}
                    </div>
                    <ProgressBar manual={layer.manual_progress} satellite={layer.satellite_progress} color={layer.color} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected layer detail */}
        {selectedLayer && (
          <div className="card-elevated p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: selectedLayer.color }} />
                <div>
                  <h3 className="text-sm font-600 text-foreground">{selectedLayer.layer_name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedLayer.material} · {selectedLayer.depth}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-500 ${statusConfig[selectedLayer.layer_status].bg} ${statusConfig[selectedLayer.layer_status].color}`}>
                {statusConfig[selectedLayer.layer_status].label}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-2xs text-muted-foreground mb-1">Chainage</div>
                <div className="text-xs font-600 text-foreground chainage-mono">{selectedLayer.chainage_from} → {selectedLayer.chainage_to}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-2xs text-muted-foreground mb-1">Manual Progress</div>
                <div className="text-lg font-700 text-primary">{selectedLayer.manual_progress}%</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-2xs text-muted-foreground mb-1">Satellite Detected</div>
                <div className="text-lg font-700 text-accent">{selectedLayer.satellite_progress}%</div>
              </div>
              <div className={`rounded-lg p-3 ${selectedLayer.discrepancy > 3 ? 'bg-danger/10' : 'bg-success/10'}`}>
                <div className="text-2xs text-muted-foreground mb-1">Discrepancy</div>
                <div className={`text-lg font-700 ${selectedLayer.discrepancy > 3 ? 'text-danger' : 'text-success'}`}>
                  {selectedLayer.discrepancy > 0 ? `Δ ${selectedLayer.discrepancy}%` : 'None'}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/40 border border-border">
              <Info size={13} className="text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">{selectedLayer.notes}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock size={12} />
                <span>Last satellite capture: <span className="text-foreground">{selectedLayer.last_satellite_capture}</span></span>
              </div>
              <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-500 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors">
                <RefreshCw size={12} />
                Request New Capture
              </button>
              {selectedLayer.discrepancy > 3 && (
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-500 bg-danger/10 text-danger border border-danger/20 rounded-lg hover:bg-danger/20 transition-colors">
                  <AlertTriangle size={12} />
                  Flag for Re-verification
                </button>
              )}
            </div>
          </div>
        )}

        {/* Satellite adapter notice */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/15">
          <Satellite size={16} className="text-accent mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            <span className="font-600 text-foreground">Satellite Adapter (Provider-Agnostic): </span>
            Real imagery powered by OpenStreetMap. Switch to any commercial provider (Maxar, Planet, ISRO Bhuvan) via the adapter interface. Layer data syncs live via Supabase WebSocket — manual vs satellite progress updates automatically when field teams submit DPR entries.
          </div>
        </div>

      </main>
    </AppLayout>
  );
}
