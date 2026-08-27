'use client';
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// Weekly physical progress % — 12 weeks with realistic dip in weeks 6-7 (monsoon/material delay)
const progressData = [
  { week: 'W1 Jun', planned: 8.2, actual: 7.9 },
  { week: 'W2 Jun', planned: 16.1, actual: 15.4 },
  { week: 'W3 Jun', planned: 23.8, actual: 22.6 },
  { week: 'W4 Jun', planned: 31.5, actual: 30.1 },
  { week: 'W1 Jul', planned: 39.2, actual: 37.8 },
  { week: 'W2 Jul', planned: 47.0, actual: 42.3 },
  { week: 'W3 Jul', planned: 54.5, actual: 44.1 },
  { week: 'W4 Jul', planned: 61.8, actual: 51.7 },
  { week: 'W1 Aug', planned: 68.4, actual: 59.2 },
  { week: 'W2 Aug', planned: 74.9, actual: 66.8 },
  { week: 'W3 Aug', planned: 81.2, actual: 72.4 },
  { week: 'W4 Aug', planned: 87.5, actual: 77.1 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-elevated px-4 py-3 shadow-card-hover text-sm min-w-[160px]">
      <p className="text-xs text-muted-foreground mb-2 font-500">{label}</p>
      {payload.map((entry, i) => (
        <div key={`tt-entry-${i}`} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground text-xs">{entry.name}</span>
          </div>
          <span className="font-600 font-tabular text-foreground">{entry.value.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
};

export default function ProgressTrendChart() {
  const [activeLines, setActiveLines] = useState({ planned: true, actual: true });

  const toggleLine = (key: 'planned' | 'actual') => {
    setActiveLines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="card-elevated card-hover p-5 h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-600 text-foreground">Physical Progress Trend</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Cumulative progress % — all active projects · 12-week view</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => toggleLine('planned')}
            className={`flex items-center gap-1.5 transition-opacity ${activeLines.planned ? 'opacity-100' : 'opacity-40'}`}
          >
            <span className="w-3 h-0.5 bg-muted-foreground rounded" />
            <span className="text-muted-foreground">Planned</span>
          </button>
          <button
            onClick={() => toggleLine('actual')}
            className={`flex items-center gap-1.5 transition-opacity ${activeLines.actual ? 'opacity-100' : 'opacity-40'}`}
          >
            <span className="w-3 h-0.5 bg-accent rounded" />
            <span className="text-muted-foreground">Actual</span>
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={progressData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="gradPlanned" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--muted-foreground)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--muted-foreground)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={77.1} stroke="var(--accent)" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'Current', fill: 'var(--accent)', fontSize: 10, position: 'right' }} />
          {activeLines.planned && (
            <Area
              type="monotone"
              dataKey="planned"
              name="Planned"
              stroke="var(--muted-foreground)"
              strokeWidth={1.5}
              strokeDasharray="5 3"
              fill="url(#gradPlanned)"
              dot={false}
              activeDot={{ r: 4, fill: 'var(--muted-foreground)' }}
            />
          )}
          {activeLines.actual && (
            <Area
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#gradActual)"
              dot={false}
              activeDot={{ r: 5, fill: 'var(--accent)', stroke: 'var(--card)', strokeWidth: 2 }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
        <span className="text-danger font-500">▼ 10.4% behind plan at W3 Jul (monsoon delay)</span>
        <span>SPI: 0.87</span>
      </div>
    </div>
  );
}