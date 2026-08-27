import React from 'react';
import {
  MapPin, ShieldCheck, ClipboardList, TrendingUp,
  IndianRupee, CalendarCheck, AlertTriangle, ArrowUp, ArrowDown, Minus
} from 'lucide-react';

type IconName = 'map-pin' | 'shield-check' | 'clipboard-list' | 'trending-up' | 'indian-rupee' | 'calendar-check';
type ColorVariant = 'accent' | 'warning' | 'info' | 'danger' | 'primary';
type TrendDir = 'up' | 'down' | 'neutral';

interface KpiCardProps {
  id: string;
  label: string;
  value: string;
  unit?: string;
  trend?: string;
  trendDirection?: TrendDir;
  icon: IconName;
  color: ColorVariant;
  alert?: boolean;
}

const iconMap: Record<IconName, React.ReactNode> = {
  'map-pin': <MapPin size={18} />,
  'shield-check': <ShieldCheck size={18} />,
  'clipboard-list': <ClipboardList size={18} />,
  'trending-up': <TrendingUp size={18} />,
  'indian-rupee': <IndianRupee size={18} />,
  'calendar-check': <CalendarCheck size={18} />,
};

const colorMap: Record<ColorVariant, { bg: string; text: string; border: string }> = {
  accent: { bg: 'bg-accent/10', text: 'text-accent', border: 'border-accent/20' },
  warning: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20' },
  info: { bg: 'bg-info/10', text: 'text-info', border: 'border-info/20' },
  danger: { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/20' },
  primary: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
};

export default function KpiCard({ id, label, value, unit, trend, trendDirection = 'neutral', icon, color, alert = false }: KpiCardProps) {
  const c = colorMap[color];

  return (
    <div
      id={id}
      className={`card-elevated card-hover p-5 flex flex-col gap-3 ${alert ? 'border-danger/30' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-500 text-muted-foreground uppercase tracking-wider leading-tight">{label}</span>
        <div className={`w-9 h-9 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0 ${c.text}`}>
          {alert ? <AlertTriangle size={16} /> : iconMap[icon]}
        </div>
      </div>

      <div>
        <div className="flex items-end gap-1.5">
          <span className="text-hero-metric font-tabular text-foreground">{value}</span>
          {unit && <span className="text-sm text-muted-foreground mb-1">{unit}</span>}
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-1 text-xs">
          {trendDirection === 'up' && <ArrowUp size={11} className="text-accent flex-shrink-0" />}
          {trendDirection === 'down' && <ArrowDown size={11} className="text-danger flex-shrink-0" />}
          {trendDirection === 'neutral' && <Minus size={11} className="text-muted-foreground flex-shrink-0" />}
          <span className={
            trendDirection === 'up' ? 'text-accent' :
            trendDirection === 'down'? 'text-danger' : 'text-muted-foreground'
          }>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}