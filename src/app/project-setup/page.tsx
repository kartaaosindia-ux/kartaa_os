import React from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import ProjectSetupWizard from './components/ProjectSetupWizard';

export default function ProjectSetupPage() {
  return (
    <AppLayout currentPath="/project-setup">
      <Topbar
        title="New Project"
        subtitle="Set up a new road or industrial infrastructure project"
      />
      <div className="px-6 xl:px-8 2xl:px-10 py-6 max-w-screen-2xl mx-auto">
        <ProjectSetupWizard />
      </div>
    </AppLayout>
  );
}