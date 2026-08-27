'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const ProgressTrendChart = dynamic(() => import('./ProgressTrendChart'), { ssr: false });
const BoqUtilizationChart = dynamic(() => import('./BoqUtilizationChart'), { ssr: false });

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-6">
      <div className="lg:col-span-3 xl:col-span-3 2xl:col-span-3">
        <ProgressTrendChart />
      </div>
      <div className="lg:col-span-2 xl:col-span-2 2xl:col-span-2">
        <BoqUtilizationChart />
      </div>
    </div>
  );
}