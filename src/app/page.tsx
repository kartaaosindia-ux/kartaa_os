'use client';
import React, { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, FileText, Ruler, BarChart2, Layers, CheckCircle, Zap } from 'lucide-react';

export default function LandingPage() {
  const canvasRef = useRef<HTMLDivElement>(null);

  const scrollToCanvas = () => {
    canvasRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden">
      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#c9a84c] flex items-center justify-center">
            <span className="text-black font-bold text-xs tracking-tight">K</span>
          </div>
          <span className="text-sm font-semibold tracking-wide text-white/90">KARTAA OS</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={scrollToCanvas}
            className="text-xs text-white/60 hover:text-white transition-colors px-3 py-1.5"
          >
            Try Free
          </button>
          <Link
            href="/dashboard"
            className="text-xs bg-[#c9a84c] text-black font-semibold px-4 py-2 rounded-lg hover:bg-[#d4b560] transition-colors"
          >
            Open Full App
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#c9a84c]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-[#c9a84c]/10 border border-[#c9a84c]/20 rounded-full px-3 py-1 mb-6">
            <Zap size={11} className="text-[#c9a84c]" />
            <span className="text-[11px] text-[#c9a84c] font-medium tracking-wide">100% Client-Side · No Server · No Upload Limits</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-white mb-6">
            The Lightweight,{' '}
            <span className="text-[#c9a84c]">Client-Side</span>{' '}
            PDF Takeoff &amp; BOQ Generator
          </h1>

          <p className="text-base md:text-lg text-white/50 leading-relaxed mb-10 max-w-xl">
            Upload any construction drawing PDF. Calibrate scale. Draw measurements directly on the page. Export a traceable Bill of Quantities — all in your browser, nothing leaves your machine.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={scrollToCanvas}
              className="inline-flex items-center gap-2 bg-[#c9a84c] text-black font-semibold text-sm px-6 py-3 rounded-xl hover:bg-[#d4b560] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Try Free Measure
              <ArrowRight size={15} />
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/80 font-medium text-sm px-6 py-3 rounded-xl hover:bg-white/10 transition-all"
            >
              Open Full App
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          {[
            { value: '0 KB', label: 'Server upload' },
            { value: '∞', label: 'Pages supported' },
            { value: '3', label: 'Measure tools' },
            { value: '1-click', label: 'BOQ export' },
          ]?.map(stat => (
            <div key={stat?.label} className="bg-[#0f0f0f] px-6 py-5">
              <div className="text-2xl font-bold text-[#c9a84c] mb-1">{stat?.value}</div>
              <div className="text-xs text-white/40">{stat?.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works — asymmetric bento ── */}
      <section className="px-6 md:px-12 pb-24 max-w-6xl mx-auto">
        <div className="mb-10">
          <p className="text-[11px] text-[#c9a84c] uppercase tracking-widest mb-2">Workflow</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">From PDF to BOQ in minutes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Large card */}
          <div className="md:col-span-3 bg-[#111] border border-white/5 rounded-2xl p-7 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#c9a84c]/10 flex items-center justify-center">
              <FileText size={18} className="text-[#c9a84c]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white mb-2">Upload &amp; Validate</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                Drop any PDF. The engine extracts text, page dimensions and metadata, then scores construction confidence against 60+ indicators — rejecting invoices, blank pages and scanned images automatically.
              </p>
            </div>
            <div className="mt-auto flex flex-wrap gap-2">
              {['Floor Plans', 'Structural Drawings', 'Site Layouts', 'Elevation Sheets']?.map(tag => (
                <span key={tag} className="text-[10px] bg-white/5 border border-white/8 text-white/50 px-2.5 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          </div>

          {/* Small cards column */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex-1">
              <div className="w-9 h-9 rounded-xl bg-[#c9a84c]/10 flex items-center justify-center mb-4">
                <Ruler size={16} className="text-[#c9a84c]" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">Calibrate Scale</h3>
              <p className="text-xs text-white/40 leading-relaxed">Draw a known reference line, enter its real-world length. All subsequent measurements convert automatically.</p>
            </div>
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex-1">
              <div className="w-9 h-9 rounded-xl bg-[#c9a84c]/10 flex items-center justify-center mb-4">
                <Layers size={16} className="text-[#c9a84c]" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">Draw &amp; Export</h3>
              <p className="text-xs text-white/40 leading-relaxed">Linear, area and count tools. Every measurement traces back to source page, scale and dimensions in the exported BOQ.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature highlights ── */}
      <section className="px-6 md:px-12 pb-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-[#c9a84c]/8 to-transparent border border-[#c9a84c]/15 rounded-2xl p-7">
            <BarChart2 size={20} className="text-[#c9a84c] mb-4" />
            <h3 className="text-base font-semibold text-white mb-2">Zero fabrication guarantee</h3>
            <p className="text-sm text-white/40 leading-relaxed">
              BOQ items are generated only from measurements you draw and confirm. The tool never invents quantities, sample items or placeholder data.
            </p>
          </div>
          <div className="bg-[#111] border border-white/5 rounded-2xl p-7">
            <CheckCircle size={20} className="text-[#c9a84c] mb-4" />
            <h3 className="text-base font-semibold text-white mb-2">Full traceability</h3>
            <p className="text-sm text-white/40 leading-relaxed">
              Every exported BOQ row includes source page, measurement type, calibrated scale, raw dimensions, computed quantity and unit — audit-ready from day one.
            </p>
          </div>
        </div>
      </section>

      {/* ── Embedded canvas CTA ── */}
      <section ref={canvasRef} className="px-6 md:px-12 pb-24 max-w-6xl mx-auto">
        <div className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden">
          <div className="px-8 py-10 border-b border-white/5 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-[11px] text-[#c9a84c] uppercase tracking-widest mb-2">Free Tool</p>
              <h2 className="text-xl md:text-2xl font-bold text-white">Start measuring now</h2>
              <p className="text-sm text-white/40 mt-1.5">No account required. Your PDF never leaves your browser.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/pdf-takeoff"
                className="inline-flex items-center gap-2 bg-[#c9a84c] text-black font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#d4b560] transition-all"
              >
                Open PDF Takeoff
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/app"
                className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 text-sm px-5 py-2.5 rounded-xl hover:bg-white/10 transition-all"
              >
                Full Enterprise App
              </Link>
            </div>
          </div>

          {/* Feature checklist */}
          <div className="px-8 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              'Upload any construction PDF',
              'Auto-detect drawing type',
              'Set real-world scale',
              'Linear, area & count tools',
              'Multi-page navigation',
              'Export BOQ as JSON',
            ]?.map(item => (
              <div key={item} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#c9a84c]/15 flex items-center justify-center shrink-0">
                  <CheckCircle size={10} className="text-[#c9a84c]" />
                </div>
                <span className="text-xs text-white/50">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 px-6 md:px-12 py-8 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#c9a84c] flex items-center justify-center">
            <span className="text-black font-bold text-[9px]">K</span>
          </div>
          <span className="text-xs text-white/30">KARTAA OS · Client-side PDF Takeoff</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/pdf-takeoff" className="text-xs text-white/30 hover:text-white/60 transition-colors">PDF Takeoff</Link>
          <Link href="/app" className="text-xs text-white/30 hover:text-white/60 transition-colors">Enterprise App</Link>
          <Link href="/login" className="text-xs text-white/30 hover:text-white/60 transition-colors">Login</Link>
        </div>
      </footer>
    </div>
  );
}