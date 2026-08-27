'use client';
import React from 'react';
import Link from 'next/link';
import { Plus, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardHeaderActions() {
  const handleRefresh = () => {
    toast?.success('Dashboard refreshed', { description: 'Data is current as of 18:42 IST' });
  };

  const handleExport = () => {
    toast?.info('Preparing report export...', { description: 'PDF will be ready in a few seconds' });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRefresh}
        className="btn-secondary py-1.5 px-3 text-xs"
      >
        <RefreshCw size={13} />
        Refresh
      </button>
      <button
        onClick={handleExport}
        className="btn-secondary py-1.5 px-3 text-xs"
      >
        <Download size={13} />
        Export
      </button>
      <Link href="/project-setup" className="btn-primary py-1.5 px-3 text-xs">
        <Plus size={13} />
        New Project
      </Link>
    </div>
  );
}