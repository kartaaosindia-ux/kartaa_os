'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, MapPin, CheckCircle } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetId: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  icon: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-project-selector',
    title: 'Project Selector',
    description: 'Switch between Road and Industrial projects here. All dashboard data, KPIs, and charts update instantly to reflect the selected project.',
    targetId: 'tour-project-selector',
    position: 'bottom',
    icon: '🗂️',
  },
  {
    id: 'step-alert-panel',
    title: 'Alert Panel',
    description: 'Critical alerts appear here in real-time — BOQ overruns, missed progress entries, and deadline risks. High-severity alerts are shown in red.',
    targetId: 'tour-alert-panel',
    position: 'bottom',
    icon: '🚨',
  },
  {
    id: 'step-kpi-grid',
    title: 'KPI Dashboard',
    description: 'Key Performance Indicators at a glance — active sites, BOQ utilization, Schedule Performance Index (SPI), and your Kartaa Score.',
    targetId: 'tour-kpi-grid',
    position: 'bottom',
    icon: '📊',
  },
  {
    id: 'step-charts',
    title: 'Progress & BOQ Charts',
    description: 'Visual trends for progress over time and BOQ consumption. Use these to spot deviations early and take corrective action.',
    targetId: 'tour-charts',
    position: 'top',
    icon: '📈',
  },
  {
    id: 'step-project-table',
    title: 'Project Status Table',
    description: 'A detailed breakdown of all active projects — progress %, budget consumed, SPI, and current status. Click any row to drill into project details.',
    targetId: 'tour-project-table',
    position: 'top',
    icon: '📋',
  },
  {
    id: 'step-dpr-sidebar',
    title: 'DPR Submission Workflow',
    description: 'Submit Daily Progress Reports from the sidebar. Navigate to "DPR Entry" for road projects or "Industrial DPR" for industrial sites. Fill in work quantities, attach photos, and submit for verification.',
    targetId: 'tour-dpr-sidebar',
    position: 'right',
    icon: '📝',
  },
];

interface TooltipPosition {
  top: number;
  left: number;
  arrowDir: 'top' | 'bottom' | 'left' | 'right';
}

function getTooltipPosition(rect: DOMRect, position: TourStep['position'], tooltipW = 320, tooltipH = 180): TooltipPosition {
  const gap = 16;
  const arrowSize = 10;
  let top = 0;
  let left = 0;
  let arrowDir: TooltipPosition['arrowDir'] = position;

  switch (position) {
    case 'bottom':
      top = rect.bottom + gap + arrowSize;
      left = rect.left + rect.width / 2 - tooltipW / 2;
      arrowDir = 'top';
      break;
    case 'top':
      top = rect.top - tooltipH - gap - arrowSize;
      left = rect.left + rect.width / 2 - tooltipW / 2;
      arrowDir = 'bottom';
      break;
    case 'right':
      top = rect.top + rect.height / 2 - tooltipH / 2;
      left = rect.right + gap + arrowSize;
      arrowDir = 'left';
      break;
    case 'left':
      top = rect.top + rect.height / 2 - tooltipH / 2;
      left = rect.left - tooltipW - gap - arrowSize;
      arrowDir = 'right';
      break;
  }

  // Clamp to viewport
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  left = Math.max(12, Math.min(left, vw - tooltipW - 12));
  top = Math.max(12, Math.min(top, vh - tooltipH - 12));

  return { top, left, arrowDir };
}

interface GuidedTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function GuidedTour({ onComplete, onSkip }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition>({ top: 0, left: 0, arrowDir: 'top' });
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number | null>(null);

  const step = TOUR_STEPS[currentStep];

  const updatePosition = useCallback(() => {
    if (!step) return;
    const el = document.getElementById(step.targetId);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTargetRect(rect);
    setTooltipPos(getTooltipPosition(rect, step.position));
  }, [step]);

  useEffect(() => {
    // Small delay to let DOM settle
    const timer = setTimeout(() => {
      updatePosition();
      setVisible(true);
    }, 150);

    // Scroll target into view
    const el = document.getElementById(step?.targetId || '');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const handleResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updatePosition);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [currentStep, updatePosition, step]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setVisible(false);
      setTimeout(() => {
        setCurrentStep((s) => s + 1);
        setVisible(true);
      }, 200);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setVisible(false);
      setTimeout(() => {
        setCurrentStep((s) => s - 1);
        setVisible(true);
      }, 200);
    }
  };

  const isLast = currentStep === TOUR_STEPS.length - 1;

  // Spotlight cutout
  const spotlightPadding = 8;
  const spotlightStyle = targetRect
    ? {
        top: targetRect.top - spotlightPadding,
        left: targetRect.left - spotlightPadding,
        width: targetRect.width + spotlightPadding * 2,
        height: targetRect.height + spotlightPadding * 2,
      }
    : null;

  return (
    <>
      {/* Dark overlay with spotlight cutout */}
      <div
        className="fixed inset-0 z-[9998] pointer-events-none"
        style={{ background: 'rgba(0,0,0,0.55)' }}
      >
        {spotlightStyle && (
          <div
            className="absolute rounded-xl transition-all duration-300"
            style={{
              ...spotlightStyle,
              background: 'transparent',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
              border: '2px solid rgba(99,102,241,0.7)',
            }}
          />
        )}
      </div>

      {/* Click-blocker overlay (allows clicking only the tooltip) */}
      <div className="fixed inset-0 z-[9998]" onClick={onSkip} />

      {/* Tooltip card */}
      <div
        className={`fixed z-[9999] w-80 transition-all duration-200 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{ top: tooltipPos.top, left: tooltipPos.left }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Arrow */}
        {tooltipPos.arrowDir === 'top' && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-card" />
        )}
        {tooltipPos.arrowDir === 'bottom' && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-card" />
        )}
        {tooltipPos.arrowDir === 'left' && (
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-card" />
        )}
        {tooltipPos.arrowDir === 'right' && (
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-card" />
        )}

        <div className="bg-card border border-primary/30 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{step.icon}</span>
              <span className="text-sm font-600 text-foreground">{step.title}</span>
            </div>
            <button
              onClick={onSkip}
              className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Skip tour"
            >
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 pb-3">
            <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1.5 pb-2">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-200 ${
                  i === currentStep
                    ? 'w-4 h-1.5 bg-primary'
                    : i < currentStep
                    ? 'w-1.5 h-1.5 bg-primary/40' :'w-1.5 h-1.5 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <div className="flex items-center gap-1 text-2xs text-muted-foreground">
              <MapPin size={10} />
              <span>{currentStep + 1} of {TOUR_STEPS.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onSkip}
                className="text-2xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
              >
                Skip tour
              </button>
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-xs text-foreground"
                >
                  <ChevronLeft size={12} />
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 transition-colors text-xs text-white font-500"
              >
                {isLast ? (
                  <>
                    <CheckCircle size={12} />
                    Done
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight size={12} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
