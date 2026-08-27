import React from 'react';
import AppLogo from '@/components/ui/AppLogo';
import { ShieldCheck, TrendingUp, ClipboardList, MapPin } from 'lucide-react';

const features = [
  { id: 'feat-verification', icon: <ShieldCheck size={16} />, label: 'Assisted Verification', desc: 'Evidence-backed progress, never automated certification' },
  { id: 'feat-progress', icon: <TrendingUp size={16} />, label: 'Progress Intelligence', desc: 'SPI, BOQ utilization and KARTAA score in one view' },
  { id: 'feat-boq', icon: <ClipboardList size={16} />, label: 'BOQ Management', desc: 'Drawing → Takeoff → BOQ chain with overrun alerts' },
  { id: 'feat-sites', icon: <MapPin size={16} />, label: 'Road & Industrial', desc: 'Chainage-based road + grid-based industrial project tracking' },
];

export default function LoginBrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-col bg-card border-r border-border p-10 xl:p-14 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>
      {/* Logo */}
      <div className="flex items-center gap-3 relative z-10">
        <AppLogo size={40} />
        <div>
          <span className="font-bold text-xl text-foreground tracking-tight block leading-none">KARTAA OS</span>
          <span className="text-xs text-muted-foreground">Construction Progress Intelligence</span>
        </div>
      </div>
      {/* Tagline */}
      <div className="mt-12 relative z-10">
        <h2 className="text-2xl font-700 text-foreground leading-tight">
          Infrastructure progress,<br />
          <span className="text-primary">verified at every chainage.</span>
        </h2>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Connecting field evidence, BOQ verification, and schedule intelligence for road and industrial infrastructure projects across India.
        </p>
      </div>
      {/* Features */}
      <div className="mt-10 space-y-4 relative z-10">
        {features?.map((f) => (
          <div key={f?.id} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
              {f?.icon}
            </div>
            <div>
              <div className="text-sm font-600 text-foreground">{f?.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{f?.desc}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Bottom badge */}
      <div className="mt-auto relative z-10 pt-10">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck size={13} className="text-accent" />
          <span>Funded prototype · Phase 1 · INR · Metric units · Indian numbering system</span>
        </div>
        <div className="mt-2 text-xs text-muted-foreground/50">
          All source code independently exportable and maintainable per KARTAA OS IP policy.
        </div>
      </div>
    </div>
  );
}