'use client';
import React, { useState, useEffect } from 'react';
import KpiCard from './KpiCard';
import KartaaScoreCard from './KartaaScoreCard';
import { createClient } from '@/lib/supabase/client';
import { useRealtimeKartaa } from '@/hooks/useRealtimeKartaa';
import { useDemo, DEMO_KPIS, PROJECT_KPIS } from '@/contexts/DemoContext';
import { useProject } from '@/contexts/ProjectContext';
import { RefreshCw } from 'lucide-react';

interface KpiData {
  active_sites: number;
  total_sites: number;
  pending_verifications: number;
  overdue_verifications: number;
  boq_utilization: number;
  boq_consumed_cr: number;
  avg_spi: number;
  cost_variance_cr: number;
  milestone_adherence: number;
  milestones_on_time: number;
  total_milestones: number;
  kartaa_score: number;
  updated_at?: string;
}

const FALLBACK: KpiData = {
  active_sites: 7, total_sites: 9, pending_verifications: 17, overdue_verifications: 5,
  boq_utilization: 68.4, boq_consumed_cr: 4.12, avg_spi: 0.87, cost_variance_cr: 1.16,
  milestone_adherence: 72.3, milestones_on_time: 18, total_milestones: 25, kartaa_score: 74,
};

export default function DashboardBentoGrid() {
  const [kpi, setKpi] = useState<KpiData>(FALLBACK);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const supabase = createClient();
  const { isDemoUser, demoSector } = useDemo();
  const { selectedProject } = useProject();

  const fetchKpis = async () => {
    // Demo mode: use per-project KPIs for the active project
    if (isDemoUser && demoSector) {
      const projectKpi = PROJECT_KPIS[selectedProject.id];
      if (projectKpi) {
        setKpi(projectKpi);
      } else if (demoSector) {
        // Fallback to sector-level if no project-specific KPI defined
        setKpi(DEMO_KPIS[demoSector]);
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('dashboard_kpis')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) {
        setKpi(data);
        setLastUpdated(new Date(data.updated_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      }
    } catch {
      // use fallback
    }
  };

  useEffect(() => {
    fetchKpis();
  }, [isDemoUser, demoSector, selectedProject.id]);

  useRealtimeKartaa({
    table: 'dashboard_kpis',
    onUpdate: (updated: KpiData) => {
      if (!isDemoUser) {
        setKpi(updated);
        setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      }
    },
    onInsert: (inserted: KpiData) => {
      if (!isDemoUser) {
        setKpi(inserted);
        setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      }
    },
  });

  return (
    <div className="space-y-2">
      {(lastUpdated || isDemoUser) && (
        <div className="flex items-center gap-1.5 text-2xs text-muted-foreground px-1">
          <RefreshCw size={10} className="text-success animate-pulse" />
          <span>
            {isDemoUser
              ? `KPIs — ${selectedProject.name}`
              : `KPIs live — last updated ${lastUpdated}`}
          </span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {/* Hero card — KARTAA Score — spans 2 cols */}
        <div className="md:col-span-2 lg:col-span-1 xl:col-span-2 2xl:col-span-2">
          <KartaaScoreCard />
        </div>

        {/* Active Sites */}
        <KpiCard
          id="kpi-active-sites"
          label="Active Sites Today"
          value={String(kpi.active_sites)}
          unit={`of ${kpi.total_sites}`}
          trend="+1 vs yesterday"
          trendDirection="up"
          icon="map-pin"
          color="accent"
        />

        {/* Pending Verifications */}
        <KpiCard
          id="kpi-pending-verif"
          label="Pending Verifications"
          value={String(kpi.pending_verifications)}
          unit="entries"
          trend={`${kpi.overdue_verifications} overdue >3 days`}
          trendDirection="down"
          icon="shield-check"
          color="warning"
          alert
        />

        {/* BOQ Utilization */}
        <KpiCard
          id="kpi-boq"
          label="BOQ Utilization"
          value={`${kpi.boq_utilization}%`}
          unit="of sanctioned"
          trend={`₹${kpi.boq_consumed_cr} Cr consumed`}
          trendDirection="neutral"
          icon="clipboard-list"
          color="info"
        />

        {/* SPI */}
        <KpiCard
          id="kpi-spi"
          label="Avg. Schedule Performance"
          value={String(kpi.avg_spi)}
          unit="SPI"
          trend="−0.04 vs last week"
          trendDirection="down"
          icon="trending-up"
          color="warning"
          alert
        />

        {/* Cost Variance */}
        <KpiCard
          id="kpi-cost-var"
          label="Cost-at-Completion Variance"
          value={`+₹${kpi.cost_variance_cr} Cr`}
          unit="projected overrun"
          trend="2 projects at risk"
          trendDirection="down"
          icon="indian-rupee"
          color="danger"
          alert
        />

        {/* Schedule Adherence */}
        <KpiCard
          id="kpi-schedule"
          label="Milestone Adherence"
          value={`${kpi.milestone_adherence}%`}
          unit="on-time"
          trend={`${kpi.milestones_on_time} of ${kpi.total_milestones} milestones`}
          trendDirection="neutral"
          icon="calendar-check"
          color="accent"
        />
      </div>
    </div>
  );
}