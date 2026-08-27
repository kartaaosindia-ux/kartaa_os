'use client';
import React, { useState, useEffect, Suspense } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, TrendingUp, Clock, MapPin, FileText, CheckCircle2, AlertCircle, Layers, Calendar, Users, IndianRupee, Activity, ClipboardList, Eye, Edit2, Archive, RotateCcw, Loader2, Train, Building2, Road, Home } from 'lucide-react';

import { projectService, type Project } from '@/lib/services/projectService';
import { useAuth } from '@/contexts/AuthContext';

type TabId = 'overview' | 'progress' | 'boq' | 'verification' | 'wbs' | 'schedule' | 'dpr' | 'documents' | 'drawings' | 'reports' | 'settings';

function ComingSoonTab({ label }: { label: string }) {
  return (
    <div className="card-elevated p-12 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Layers size={24} className="text-muted-foreground" />
      </div>
      <h3 className="text-base font-600 text-foreground mb-1">{label}</h3>
      <p className="text-sm text-muted-foreground">Planned Module — Coming Soon</p>
    </div>
  );
}

function OverviewTab({ project }: { project: Project }) {
  const typeIcon = project.projectType === 'Road' ? <Road size={16} /> :
    project.projectType === 'Railway' ? <Train size={16} /> :
    project.projectType === 'Industrial' ? <Building2 size={16} /> : <Home size={16} />;

  const fields = [
    { label: 'Project Code', value: project.projectCode, mono: true },
    { label: 'Project Type', value: project.projectType },
    { label: 'Location', value: project.location },
    { label: 'Client / Employer', value: project.client },
    { label: 'Main Contractor', value: project.contractor },
    { label: 'Consultant / PMC', value: project.consultant },
    { label: 'Contract Value', value: project.contractValue ? `₹${Number(project.contractValue).toLocaleString('en-IN')}` : '—' },
    { label: 'Start Date', value: project.startDate ? new Date(project.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
    { label: 'Planned Completion', value: project.plannedCompletionDate ? new Date(project.plannedCompletionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
    { label: 'Status', value: project.status.charAt(0).toUpperCase() + project.status.slice(1) },
    { label: 'Organisation', value: project.organisation },
    { label: 'Last Updated', value: project.lastUpdated || '—' },
  ];

  return (
    <div className="space-y-5">
      {/* Description */}
      {project.description && (
        <div className="card-elevated p-5">
          <h3 className="text-sm font-600 text-foreground mb-2">Project Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
          {project.isDemo && (
            <div className="mt-3 px-3 py-2 rounded-lg bg-warning/8 border border-warning/20 text-xs text-warning">
              ⚠ DEMO / SYNTHETIC DATA — This is a demonstration project with fictional data only.
            </div>
          )}
        </div>
      )}

      {/* Project details grid */}
      <div className="card-elevated p-5">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {typeIcon}
          </div>
          <h3 className="text-sm font-600 text-foreground">Project Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {fields.map((f) => f.value && f.value !== '—' ? (
            <div key={f.label}>
              <div className="text-xs text-muted-foreground mb-0.5">{f.label}</div>
              <div className={`text-sm font-500 text-foreground ${f.mono ? 'chainage-mono' : ''}`}>{f.value}</div>
            </div>
          ) : null)}
        </div>
      </div>

      {/* Progress summary */}
      <div className="card-elevated p-5">
        <h3 className="text-sm font-600 text-foreground mb-4">Progress Summary</h3>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">Physical Progress</span>
              <span className="text-sm font-600 font-tabular text-foreground">{project.progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${project.progress >= 80 ? 'bg-accent' : project.progress >= 50 ? 'bg-primary' : 'bg-warning'}`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <div className="text-lg font-700 font-tabular text-accent">{project.kartaaScore}/100</div>
              <div className="text-2xs text-muted-foreground">KARTAA Score</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-700 font-tabular ${project.spi < 1 ? 'text-warning' : 'text-accent'}`}>{project.spi.toFixed(2)}</div>
              <div className="text-2xs text-muted-foreground">SPI</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-700 font-tabular text-primary">{project.progress}%</div>
              <div className="text-2xs text-muted-foreground">Complete</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const projectId = searchParams.get('id');

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const canManage = profile?.role === 'admin' || profile?.role === 'project_manager';

  useEffect(() => {
    if (!projectId) {
      setError('No project ID provided');
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await projectService.getProject(projectId);
        if (!data) {
          setError('Project not found or you do not have access to this project.');
        } else {
          setProject(data);
        }
      } catch (err: any) {
        setError(err.message ?? 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [projectId]);

  const handleArchive = async () => {
    if (!project) return;
    setActionLoading(true);
    try {
      await projectService.archiveProject(project.id);
      setProject({ ...project, status: 'archived' });
      setSuccessMsg('Project archived. It will no longer appear in the active project list.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!project) return;
    setActionLoading(true);
    try {
      await projectService.restoreProject(project.id);
      setProject({ ...project, status: 'active' });
      setSuccessMsg('Project restored to active status.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode; implemented: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: <Activity size={14} />, implemented: true },
    { id: 'wbs', label: 'WBS', icon: <Layers size={14} />, implemented: false },
    { id: 'schedule', label: 'Schedule', icon: <Calendar size={14} />, implemented: false },
    { id: 'dpr', label: 'DPR', icon: <ClipboardList size={14} />, implemented: false },
    { id: 'documents', label: 'Documents', icon: <FileText size={14} />, implemented: false },
    { id: 'drawings', label: 'Drawings', icon: <Layers size={14} />, implemented: false },
    { id: 'boq', label: 'BOQ', icon: <ClipboardList size={14} />, implemented: false },
    { id: 'progress', label: 'Progress', icon: <TrendingUp size={14} />, implemented: false },
    { id: 'reports', label: 'Reports', icon: <FileText size={14} />, implemented: false },
    { id: 'verification', label: 'Verification', icon: <ShieldCheck size={14} />, implemented: false },
    { id: 'settings', label: 'Settings', icon: <Eye size={14} />, implemented: false },
  ];

  if (loading) {
    return (
      <AppLayout currentPath="/project-detail">
        <Topbar title="Project Detail" subtitle="Loading..." />
        <div className="flex items-center justify-center py-32">
          <Loader2 size={28} className="animate-spin text-primary" />
          <span className="ml-3 text-sm text-muted-foreground">Loading project...</span>
        </div>
      </AppLayout>
    );
  }

  if (error || !project) {
    return (
      <AppLayout currentPath="/project-detail">
        <Topbar title="Project Detail" subtitle="Error" />
        <div className="px-6 py-12 max-w-screen-2xl mx-auto">
          <div className="card-elevated p-8 flex flex-col items-center text-center">
            <AlertCircle size={32} className="text-danger mb-3" />
            <h3 className="text-base font-600 text-foreground mb-1">Unable to Load Project</h3>
            <p className="text-sm text-muted-foreground mb-5">{error ?? 'Project not found'}</p>
            <Link href="/projects" className="btn-primary px-6 py-2.5 text-sm">
              Back to Projects
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const kpiCards = [
    { id: 'kpi-progress', label: 'Physical Progress', value: `${project.progress}%`, sub: 'Overall completion', icon: <TrendingUp size={16} />, color: 'text-primary', bg: 'bg-primary/10' },
    { id: 'kpi-score', label: 'KARTAA Score', value: `${project.kartaaScore}/100`, sub: 'Evidence + BOQ + Schedule', icon: <ShieldCheck size={16} />, color: 'text-accent', bg: 'bg-accent/10' },
    { id: 'kpi-spi', label: 'Schedule (SPI)', value: `${project.spi.toFixed(2)}`, sub: project.spi < 1 ? `Behind schedule` : 'On schedule', icon: <Clock size={16} />, color: project.spi < 1 ? 'text-warning' : 'text-accent', bg: project.spi < 1 ? 'bg-warning/10' : 'bg-accent/10' },
    { id: 'kpi-value', label: 'Contract Value', value: project.contractValue ? `₹${(project.contractValue / 10000000).toFixed(1)} Cr` : '—', sub: project.client || 'Client', icon: <IndianRupee size={16} />, color: 'text-info', bg: 'bg-info/10' },
  ];

  return (
    <AppLayout currentPath="/project-detail">
      <Topbar
        title={project.name}
        subtitle={`${project.projectCode} · ${project.location} · ${project.projectType}`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/projects" className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
              <ArrowLeft size={13} /> Back
            </Link>
            {canManage && (
              <>
                <Link href={`/project-edit?id=${project.id}`} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
                  <Edit2 size={13} /> Edit
                </Link>
                <Link href="/project-team" className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
                  <Users size={13} /> Team
                </Link>
                {project.status === 'archived' ? (
                  <button
                    onClick={handleRestore}
                    disabled={actionLoading}
                    className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 text-accent border-accent/30"
                  >
                    {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                    Restore
                  </button>
                ) : (
                  <button
                    onClick={handleArchive}
                    disabled={actionLoading}
                    className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 text-warning border-warning/30"
                  >
                    {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <Archive size={13} />}
                    Archive
                  </button>
                )}
              </>
            )}
            <span className={`text-2xs px-2 py-1 rounded-full border font-500 capitalize ${
              project.status === 'active' ? 'bg-accent/10 text-accent border-accent/20' :
              project.status === 'archived' ? 'bg-muted text-muted-foreground border-border' :
              'bg-warning/10 text-warning border-warning/20'
            }`}>
              {project.status}
            </span>
          </div>
        }
      />

      <div className="px-6 xl:px-8 py-6 max-w-screen-2xl mx-auto space-y-5">
        {/* Notifications */}
        {successMsg && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm">
            <CheckCircle2 size={14} /> {successMsg}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
            <AlertCircle size={14} /> {error}
            <button onClick={() => setError(null)} className="ml-auto text-xs underline">Dismiss</button>
          </div>
        )}

        {/* Archived banner */}
        {project.status === 'archived' && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-warning/8 border border-warning/20">
            <Archive size={16} className="text-warning flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-500 text-warning">This project is archived</p>
              <p className="text-xs text-muted-foreground">It is hidden from the active project list. Restore it to make it active again.</p>
            </div>
            {canManage && (
              <button onClick={handleRestore} disabled={actionLoading} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 text-accent">
                <RotateCcw size={12} /> Restore
              </button>
            )}
          </div>
        )}

        {/* Demo banner */}
        {project.isDemo && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-warning/8 border border-warning/20">
            <AlertCircle size={16} className="text-warning flex-shrink-0" />
            <p className="text-sm text-warning">
              <span className="font-600">DEMO / SYNTHETIC DATA</span> — This is a demonstration project with fictional data only. Not based on any real project.
            </p>
          </div>
        )}

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <div key={kpi.id} className="card-elevated p-4 flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${kpi.bg} ${kpi.color}`}>
                {kpi.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground truncate">{kpi.label}</div>
                <div className={`text-xl font-700 font-tabular ${kpi.color}`}>{kpi.value}</div>
                <div className="text-2xs text-muted-foreground mt-0.5">{kpi.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Meta strip */}
        <div className="card-elevated px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          {project.startDate && (
            <div className="flex items-center gap-1.5 text-xs">
              <Calendar size={13} className="text-muted-foreground" />
              <span className="text-muted-foreground">Start:</span>
              <span className="font-500 text-foreground">{new Date(project.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          )}
          {project.plannedCompletionDate && (
            <div className="flex items-center gap-1.5 text-xs">
              <Calendar size={13} className="text-muted-foreground" />
              <span className="text-muted-foreground">Target:</span>
              <span className="font-500 text-foreground">{new Date(project.plannedCompletionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          )}
          {project.client && (
            <div className="flex items-center gap-1.5 text-xs">
              <Users size={13} className="text-muted-foreground" />
              <span className="text-muted-foreground">Client:</span>
              <span className="font-500 text-foreground truncate max-w-[200px]">{project.client}</span>
            </div>
          )}
          {project.location && (
            <div className="flex items-center gap-1.5 text-xs">
              <MapPin size={13} className="text-muted-foreground" />
              <span className="font-500 text-foreground">{project.location}</span>
            </div>
          )}
          {project.lastUpdated && (
            <div className="ml-auto text-2xs text-muted-foreground">Updated {project.lastUpdated}</div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border overflow-x-auto scrollbar-thin">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-500 border-b-2 transition-colors -mb-px whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && <OverviewTab project={project} />}
        {activeTab !== 'overview' && (
          <ComingSoonTab label={tabs.find(t => t.id === activeTab)?.label ?? activeTab} />
        )}
      </div>
    </AppLayout>
  );
}

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={
      <AppLayout currentPath="/project-detail">
        <Topbar title="Project Detail" subtitle="Loading..." />
        <div className="flex items-center justify-center py-32">
          <Loader2 size={28} className="animate-spin text-primary" />
          <span className="ml-3 text-sm text-muted-foreground">Loading project...</span>
        </div>
      </AppLayout>
    }>
      <ProjectDetailContent />
    </Suspense>
  );
}
