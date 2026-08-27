'use client';
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';

const boqData = [
  { id: 'boq-chart-001', project: 'NH-48 Pkg-3', utilization: 94.2, budget: '₹6.2 Cr' },
  { id: 'boq-chart-002', project: 'KM Expressway', utilization: 52.8, budget: '₹14.8 Cr' },
  { id: 'boq-chart-003', project: 'Manesar Ind.', utilization: 91.7, budget: '₹9.1 Cr' },
  { id: 'boq-chart-004', project: 'Faridabad RR', utilization: 38.4, budget: '₹11.3 Cr' },
  { id: 'boq-chart-005', project: 'Bahadurgarh Bypass', utilization: 67.3, budget: '₹7.6 Cr' },
];

const getBarColor = (val: number) => {
  if (val >= 90) return 'var(--danger)';
  if (val >= 75) return 'var(--warning)';
  return 'var(--accent)';
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof boqData[0]; value: number }> }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="card-elevated px-4 py-3 shadow-card-hover text-sm min-w-[160px]">
      <p className="text-xs font-600 text-foreground mb-1">{d.project}</p>
      <div className="flex justify-between gap-4 text-xs">
        <span className="text-muted-foreground">Utilization</span>
        <span className="font-600 font-tabular" style={{ color: getBarColor(d.utilization) }}>{d.utilization}%</span>
      </div>
      <div className="flex justify-between gap-4 text-xs mt-1">
        <span className="text-muted-foreground">Sanctioned</span>
        <span className="font-500 text-foreground">{d.budget}</span>
      </div>
    </div>
  );
};

export default function BoqUtilizationChart() {
  return (
    <div className="card-elevated card-hover p-5 h-full">
      <div className="mb-4">
        <h3 className="text-sm font-600 text-foreground">BOQ Utilization by Project</h3>
        <p className="text-xs text-muted-foreground mt-0.5">% of sanctioned amount consumed · current period</p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={boqData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            dataKey="project"
            type="category"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={90}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={90} stroke="var(--danger)" strokeDasharray="4 4" strokeWidth={1} />
          <Bar dataKey="utilization" radius={[0, 4, 4, 0]} maxBarSize={18}>
            {boqData.map((entry) => (
              <Cell key={entry.id} fill={getBarColor(entry.utilization)} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-3 border-t border-border pt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-danger inline-block" />≥90% — At risk</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-warning inline-block" />75–89% — Monitor</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-accent inline-block" />&lt;75% — Normal</span>
      </div>
    </div>
  );
}