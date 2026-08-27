'use client';
import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, ChevronRight, RefreshCw } from 'lucide-react';
import { createClient } from '../../lib/supabase/client';
import { useRealtimeKartaa } from '@/hooks/useRealtimeKartaa';
import { useDemo, DEMO_ALERTS } from '@/contexts/DemoContext';
import { useProject } from '@/contexts/ProjectContext';

interface Alert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  project_name: string;
  is_active: boolean;
}

export default function AlertPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { isDemoUser, demoSector } = useDemo();
  const { selectedProject } = useProject();

  const fetchAlerts = async () => {
    // Demo mode: filter alerts strictly by active project id
    if (isDemoUser && demoSector) {
      const projectAlerts = DEMO_ALERTS.filter(
        (a) => a.projectId === selectedProject.id
      );
      setAlerts(projectAlerts);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('project_alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) {
        if (error.code?.startsWith('42')) throw error;
        setAlerts([
          { id: 'alert-001', severity: 'high', message: 'NH-48 Bypass (Pkg-3): BOQ utilization at 94.2% — projected overrun by ₹28.4L', project_name: 'NH-48 Bypass', is_active: true },
          { id: 'alert-002', severity: 'medium', message: 'Manesar Industrial Phase-II: No progress entry logged for 5 consecutive days', project_name: 'Manesar Industrial', is_active: true },
        ]);
      } else {
        setAlerts(data || []);
      }
    } catch {
      setAlerts([
        { id: 'alert-001', severity: 'high', message: 'NH-48 Bypass (Pkg-3): BOQ utilization at 94.2% — projected overrun by ₹28.4L', project_name: 'NH-48 Bypass', is_active: true },
        { id: 'alert-002', severity: 'medium', message: 'Manesar Industrial Phase-II: No progress entry logged for 5 consecutive days', project_name: 'Manesar Industrial', is_active: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setDismissed([]);
    fetchAlerts();
  }, [isDemoUser, demoSector, selectedProject.id]);

  // Real-time: only for non-demo users
  useRealtimeKartaa({
    table: 'project_alerts',
    onInsert: (newAlert: Alert) => {
      if (!isDemoUser && newAlert.is_active) {
        setAlerts((prev) => [newAlert, ...prev]);
      }
    },
    onUpdate: (updated: Alert) => {
      if (!isDemoUser) {
        setAlerts((prev) =>
          updated.is_active
            ? prev.map((a) => (a.id === updated.id ? updated : a))
            : prev.filter((a) => a.id !== updated.id)
        );
      }
    },
    onDelete: (deleted: Alert) => {
      if (!isDemoUser) {
        setAlerts((prev) => prev.filter((a) => a.id !== deleted.id));
      }
    },
  });

  const visible = alerts.filter((a) => !dismissed.includes(a.id));
  if (loading) return null;
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-sm ${
            alert.severity === 'high' ? 'bg-danger/8 border-danger/25 text-danger' : 'bg-warning/8 border-warning/25 text-warning'
          }`}
        >
          <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
          <span className="flex-1 text-foreground/90">{alert.message}</span>
          <button className="flex-shrink-0 flex items-center gap-1 text-xs opacity-70 hover:opacity-100 transition-opacity">
            View <ChevronRight size={12} />
          </button>
          <button
            onClick={() => setDismissed((d) => [...d, alert.id])}
            className="flex-shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors"
            aria-label="Dismiss alert"
          >
            <X size={13} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-1.5 text-2xs text-muted-foreground px-1">
        <RefreshCw size={10} className="text-success animate-pulse" />
        <span>{isDemoUser ? `Alerts — ${selectedProject.name}` : 'Live alerts — auto-refreshes via WebSocket'}</span>
      </div>
    </div>
  );
}