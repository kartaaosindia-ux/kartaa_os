'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Ruler,
  Pentagon,
  MapPin,
  Settings2,
  Trash2,
  Link2,
  Download,
  RotateCcw,
  Move,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type ToolMode = 'pan' | 'scale' | 'linear' | 'area' | 'count';

interface Point {
  x: number;
  y: number;
}

interface Measurement {
  id: string;
  type: 'linear' | 'area' | 'count';
  label: string;
  points: Point[];
  value: number;
  unit: string;
  color: string;
  drawingRef?: string;
  linkedToBoq?: boolean;
}

interface ScaleConfig {
  pixelLength: number;
  realLength: number;
  unit: string;
  ratio: number; // meters per pixel
}

// ─── Color palette for measurements ──────────────────────────────────────────
const TOOL_COLORS: Record<string, string> = {
  linear: '#3b82f6',
  area: '#10b981',
  count: '#f59e0b',
};

// ─── Utility: compute distance ────────────────────────────────────────────────
function dist(a: Point, b: Point) {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

function polylineLength(pts: Point[]) {
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += dist(pts[i - 1], pts[i]);
  return total;
}

function polygonArea(pts: Point[]) {
  let area = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += pts[i].x * pts[j].y;
    area -= pts[j].x * pts[i].y;
  }
  return Math.abs(area) / 2;
}

// ─── Scale Modal ──────────────────────────────────────────────────────────────
function ScaleModal({
  onConfirm,
  onCancel,
  pixelLength,
}: {
  onConfirm: (realLength: number, unit: string) => void;
  onCancel: () => void;
  pixelLength: number;
}) {
  const [realLength, setRealLength] = useState('5.0');
  const [unit, setUnit] = useState('m');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-6 w-80 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-600 text-foreground">Set Scale</h3>
          <button onClick={onCancel} className="p-1 rounded hover:bg-muted transition-colors">
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
            Line drawn: <span className="font-600 text-foreground chainage-mono">{pixelLength.toFixed(1)} px</span>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Actual length of drawn line</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={realLength}
                onChange={e => setRealLength(e.target.value)}
                className="form-input flex-1 text-sm"
                step="0.1"
                min="0.01"
              />
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="form-input w-20 text-sm"
              >
                <option value="m">m</option>
                <option value="mm">mm</option>
                <option value="ft">ft</option>
              </select>
            </div>
          </div>
          <div className="text-xs text-muted-foreground bg-primary/5 border border-primary/20 rounded-lg p-2">
            Scale: <span className="font-600 text-primary">1 px = {(parseFloat(realLength) / pixelLength).toFixed(6)} {unit}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={onCancel} className="btn-secondary flex-1 py-2 text-xs">Cancel</button>
            <button
              onClick={() => onConfirm(parseFloat(realLength), unit)}
              className="btn-primary flex-1 py-2 text-xs"
              disabled={!realLength || parseFloat(realLength) <= 0}
            >
              Apply Scale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Link to BOQ Modal ────────────────────────────────────────────────────────
function LinkBoqModal({
  measurement,
  onConfirm,
  onCancel,
}: {
  measurement: Measurement;
  onConfirm: (boqRef: string) => void;
  onCancel: () => void;
}) {
  const [boqRef, setBoqRef] = useState('');
  const boqOptions = [
    'BOQ 1.1 — Earthwork in excavation',
    'BOQ 1.2 — Granular Sub-base (GSB)',
    'BOQ 2.1 — RCC columns & shear walls',
    'BOQ 2.2 — RCC flat slab',
    'BOQ 3.1 — Curtain wall glazing',
    'BOQ 4.1 — HVAC system',
    'BOQ 4.2 — Electrical HT/LT',
    'BOQ 5.1 — External hardscape',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-6 w-96 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-600 text-foreground">Link to BOQ Line Item</h3>
          <button onClick={onCancel} className="p-1 rounded hover:bg-muted transition-colors">
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <div className="text-xs text-muted-foreground">Measurement</div>
            <div className="text-sm font-600 text-foreground">{measurement.label}</div>
            <div className="text-xs text-primary font-tabular">
              {measurement.value.toFixed(3)} {measurement.unit}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Select BOQ Line Item</label>
            <select
              value={boqRef}
              onChange={e => setBoqRef(e.target.value)}
              className="form-input w-full text-sm"
            >
              <option value="">— Select BOQ item —</option>
              {boqOptions.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={onCancel} className="btn-secondary flex-1 py-2 text-xs">Cancel</button>
            <button
              onClick={() => boqRef && onConfirm(boqRef)}
              className="btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
              disabled={!boqRef}
            >
              <Link2 size={12} /> Link Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PdfTakeoffPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PDF state
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [pdfFileName, setPdfFileName] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  // Pan state
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef<Point>({ x: 0, y: 0 });
  const panOffsetStart = useRef<Point>({ x: 0, y: 0 });

  // Tool state
  const [activeTool, setActiveTool] = useState<ToolMode>('pan');
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [mousePos, setMousePos] = useState<Point | null>(null);

  // Scale state
  const [scale, setScale] = useState<ScaleConfig | null>(null);
  const [scalePoints, setScalePoints] = useState<Point[]>([]);
  const [showScaleModal, setShowScaleModal] = useState(false);

  // Measurements
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [measureCounter, setMeasureCounter] = useState({ linear: 1, area: 1, count: 1 });

  // Link BOQ modal
  const [linkTarget, setLinkTarget] = useState<Measurement | null>(null);

  // ─── Load PDF.js dynamically ────────────────────────────────────────────────
  const loadPdf = useCallback(async (file: File) => {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      const arrayBuffer = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
      setCurrentPage(1);
      setPdfFileName(file.name);
      setZoom(1.0);
      setPanOffset({ x: 0, y: 0 });
      setMeasurements([]);
      setCurrentPoints([]);
      setScalePoints([]);
      setScale(null);
    } catch (err) {
      console.error('PDF load error:', err);
    }
  }, []);

  // ─── Render PDF page ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    let cancelled = false;
    setIsRendering(true);

    (async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale: zoom });
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        if (overlayRef.current) {
          overlayRef.current.width = viewport.width;
          overlayRef.current.height = viewport.height;
        }
        if (!cancelled) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          setIsRendering(false);
        }
      } catch (e) {
        if (!cancelled) setIsRendering(false);
      }
    })();

    return () => { cancelled = true; };
  }, [pdfDoc, currentPage, zoom]);

  // ─── Draw overlay (measurements + in-progress) ──────────────────────────────
  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw committed measurements
    measurements.forEach(m => {
      ctx.save();
      ctx.strokeStyle = m.color;
      ctx.fillStyle = m.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);

      if (m.type === 'linear') {
        ctx.beginPath();
        m.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.stroke();
        m.points.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
        // Label
        const mid = m.points[Math.floor(m.points.length / 2)];
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(mid.x - 2, mid.y - 16, 80, 18);
        ctx.fillStyle = '#fff';
        ctx.font = '11px monospace';
        ctx.fillText(`${m.value.toFixed(2)} ${m.unit}`, mid.x + 2, mid.y - 2);
      } else if (m.type === 'area') {
        ctx.beginPath();
        m.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fillStyle = m.color + '33';
        ctx.fill();
        ctx.stroke();
        m.points.forEach(p => {
          ctx.fillStyle = m.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
        // Centroid label
        const cx = m.points.reduce((s, p) => s + p.x, 0) / m.points.length;
        const cy = m.points.reduce((s, p) => s + p.y, 0) / m.points.length;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(cx - 2, cy - 16, 90, 18);
        ctx.fillStyle = '#fff';
        ctx.font = '11px monospace';
        ctx.fillText(`${m.value.toFixed(2)} ${m.unit}`, cx + 2, cy - 2);
      } else if (m.type === 'count') {
        m.points.forEach((p, idx) => {
          ctx.fillStyle = m.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(idx + 1), p.x, p.y);
          ctx.textAlign = 'left';
          ctx.textBaseline = 'alphabetic';
        });
      }
      ctx.restore();
    });

    // Draw in-progress
    if (currentPoints.length > 0) {
      const color = activeTool === 'scale' ? '#f59e0b' : TOOL_COLORS[activeTool as keyof typeof TOOL_COLORS] || '#fff';
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);

      if (activeTool === 'linear' || activeTool === 'scale') {
        ctx.beginPath();
        currentPoints.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        if (mousePos) ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        currentPoints.forEach(p => {
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (activeTool === 'area') {
        ctx.beginPath();
        currentPoints.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        if (mousePos) ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        currentPoints.forEach(p => {
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      ctx.restore();
    }
  }, [measurements, currentPoints, mousePos, activeTool]);

  // ─── Canvas coordinate helper ───────────────────────────────────────────────
  function getCanvasPoint(e: React.MouseEvent<HTMLCanvasElement>): Point {
    const canvas = overlayRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  // ─── Mouse handlers ─────────────────────────────────────────────────────────
  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!pdfDoc) return;
    const pt = getCanvasPoint(e);

    if (activeTool === 'pan') {
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
      panOffsetStart.current = { ...panOffset };
      return;
    }

    if (activeTool === 'count') {
      // Immediately place a pin
      const newPts = [...currentPoints, pt];
      setCurrentPoints(newPts);
      return;
    }

    if (activeTool === 'scale' || activeTool === 'linear' || activeTool === 'area') {
      setCurrentPoints(prev => [...prev, pt]);
    }
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!pdfDoc) return;
    const pt = getCanvasPoint(e);
    setMousePos(pt);

    if (activeTool === 'pan' && isPanning.current) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPanOffset({ x: panOffsetStart.current.x + dx, y: panOffsetStart.current.y + dy });
    }
  }

  function handleMouseUp() {
    isPanning.current = false;
  }

  function handleDoubleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!pdfDoc) return;

    if (activeTool === 'linear') {
      commitLinear();
    } else if (activeTool === 'area') {
      commitArea();
    } else if (activeTool === 'count') {
      commitCount();
    } else if (activeTool === 'scale') {
      if (currentPoints.length >= 2) {
        const pxLen = polylineLength(currentPoints);
        setScalePoints(currentPoints);
        setShowScaleModal(true);
        setCurrentPoints([]);
      }
    }
  }

  // ─── Commit helpers ─────────────────────────────────────────────────────────
  function commitLinear() {
    if (currentPoints.length < 2) { setCurrentPoints([]); return; }
    const pxLen = polylineLength(currentPoints);
    const realLen = scale ? pxLen * scale.ratio : pxLen;
    const unit = scale ? scale.unit : 'px';
    const id = `m-${Date.now()}`;
    const label = `Linear ${measureCounter.linear}`;
    setMeasurements(prev => [...prev, {
      id, type: 'linear', label, points: [...currentPoints],
      value: realLen, unit, color: TOOL_COLORS.linear,
    }]);
    setMeasureCounter(prev => ({ ...prev, linear: prev.linear + 1 }));
    setCurrentPoints([]);
  }

  function commitArea() {
    if (currentPoints.length < 3) { setCurrentPoints([]); return; }
    const pxArea = polygonArea(currentPoints);
    const realArea = scale ? pxArea * scale.ratio * scale.ratio : pxArea;
    const unit = scale ? `${scale.unit}²` : 'px²';
    const id = `m-${Date.now()}`;
    const label = `Area ${measureCounter.area}`;
    setMeasurements(prev => [...prev, {
      id, type: 'area', label, points: [...currentPoints],
      value: realArea, unit, color: TOOL_COLORS.area,
    }]);
    setMeasureCounter(prev => ({ ...prev, area: prev.area + 1 }));
    setCurrentPoints([]);
  }

  function commitCount() {
    if (currentPoints.length < 1) return;
    const id = `m-${Date.now()}`;
    const label = `Count ${measureCounter.count}`;
    setMeasurements(prev => [...prev, {
      id, type: 'count', label, points: [...currentPoints],
      value: currentPoints.length, unit: 'nos', color: TOOL_COLORS.count,
    }]);
    setMeasureCounter(prev => ({ ...prev, count: prev.count + 1 }));
    setCurrentPoints([]);
  }

  function handleScaleConfirm(realLength: number, unit: string) {
    const pxLen = polylineLength(scalePoints);
    const ratio = realLength / pxLen;
    setScale({ pixelLength: pxLen, realLength, unit, ratio });
    setShowScaleModal(false);
    setScalePoints([]);
  }

  function deleteMeasurement(id: string) {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  }

  function linkToBoq(id: string, boqRef: string) {
    setMeasurements(prev => prev.map(m => m.id === id ? { ...m, linkedToBoq: true, drawingRef: boqRef } : m));
    setLinkTarget(null);
  }

  // ─── File drop handlers ─────────────────────────────────────────────────────
  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') loadPdf(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadPdf(file);
  }

  // ─── Tool config ─────────────────────────────────────────────────────────────
  const tools: { id: ToolMode; icon: React.ReactNode; label: string; shortcut: string; color: string }[] = [
    { id: 'pan', icon: <Move size={16} />, label: 'Pan', shortcut: 'P', color: 'text-muted-foreground' },
    { id: 'scale', icon: <Settings2 size={16} />, label: 'Set Scale', shortcut: 'S', color: 'text-warning' },
    { id: 'linear', icon: <Ruler size={16} />, label: 'Linear Measure', shortcut: 'L', color: 'text-info' },
    { id: 'area', icon: <Pentagon size={16} />, label: 'Area Measure', shortcut: 'A', color: 'text-accent' },
    { id: 'count', icon: <MapPin size={16} />, label: 'Count / Pin', shortcut: 'C', color: 'text-warning' },
  ];

  const cursorMap: Record<ToolMode, string> = {
    pan: 'grab',
    scale: 'crosshair',
    linear: 'crosshair',
    area: 'crosshair',
    count: 'cell',
  };

  const typeIcon: Record<string, React.ReactNode> = {
    linear: <Ruler size={12} className="text-info" />,
    area: <Pentagon size={12} className="text-accent" />,
    count: <MapPin size={12} className="text-warning" />,
  };

  const unitLabel: Record<string, string> = {
    linear: 'm',
    area: 'm²',
    count: 'nos',
  };

  return (
    <AppLayout currentPath="/pdf-takeoff">
      <Topbar
        title="PDF Drawing Takeoff"
        subtitle="Measurement & Quantity Extraction Tool"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/boq-workflow" className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
              <ArrowLeft size={13} /> BOQ Workflow
            </Link>
          </div>
        }
      />

      {/* Scale modal */}
      {showScaleModal && (
        <ScaleModal
          pixelLength={polylineLength(scalePoints)}
          onConfirm={handleScaleConfirm}
          onCancel={() => { setShowScaleModal(false); setScalePoints([]); }}
        />
      )}

      {/* Link BOQ modal */}
      {linkTarget && (
        <LinkBoqModal
          measurement={linkTarget}
          onConfirm={(ref) => linkToBoq(linkTarget.id, ref)}
          onCancel={() => setLinkTarget(null)}
        />
      )}

      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* ── Left: Toolbar + Canvas ─────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Toolbar strip */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-card flex-shrink-0 flex-wrap">
            {/* Tool buttons */}
            <div className="flex items-center gap-1 mr-3">
              {tools.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setActiveTool(t.id); setCurrentPoints([]); }}
                  title={`${t.label} (${t.shortcut})`}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-500 transition-all ${
                    activeTool === t.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className={activeTool === t.id ? '' : t.color}>{t.icon}</span>
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-border mx-1" />

            {/* Zoom controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoom(z => Math.max(0.3, +(z - 0.2).toFixed(1)))}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={15} className="text-muted-foreground" />
              </button>
              <span className="text-xs font-tabular text-muted-foreground w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(z => Math.min(4, +(z + 0.2).toFixed(1)))}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={15} className="text-muted-foreground" />
              </button>
            </div>

            <div className="w-px h-5 bg-border mx-1" />

            {/* Page navigation */}
            {pdfDoc && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
                >
                  <ChevronLeft size={15} className="text-muted-foreground" />
                </button>
                <span className="text-xs text-muted-foreground font-tabular">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
                >
                  <ChevronRight size={15} className="text-muted-foreground" />
                </button>
              </div>
            )}

            <div className="w-px h-5 bg-border mx-1" />

            {/* Scale indicator */}
            {scale ? (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-accent/10 border border-accent/20 rounded-lg">
                <CheckCircle2 size={12} className="text-accent" />
                <span className="text-xs text-accent font-500">
                  1 px = {scale.ratio.toFixed(5)} {scale.unit}
                </span>
                <button onClick={() => setScale(null)} className="ml-1 hover:text-destructive transition-colors">
                  <X size={11} className="text-accent/60" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-warning/10 border border-warning/20 rounded-lg">
                <AlertCircle size={12} className="text-warning" />
                <span className="text-xs text-warning">No scale set</span>
              </div>
            )}

            {/* Active tool hint */}
            {activeTool !== 'pan' && activeTool !== 'scale' && currentPoints.length > 0 && (
              <div className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                {activeTool === 'count'
                  ? `${currentPoints.length} pins — double-click to commit`
                  : `${currentPoints.length} pts — double-click to finish`}
              </div>
            )}

            {/* Upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="ml-auto btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
            >
              <Upload size={12} /> {pdfDoc ? 'Replace PDF' : 'Upload PDF'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Canvas area */}
          <div
            ref={containerRef}
            className="flex-1 overflow-auto bg-muted/30 relative"
            onDragOver={e => { e.preventDefault(); setIsDraggingFile(true); }}
            onDragLeave={() => setIsDraggingFile(false)}
            onDrop={handleFileDrop}
          >
            {!pdfDoc ? (
              /* Drop zone */
              <div className={`absolute inset-0 flex flex-col items-center justify-center transition-colors ${
                isDraggingFile ? 'bg-primary/5 border-2 border-dashed border-primary' : ''
              }`}>
                <div
                  className="flex flex-col items-center gap-4 p-10 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <FileText size={32} className="text-primary" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-600 text-foreground mb-1">Upload PDF Drawing</div>
                    <div className="text-xs text-muted-foreground">Drag & drop or click to browse</div>
                    <div className="text-xs text-muted-foreground mt-1">Supports .pdf construction drawings</div>
                  </div>
                  <button className="btn-primary py-2 px-5 text-xs flex items-center gap-2">
                    <Upload size={13} /> Choose PDF File
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="relative inline-block"
                style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px)` }}
              >
                {/* PDF canvas */}
                <canvas ref={canvasRef} className="block shadow-lg" />
                {/* Overlay canvas for measurements */}
                <canvas
                  ref={overlayRef}
                  className="absolute inset-0 block"
                  style={{
                    cursor: isPanning.current && activeTool === 'pan' ? 'grabbing' : cursorMap[activeTool],
                    opacity: 1,
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onDoubleClick={handleDoubleClick}
                />
                {isRendering && (
                  <div className="absolute inset-0 flex items-center justify-center bg-card/50">
                    <div className="text-xs text-muted-foreground animate-pulse">Rendering…</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status bar */}
          {pdfDoc && (
            <div className="flex items-center gap-4 px-4 py-1.5 border-t border-border bg-card text-xs text-muted-foreground flex-shrink-0">
              <span className="truncate max-w-[200px]">{pdfFileName}</span>
              <span>Page {currentPage}/{totalPages}</span>
              <span>Zoom {Math.round(zoom * 100)}%</span>
              <span>{measurements.length} measurements</span>
              {mousePos && (
                <span className="ml-auto font-tabular">
                  x: {mousePos.x.toFixed(0)} y: {mousePos.y.toFixed(0)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Right: Extracted Quantities Sidebar ────────────────────────────── */}
        <div className="w-80 flex-shrink-0 border-l border-border bg-card flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-600 text-foreground">Extracted Quantities</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{measurements.length} items logged</p>
              </div>
              {measurements.length > 0 && (
                <button
                  onClick={() => setMeasurements([])}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                  title="Clear all"
                >
                  <RotateCcw size={13} className="text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Summary chips */}
            {measurements.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {(['linear', 'area', 'count'] as const).map(type => {
                  const items = measurements.filter(m => m.type === type);
                  if (items.length === 0) return null;
                  return (
                    <div key={type} className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-500 ${
                      type === 'linear' ? 'bg-info/10 text-info' :
                      type === 'area' ? 'bg-accent/10 text-accent' : 'bg-warning/10 text-warning'
                    }`}>
                      {typeIcon[type]}
                      <span>{items.length} {type}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Measurement list */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {measurements.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <Ruler size={20} className="text-muted-foreground" />
                </div>
                <div>
                  <div className="text-sm font-500 text-foreground mb-1">No measurements yet</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    Upload a PDF and use the tools above to start measuring. Items will appear here automatically.
                  </div>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {measurements.map((m, idx) => (
                  <div key={m.id} className="px-4 py-3 hover:bg-muted/30 transition-colors group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: m.color }}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-600 text-foreground truncate">{m.label}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {typeIcon[m.type]}
                            <span className="text-xs text-muted-foreground capitalize">{m.type}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteMeasurement(m.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 flex-shrink-0"
                      >
                        <Trash2 size={12} className="text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>

                    {/* Value */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-700 font-tabular text-foreground">
                          {m.type === 'count' ? m.value : m.value.toFixed(3)}
                        </span>
                        <span className="text-xs text-muted-foreground">{m.unit}</span>
                      </div>
                      <div className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-tabular">
                        #{String(idx + 1).padStart(2, '0')}
                      </div>
                    </div>

                    {/* BOQ link status */}
                    {m.linkedToBoq ? (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-accent">
                        <CheckCircle2 size={11} />
                        <span className="truncate">{m.drawingRef}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setLinkTarget(m)}
                        className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-primary/30 text-xs text-primary hover:bg-primary/5 hover:border-primary/60 transition-all"
                      >
                        <Link2 size={11} /> Link to BOQ Line Item
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Export footer */}
          {measurements.length > 0 && (
            <div className="px-4 py-3 border-t border-border flex-shrink-0 space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                {(['linear', 'area', 'count'] as const).map(type => {
                  const items = measurements.filter(m => m.type === type);
                  let total = type === 'count'
                    ? items.reduce((s, m) => s + m.value, 0)
                    : items.reduce((s, m) => s + m.value, 0);
                  return (
                    <div key={type} className="bg-muted/50 rounded-lg p-2">
                      <div className="text-xs font-tabular font-600 text-foreground">
                        {type === 'count' ? total : total.toFixed(1)}
                      </div>
                      <div className="text-2xs text-muted-foreground capitalize">{type === 'linear' ? 'm total' : type === 'area' ? 'm² total' : 'nos total'}</div>
                    </div>
                  );
                })}
              </div>
              <button className="w-full btn-secondary py-2 text-xs flex items-center justify-center gap-1.5">
                <Download size={12} /> Export Quantities
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
