'use client';
import React, { useState, useEffect } from 'react';
import { Camera, ShieldCheck, AlertTriangle, FileText, UserCheck, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ActivityItem {
  id: string;
  type: 'photo' | 'verification' | 'alert' | 'entry' | 'approval' | 'progress';
  actor: string;
  action: string;
  project: string;
  detail?: string;
  time: string;
}

const FALLBACK_ACTIVITIES: ActivityItem[] = [
  { id: 'act-001', type: 'photo', actor: 'Suresh Pillai', action: 'uploaded 14 site photos', project: 'NH-48 Bypass Pkg-3', detail: 'Chainage 58+400 — base course layer', time: '18 min ago' },
  { id: 'act-002', type: 'verification', actor: 'Anita Sharma', action: 'verified progress entry', project: 'KM Expressway', detail: 'Entry #KME-2026-0841 — 4.2 km earthwork', time: '42 min ago' },
  { id: 'act-003', type: 'alert', actor: 'System', action: 'flagged BOQ overrun risk', project: 'NH-48 Bypass Pkg-3', detail: 'Item: Bituminous Macadam — 94.2% consumed', time: '1h 15m ago' },
  { id: 'act-004', type: 'entry', actor: 'Vikram Nair', action: 'submitted progress entry', project: 'Manesar Industrial Ph-II', detail: 'Grid B-4 to B-7 — structural steel erection', time: '2h 08m ago' },
  { id: 'act-005', type: 'approval', actor: 'Priya Mehta', action: 'approved DPR revision', project: 'Faridabad Ring Road', detail: 'Rev 3 — scope adjustment at Ch. 26+800', time: '3h 40m ago' },
  { id: 'act-006', type: 'progress', actor: 'Arjun Reddy', action: 'updated milestone status', project: 'Bahadurgarh Bypass', detail: 'M-4: Sub-base compaction — Completed', time: '5h 22m ago' },
];

const categoryToType: Record<string, ActivityItem['type']> = {
  verification: 'verification',
  export: 'approval',
  auth: 'progress',
  project: 'entry',
  data: 'photo',
  admin: 'alert',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const typeConfig = {
  photo: { icon: <Camera size={14} />, bg: 'bg-info/10', text: 'text-info' },
  verification: { icon: <ShieldCheck size={14} />, bg: 'bg-accent/10', text: 'text-accent' },
  alert: { icon: <AlertTriangle size={14} />, bg: 'bg-danger/10', text: 'text-danger' },
  entry: { icon: <FileText size={14} />, bg: 'bg-primary/10', text: 'text-primary' },
  approval: { icon: <UserCheck size={14} />, bg: 'bg-accent/10', text: 'text-accent' },
  progress: { icon: <TrendingUp size={14} />, bg: 'bg-secondary', text: 'text-muted-foreground' },
};

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>(FALLBACK_ACTIVITIES);
  const supabase = createClient();

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data, error } = await supabase
          .from('audit_log')
          .select('id, user_name, action, category, resource, details, created_at')
          .order('created_at', { ascending: false })
          .limit(10);
        if (!error && data && data.length > 0) {
          const mapped: ActivityItem[] = data.map((row: any) => ({
            id: row.id,
            type: (categoryToType[row.category] || 'entry') as ActivityItem['type'],
            actor: row.user_name || 'System',
            action: row.action?.toLowerCase() || 'performed action',
            project: row.resource || '',
            detail: row.details || '',
            time: timeAgo(row.created_at),
          }));
          setActivities(mapped);
        }
      } catch {
        // use fallback
      }
    };
    fetchActivity();
  }, []);

  return (
    <div className="card-elevated flex flex-col h-full">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-600 text-foreground">Field Activity</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Live updates from all sites</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-accent">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Live
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {activities.map((item, idx) => {
          const cfg = typeConfig[item.type];
          return (
            <div
              key={item.id}
              className={`px-5 py-3.5 hover:bg-muted/20 transition-colors cursor-pointer ${idx < activities.length - 1 ? 'border-b border-border/50' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg ${cfg.bg} ${cfg.text} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-foreground">
                    <span className="font-600">{item.actor}</span>
                    <span className="text-muted-foreground"> {item.action}</span>
                  </div>
                  {item.project && <div className="text-xs text-primary font-500 mt-0.5 truncate">{item.project}</div>}
                  {item.detail && (
                    <div className="text-2xs text-muted-foreground mt-0.5 truncate">{item.detail}</div>
                  )}
                </div>
                <span className="text-2xs text-muted-foreground flex-shrink-0">{item.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}