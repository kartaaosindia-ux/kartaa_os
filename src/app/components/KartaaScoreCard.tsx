import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

const projectScores = [
  { id: 'proj-score-001', name: 'NH-48 Bypass Pkg-3', score: 82, status: 'active' },
  { id: 'proj-score-002', name: 'Manesar Industrial Ph-II', score: 61, status: 'delayed' },
  { id: 'proj-score-003', name: 'Kundli–Manesar Expressway', score: 91, status: 'active' },
  { id: 'proj-score-004', name: 'Faridabad Ring Road', score: 74, status: 'on-hold' },
];

function ScoreBar({ score, id }: { score: number; id: string }) {
  const color = score >= 85 ? 'bg-accent' : score >= 70 ? 'bg-primary' : 'bg-danger';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Score ${score}`}
        />
      </div>
      <span className={`text-xs font-600 font-tabular w-7 text-right ${score >= 85 ? 'text-accent' : score >= 70 ? 'text-primary' : 'text-danger'}`}>
        {score}
      </span>
    </div>
  );
}

export default function KartaaScoreCard() {
  const avgScore = Math.round(projectScores.reduce((s, p) => s + p.score, 0) / projectScores.length);

  return (
    <div className="card-elevated card-hover h-full p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-500 text-muted-foreground uppercase tracking-wider">KARTAA Verification Score</span>
            <Info size={12} className="text-muted-foreground/60" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-hero-metric font-tabular text-foreground">{avgScore}</span>
            <span className="text-sm text-muted-foreground mb-1.5">/100 avg</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Composite: evidence quality × BOQ match × schedule adherence</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={22} className="text-accent" />
        </div>
      </div>

      {/* Per-project scores */}
      <div className="space-y-2.5 flex-1">
        {projectScores.map((p) => (
          <div key={p.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground/80 truncate max-w-[70%]">{p.name}</span>
              <span className={`text-2xs px-1.5 py-0.5 rounded-full font-500 ${
                p.status === 'active' ? 'bg-accent/10 text-accent' :
                p.status === 'delayed'? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
              }`}>
                {p.status}
              </span>
            </div>
            <ScoreBar score={p.score} id={p.id} />
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Assisted verification — not automated certification</span>
        <span className="text-xs text-accent font-500">4 active</span>
      </div>
    </div>
  );
}