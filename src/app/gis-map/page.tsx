'use client';
import React, { useState, useRef, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import { Layers, Map, Filter, ZoomIn, ZoomOut, Maximize2, Eye, EyeOff, AlertTriangle, CheckCircle2, TrendingUp, ChevronRight, X, Info, Navigation, Activity, BarChart3, Shield,  } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';


// ─── Types ────────────────────────────────────────────────────────────────────
type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'clear';
type LayerKey = 'projects' | 'chainage' | 'progress' | 'risk' | 'terrain';

interface ChainageMarker {
  id: string;
  label: string;
  x: number;
  y: number;
  project: string;
  projectId: string;
}

interface ProjectSegment {
  id: string;
  name: string;
  shortName: string;
  color: string;
  progress: number;
  kartaaScore: number;
  risk: RiskLevel;
  startChainage: string;
  endChainage: string;
  contractor: string;
  budget: string;
  spent: string;
  phase: string;
  alertCount: number;
  // SVG path coordinates
  pathPoints: { x: number; y: number }[];
  labelX: number;
  labelY: number;
  // Chainage markers along the route
  chainageMarkers: ChainageMarker[];
}

interface HeatZone {
  id: string;
  cx: number;
  cy: number;
  r: number;
  risk: RiskLevel;
  label: string;
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const projects: ProjectSegment[] = [
  {
    id: 'nh48',
    name: 'NH-48 Package 3 — Delhi–Gurugram',
    shortName: 'NH-48 Pkg 3',
    color: '#f59e0b',
    progress: 77,
    kartaaScore: 82,
    risk: 'high',
    startChainage: '42+000',
    endChainage: '67+500',
    contractor: 'Dilip Buildcon Ltd.',
    budget: '₹3,84,00,000',
    spent: '₹2,96,00,000',
    phase: 'DBM Layer',
    alertCount: 3,
    pathPoints: [
      { x: 120, y: 320 },
      { x: 200, y: 290 },
      { x: 290, y: 270 },
      { x: 380, y: 255 },
      { x: 460, y: 240 },
      { x: 540, y: 230 },
    ],
    labelX: 330,
    labelY: 240,
    chainageMarkers: [
      { id: 'nh48-c1', label: '42+000', x: 120, y: 320, project: 'NH-48 Pkg 3', projectId: 'nh48' },
      { id: 'nh48-c2', label: '50+000', x: 290, y: 270, project: 'NH-48 Pkg 3', projectId: 'nh48' },
      { id: 'nh48-c3', label: '60+000', x: 460, y: 240, project: 'NH-48 Pkg 3', projectId: 'nh48' },
      { id: 'nh48-c4', label: '67+500', x: 540, y: 230, project: 'NH-48 Pkg 3', projectId: 'nh48' },
    ],
  },
  {
    id: 'nh19',
    name: 'NH-19 Package 1 — Delhi–Agra',
    shortName: 'NH-19 Pkg 1',
    color: '#ef4444',
    progress: 54,
    kartaaScore: 63,
    risk: 'critical',
    startChainage: '0+000',
    endChainage: '38+200',
    contractor: 'L&T Construction',
    budget: '₹5,12,00,000',
    spent: '₹2,76,00,000',
    phase: 'WMM Layer',
    alertCount: 7,
    pathPoints: [
      { x: 300, y: 180 },
      { x: 340, y: 240 },
      { x: 370, y: 310 },
      { x: 390, y: 380 },
      { x: 400, y: 450 },
      { x: 410, y: 510 },
    ],
    labelX: 430,
    labelY: 360,
    chainageMarkers: [
      { id: 'nh19-c1', label: '0+000', x: 300, y: 180, project: 'NH-19 Pkg 1', projectId: 'nh19' },
      { id: 'nh19-c2', label: '12+000', x: 370, y: 310, project: 'NH-19 Pkg 1', projectId: 'nh19' },
      { id: 'nh19-c3', label: '25+500', x: 400, y: 450, project: 'NH-19 Pkg 1', projectId: 'nh19' },
      { id: 'nh19-c4', label: '38+200', x: 410, y: 510, project: 'NH-19 Pkg 1', projectId: 'nh19' },
    ],
  },
  {
    id: 'dlexp',
    name: 'Delhi Expressway Package 2',
    shortName: 'DL Exp. Pkg 2',
    color: '#22c55e',
    progress: 91,
    kartaaScore: 88,
    risk: 'low',
    startChainage: '8+500',
    endChainage: '24+000',
    contractor: 'NCC Limited',
    budget: '₹2,18,00,000',
    spent: '₹1,98,00,000',
    phase: 'BC Layer',
    alertCount: 1,
    pathPoints: [
      { x: 160, y: 160 },
      { x: 220, y: 190 },
      { x: 280, y: 210 },
      { x: 340, y: 220 },
      { x: 400, y: 215 },
      { x: 460, y: 205 },
    ],
    labelX: 300,
    labelY: 185,
    chainageMarkers: [
      { id: 'dlexp-c1', label: '8+500', x: 160, y: 160, project: 'DL Exp. Pkg 2', projectId: 'dlexp' },
      { id: 'dlexp-c2', label: '14+000', x: 280, y: 210, project: 'DL Exp. Pkg 2', projectId: 'dlexp' },
      { id: 'dlexp-c3', label: '20+000', x: 400, y: 215, project: 'DL Exp. Pkg 2', projectId: 'dlexp' },
      { id: 'dlexp-c4', label: '24+000', x: 460, y: 205, project: 'DL Exp. Pkg 2', projectId: 'dlexp' },
    ],
  },
];

const heatZones: HeatZone[] = [
  { id: 'hz1', cx: 390, cy: 380, r: 55, risk: 'critical', label: 'NH-19 DBM Critical Zone' },
  { id: 'hz2', cx: 460, cy: 240, r: 40, risk: 'high', label: 'NH-48 DBM High Risk' },
  { id: 'hz3', cx: 370, cy: 310, r: 35, risk: 'medium', label: 'NH-19 WMM Delay' },
  { id: 'hz4', cx: 290, cy: 270, r: 30, risk: 'medium', label: 'NH-48 WMM Pending' },
  { id: 'hz5', cx: 300, cy: 190, r: 25, risk: 'low', label: 'DL Exp. Schedule Lag' },
];

const riskConfig: Record<RiskLevel, { color: string; bg: string; label: string; heatColor: string }> = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/40', label: 'Critical', heatColor: '#ef4444' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/40', label: 'High', heatColor: '#f97316' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/40', label: 'Medium', heatColor: '#eab308' },
  low: { color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/40', label: 'Low', heatColor: '#3b82f6' },
  clear: { color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/40', label: 'Clear', heatColor: '#22c55e' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pointsToPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  const first = points[0];
  const rest = points.slice(1);
  return `M ${first.x} ${first.y} ` + rest.map((p) => `L ${p.x} ${p.y}`).join(' ');
}

function progressToStrokeDasharray(progress: number, totalLength: number): string {
  const filled = (progress / 100) * totalLength;
  return `${filled} ${totalLength}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function LayerToggle({
  layerKey,
  label,
  icon,
  active,
  onToggle,
}: {
  layerKey: LayerKey;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onToggle: (k: LayerKey) => void;
}) {
  return (
    <button
      onClick={() => onToggle(layerKey)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-500 border transition-all ${
        active
          ? 'bg-primary/15 border-primary/40 text-primary' :'bg-muted/40 border-border text-muted-foreground hover:border-primary/20 hover:text-foreground'
      }`}
    >
      {active ? <Eye size={13} /> : <EyeOff size={13} />}
      {icon}
      {label}
    </button>
  );
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const cfg = riskConfig[risk];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-600 border ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function ProjectInfoPanel({
  project,
  onClose,
}: {
  project: ProjectSegment;
  onClose: () => void;
}) {
  const progressColor =
    project.progress >= 80 ? 'bg-green-500' : project.progress >= 60 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="absolute top-4 right-4 w-72 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-border">
        <div className="flex-1 min-w-0 pr-2">
          <div className="text-xs font-700 text-foreground leading-tight">{project.name}</div>
          <div className="text-2xs text-muted-foreground mt-0.5">
            {project.startChainage} → {project.endChainage}
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors flex-shrink-0">
          <X size={14} className="text-muted-foreground" />
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-px bg-border">
        <div className="bg-card p-3">
          <div className="text-2xs text-muted-foreground mb-1">Progress</div>
          <div className="text-lg font-700 text-foreground">{project.progress}%</div>
          <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full ${progressColor}`} style={{ width: `${project.progress}%` }} />
          </div>
        </div>
        <div className="bg-card p-3">
          <div className="text-2xs text-muted-foreground mb-1">KARTAA Score</div>
          <div className="text-lg font-700 text-foreground">{project.kartaaScore}<span className="text-xs text-muted-foreground">/100</span></div>
          <RiskBadge risk={project.risk} />
        </div>
        <div className="bg-card p-3">
          <div className="text-2xs text-muted-foreground mb-1">Budget</div>
          <div className="text-sm font-600 text-foreground">{project.budget}</div>
          <div className="text-2xs text-muted-foreground">Spent: {project.spent}</div>
        </div>
        <div className="bg-card p-3">
          <div className="text-2xs text-muted-foreground mb-1">Active Phase</div>
          <div className="text-sm font-600 text-foreground">{project.phase}</div>
          <div className="text-2xs text-muted-foreground">{project.alertCount} alert{project.alertCount !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Contractor */}
      <div className="px-4 py-3 border-t border-border">
        <div className="text-2xs text-muted-foreground mb-0.5">Contractor</div>
        <div className="text-xs font-500 text-foreground">{project.contractor}</div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-4">
        <a
          href="/project-detail"
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-600 hover:bg-primary/20 transition-colors"
        >
          View Project Detail <ChevronRight size={13} />
        </a>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GisMapPage() {
  const [activeLayers, setActiveLayers] = useState<Record<LayerKey, boolean>>({
    projects: true,
    chainage: true,
    progress: true,
    risk: true,
    terrain: false,
  });
  const [selectedProject, setSelectedProject] = useState<ProjectSegment | null>(null);
  const [hoveredZone, setHoveredZone] = useState<HeatZone | null>(null);
  const [zoom, setZoom] = useState(1);
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'all'>('all');
  const svgRef = useRef<SVGSVGElement>(null);
  const { selectedProject: selectedProjectState } = useProject();

  const toggleLayer = useCallback((key: LayerKey) => {
    setActiveLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const filteredProjects = filterRisk === 'all' ? projects : projects.filter((p) => p.risk === filterRisk);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));
  const handleReset = () => { setZoom(1); setSelectedProject(null); };

  // Summary stats
  const totalAlerts = projects.reduce((s, p) => s + p.alertCount, 0);
  const avgScore = Math.round(projects.reduce((s, p) => s + p.kartaaScore, 0) / projects.length);
  const criticalCount = projects.filter((p) => p.risk === 'critical').length;

  return (
    <AppLayout currentPath="/gis-map">
      <Topbar
        title="GIS Project Map"
        subtitle={`Interactive map — ${selectedProjectState?.name ?? 'All Projects'} · risk overlays, progress visualization`}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-2xs text-muted-foreground hidden lg:block">
              {projects.length} active projects · {totalAlerts} alerts
            </span>
          </div>
        }
      />

      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* ── Left Panel: Layers & Filters ── */}
        <aside className="w-56 flex-shrink-0 border-r border-border bg-card/60 flex flex-col overflow-y-auto scrollbar-thin">
          {/* Summary KPIs */}
          <div className="p-4 border-b border-border space-y-3">
            <div className="text-2xs font-700 uppercase tracking-widest text-muted-foreground/60">Map Summary</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-lg font-700 text-foreground">{projects.length}</div>
                <div className="text-2xs text-muted-foreground leading-tight">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-700 text-foreground">{avgScore}</div>
                <div className="text-2xs text-muted-foreground leading-tight">Avg Score</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-700 ${criticalCount > 0 ? 'text-red-400' : 'text-green-400'}`}>{criticalCount}</div>
                <div className="text-2xs text-muted-foreground leading-tight">Critical</div>
              </div>
            </div>
          </div>

          {/* Layer Controls */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-1.5 mb-3">
              <Layers size={13} className="text-primary" />
              <span className="text-2xs font-700 uppercase tracking-widest text-muted-foreground/60">Layers</span>
            </div>
            <div className="space-y-1.5">
              <LayerToggle layerKey="projects" label="Project Routes" icon={<Map size={12} />} active={activeLayers.projects} onToggle={toggleLayer} />
              <LayerToggle layerKey="chainage" label="Chainage Marks" icon={<Navigation size={12} />} active={activeLayers.chainage} onToggle={toggleLayer} />
              <LayerToggle layerKey="progress" label="Progress Overlay" icon={<TrendingUp size={12} />} active={activeLayers.progress} onToggle={toggleLayer} />
              <LayerToggle layerKey="risk" label="Risk Heatmap" icon={<AlertTriangle size={12} />} active={activeLayers.risk} onToggle={toggleLayer} />
              <LayerToggle layerKey="terrain" label="Terrain Grid" icon={<BarChart3 size={12} />} active={activeLayers.terrain} onToggle={toggleLayer} />
            </div>
          </div>

          {/* Risk Filter */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-1.5 mb-3">
              <Filter size={13} className="text-primary" />
              <span className="text-2xs font-700 uppercase tracking-widest text-muted-foreground/60">Filter by Risk</span>
            </div>
            <div className="space-y-1">
              {(['all', 'critical', 'high', 'medium', 'low', 'clear'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRisk(r)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                    filterRisk === r
                      ? 'bg-primary/15 text-primary border border-primary/30' :'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {r !== 'all' && (
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: riskConfig[r as RiskLevel].heatColor }}
                    />
                  )}
                  {r === 'all' && <span className="w-2 h-2 rounded-full flex-shrink-0 bg-muted-foreground/40" />}
                  <span className="capitalize">{r === 'all' ? 'All Projects' : riskConfig[r as RiskLevel].label}</span>
                  {r !== 'all' && (
                    <span className="ml-auto text-2xs opacity-60">
                      {projects.filter((p) => p.risk === r).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Project List */}
          <div className="p-4 flex-1">
            <div className="flex items-center gap-1.5 mb-3">
              <Activity size={13} className="text-primary" />
              <span className="text-2xs font-700 uppercase tracking-widest text-muted-foreground/60">Projects</span>
            </div>
            <div className="space-y-2">
              {filteredProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProject(selectedProject?.id === p.id ? null : p)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                    selectedProject?.id === p.id
                      ? 'border-primary/40 bg-primary/10' :'border-border hover:border-primary/20 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="text-xs font-600 text-foreground truncate">{p.shortName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden mr-2">
                      <div className="h-full rounded-full" style={{ width: `${p.progress}%`, backgroundColor: p.color }} />
                    </div>
                    <span className="text-2xs text-muted-foreground">{p.progress}%</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xs text-muted-foreground">{p.startChainage} → {p.endChainage}</span>
                    {p.alertCount > 0 && (
                      <span className="text-2xs text-red-400 font-600">{p.alertCount}⚠</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Map Canvas ── */}
        <div className="flex-1 relative overflow-hidden bg-[#0d1117]">
          {/* Map Controls */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors shadow-lg"
              title="Zoom In"
            >
              <ZoomIn size={14} className="text-foreground" />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors shadow-lg"
              title="Zoom Out"
            >
              <ZoomOut size={14} className="text-foreground" />
            </button>
            <button
              onClick={handleReset}
              className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors shadow-lg"
              title="Reset View"
            >
              <Maximize2 size={14} className="text-foreground" />
            </button>
          </div>

          {/* Zoom indicator */}
          <div className="absolute top-4 left-16 z-10 px-2 py-1 rounded bg-card/80 border border-border text-2xs text-muted-foreground">
            {Math.round(zoom * 100)}%
          </div>

          {/* Heatzone tooltip */}
          {hoveredZone && (
            <div className="absolute top-16 left-4 z-20 px-3 py-2 rounded-lg bg-card border border-border shadow-xl text-xs">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: riskConfig[hoveredZone.risk].heatColor }}
                />
                <span className="font-600 text-foreground">{hoveredZone.label}</span>
              </div>
              <div className={`text-2xs mt-0.5 ${riskConfig[hoveredZone.risk].color}`}>
                {riskConfig[hoveredZone.risk].label} Risk Zone
              </div>
            </div>
          )}

          {/* SVG Map */}
          <svg
            ref={svgRef}
            viewBox="0 0 700 600"
            className="w-full h-full"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.2s ease' }}
          >
            <defs>
              {/* Terrain grid pattern */}
              <pattern id="terrain-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e2a3a" strokeWidth="0.5" />
              </pattern>
              {/* Radial gradients for heat zones */}
              {heatZones.map((hz) => (
                <radialGradient key={`grad-${hz.id}`} id={`grad-${hz.id}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={riskConfig[hz.risk].heatColor} stopOpacity="0.45" />
                  <stop offset="100%" stopColor={riskConfig[hz.risk].heatColor} stopOpacity="0" />
                </radialGradient>
              ))}
              {/* Progress gradient per project */}
              {projects.map((p) => (
                <linearGradient key={`pgrd-${p.id}`} id={`pgrd-${p.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={p.color} stopOpacity="1" />
                  <stop offset={`${p.progress}%`} stopColor={p.color} stopOpacity="0.8" />
                  <stop offset={`${p.progress}%`} stopColor={p.color} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={p.color} stopOpacity="0.15" />
                </linearGradient>
              ))}
            </defs>

            {/* Background */}
            <rect width="700" height="600" fill="#0d1117" />

            {/* Terrain layer */}
            {activeLayers.terrain && (
              <rect width="700" height="600" fill="url(#terrain-grid)" />
            )}

            {/* Geographic context — stylized region outlines */}
            <g opacity="0.12">
              <ellipse cx="350" cy="300" rx="280" ry="220" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
              <ellipse cx="350" cy="300" rx="200" ry="160" fill="none" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 6" />
              {/* Region label */}
              <text x="350" y="520" textAnchor="middle" fill="#334155" fontSize="10" fontFamily="monospace">NCR REGION — DELHI</text>
            </g>

            {/* City nodes */}
            {[
              { x: 300, y: 175, label: 'Delhi' },
              { x: 130, y: 325, label: 'Gurugram' },
              { x: 415, y: 515, label: 'Agra' },
              { x: 155, y: 158, label: 'Noida' },
            ].map((city) => (
              <g key={city.label}>
                <circle cx={city.x} cy={city.y} r="6" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
                <circle cx={city.x} cy={city.y} r="2.5" fill="#64748b" />
                <text x={city.x + 9} y={city.y + 4} fill="#64748b" fontSize="9" fontFamily="monospace">{city.label}</text>
              </g>
            ))}

            {/* Risk Heatmap layer */}
            {activeLayers.risk && heatZones.map((hz) => (
              <circle
                key={hz.id}
                cx={hz.cx}
                cy={hz.cy}
                r={hz.r}
                fill={`url(#grad-${hz.id})`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredZone(hz)}
                onMouseLeave={() => setHoveredZone(null)}
              />
            ))}

            {/* Project Routes */}
            {activeLayers.projects && filteredProjects.map((p) => {
              const isSelected = selectedProject?.id === p.id;
              const path = pointsToPath(p.pathPoints);
              return (
                <g key={`route-${p.id}`}>
                  {/* Shadow/glow */}
                  <path
                    d={path}
                    fill="none"
                    stroke={p.color}
                    strokeWidth={isSelected ? 10 : 7}
                    strokeOpacity={0.12}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Base route (full, dimmed) */}
                  <path
                    d={path}
                    fill="none"
                    stroke={p.color}
                    strokeWidth={isSelected ? 4 : 3}
                    strokeOpacity={0.25}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="none"
                  />
                  {/* Progress overlay */}
                  {activeLayers.progress && (
                    <path
                      d={path}
                      fill="none"
                      stroke={`url(#pgrd-${p.id})`}
                      strokeWidth={isSelected ? 4 : 3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                  {/* Clickable hit area */}
                  <path
                    d={path}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={16}
                    className="cursor-pointer"
                    onClick={() => setSelectedProject(isSelected ? null : p)}
                  />
                  {/* Project label */}
                  {activeLayers.projects && (
                    <g>
                      <rect
                        x={p.labelX - 32}
                        y={p.labelY - 10}
                        width={64}
                        height={16}
                        rx={4}
                        fill="#0d1117"
                        fillOpacity={0.85}
                        stroke={p.color}
                        strokeWidth={0.8}
                        strokeOpacity={0.6}
                      />
                      <text
                        x={p.labelX}
                        y={p.labelY + 2}
                        textAnchor="middle"
                        fill={p.color}
                        fontSize="7.5"
                        fontFamily="monospace"
                        fontWeight="600"
                      >
                        {p.shortName}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Chainage Markers */}
            {activeLayers.chainage && filteredProjects.map((p) =>
              p.chainageMarkers.map((cm) => (
                <g key={cm.id}>
                  <circle cx={cm.x} cy={cm.y} r={4} fill="#0d1117" stroke={p.color} strokeWidth={1.5} />
                  <circle cx={cm.x} cy={cm.y} r={1.5} fill={p.color} />
                  <rect
                    x={cm.x + 6}
                    y={cm.y - 8}
                    width={36}
                    height={12}
                    rx={2}
                    fill="#0d1117"
                    fillOpacity={0.8}
                  />
                  <text
                    x={cm.x + 24}
                    y={cm.y + 2}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="7"
                    fontFamily="monospace"
                  >
                    {cm.label}
                  </text>
                </g>
              ))
            )}

            {/* Progress % badges on routes */}
            {activeLayers.progress && filteredProjects.map((p) => {
              const mid = p.pathPoints[Math.floor(p.pathPoints.length / 2)];
              return (
                <g key={`prog-badge-${p.id}`}>
                  <rect
                    x={mid.x - 16}
                    y={mid.y + 10}
                    width={32}
                    height={14}
                    rx={3}
                    fill={p.color}
                    fillOpacity={0.9}
                  />
                  <text
                    x={mid.x}
                    y={mid.y + 20}
                    textAnchor="middle"
                    fill="#000"
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="700"
                  >
                    {p.progress}%
                  </text>
                </g>
              );
            })}

            {/* Risk icons on critical/high zones */}
            {activeLayers.risk && filteredProjects
              .filter((p) => p.risk === 'critical' || p.risk === 'high')
              .map((p) => {
                const last = p.pathPoints[p.pathPoints.length - 2];
                return (
                  <g key={`risk-icon-${p.id}`}>
                    <circle cx={last.x} cy={last.y - 14} r={7} fill="#ef4444" fillOpacity={0.9} />
                    <text x={last.x} y={last.y - 10} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">!</text>
                  </g>
                );
              })}
          </svg>

          {/* Project Info Panel */}
          {selectedProject && (
            <ProjectInfoPanel project={selectedProject} onClose={() => setSelectedProject(null)} />
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 z-10 bg-card/90 border border-border rounded-xl p-3 backdrop-blur-sm">
            <div className="text-2xs font-700 uppercase tracking-widest text-muted-foreground/60 mb-2">Risk Legend</div>
            <div className="space-y-1">
              {(['critical', 'high', 'medium', 'low', 'clear'] as RiskLevel[]).map((r) => (
                <div key={r} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: riskConfig[r].heatColor, opacity: 0.8 }} />
                  <span className="text-2xs text-muted-foreground">{riskConfig[r].label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom status bar */}
          <div className="absolute bottom-4 right-4 z-10 flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/90 border border-border backdrop-blur-sm">
              <CheckCircle2 size={12} className="text-green-400" />
              <span className="text-2xs text-muted-foreground">
                {projects.filter((p) => p.risk === 'low' || p.risk === 'clear').length} on track
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/90 border border-border backdrop-blur-sm">
              <AlertTriangle size={12} className="text-red-400" />
              <span className="text-2xs text-muted-foreground">{totalAlerts} total alerts</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/90 border border-border backdrop-blur-sm">
              <Shield size={12} className="text-primary" />
              <span className="text-2xs text-muted-foreground">Avg KARTAA {avgScore}/100</span>
            </div>
          </div>

          {/* Hint */}
          {!selectedProject && (
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card/80 border border-border backdrop-blur-sm">
              <Info size={12} className="text-muted-foreground" />
              <span className="text-2xs text-muted-foreground">Click a route or project to inspect</span>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
