'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import DashboardBentoGrid from '../components/DashboardBentoGrid';
import DashboardCharts from '../components/DashboardCharts';
import ProjectStatusTable from '../components/ProjectStatusTable';
import ActivityFeed from '../components/ActivityFeed';
import AlertPanel from '../components/AlertPanel';
import DashboardHeaderActions from '../components/DashboardHeaderActions';
import GuidedTour from '@/components/GuidedTour';
import { useProject } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';

const TOUR_ELIGIBLE_ROLES = ['project_manager', 'site_engineer'];
const TOUR_STORAGE_KEY = 'kartaa_tour_completed';

export default function DashboardPage() {
  const { selectedProject } = useProject();
  const { user, profile } = useAuth();
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Determine role from profile or user metadata
    const role: string =
      profile?.role ||
      user?.user_metadata?.role ||
      '';

    const isEligible = TOUR_ELIGIBLE_ROLES.includes(role);
    if (!isEligible) return;

    // Check if this user has already completed the tour
    const storageKey = `${TOUR_STORAGE_KEY}_${user.id}`;
    const alreadyDone = localStorage.getItem(storageKey);
    if (!alreadyDone) {
      // Small delay so the dashboard renders first
      const timer = setTimeout(() => setShowTour(true), 800);
      return () => clearTimeout(timer);
    }
  }, [user, profile]);

  const handleTourComplete = () => {
    if (user) {
      localStorage.setItem(`${TOUR_STORAGE_KEY}_${user.id}`, 'true');
    }
    setShowTour(false);
  };

  const handleTourSkip = () => {
    if (user) {
      localStorage.setItem(`${TOUR_STORAGE_KEY}_${user.id}`, 'true');
    }
    setShowTour(false);
  };

  return (
    <AppLayout currentPath="/">
      <Topbar
        title="Dashboard"
        subtitle={`${selectedProject?.name} · ${selectedProject?.code} · Last updated 23 Aug 2026, 18:42 IST`}
        actions={<DashboardHeaderActions />}
      />
      <div className="px-6 xl:px-8 2xl:px-10 py-6 max-w-screen-2xl mx-auto space-y-6">
        {/* Alert banner */}
        <div id="tour-alert-panel">
          <AlertPanel />
        </div>
        {/* KPI Bento Grid */}
        <div id="tour-kpi-grid">
          <DashboardBentoGrid />
        </div>
        {/* Charts row */}
        <div id="tour-charts">
          <DashboardCharts />
        </div>
        {/* Table + Activity feed */}
        <div className="grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 2xl:col-span-2" id="tour-project-table">
            <ProjectStatusTable />
          </div>
          <div className="xl:col-span-1 2xl:col-span-1">
            <ActivityFeed />
          </div>
        </div>
      </div>

      {showTour && (
        <GuidedTour onComplete={handleTourComplete} onSkip={handleTourSkip} />
      )}
    </AppLayout>
  );
}
