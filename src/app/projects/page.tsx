'use client';
import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, TrendingUp, Building2, Road, Train, Home, MoreVertical, Archive, RotateCcw, Eye, Edit2, AlertCircle, Loader2, FolderOpen, IndianRupee, MapPin, Calendar, ChevronDown } from 'lucide-react';

import { projectService, type Project, type ProjectType, type ProjectStatus } from '@/lib/services/projectService';
import { useAuth } from '@/contexts/AuthContext';

const PROJECT_TYPE_ICONS: Record<string, React.ReactNode> = {
  Road: <Road size={14} />,
  Railway: <Train size={14} />,
  Industrial: <Building2 size={14} />,
  Building: <Home size={14} />,
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-accent/10 text-accent border-accent/20',
  delayed: 'bg-danger/10 text-danger border-danger/20',
  'on-hold': 'bg-warning/10 text-warning border-warning/20',
  draft: 'bg-muted text-muted-foreground border-border',
  completed: 'bg-info/10 text-info border-info/20',
  archived: 'bg-muted text-muted-foreground border-border',
};

function formatCurrency(val: number | null): string {
  if (!val) return '—';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  return `₹${val.toLocaleString('en-IN')}`;
}

function ProjectCard({ project, onArchive, onRestore, canManage }: {
  project: Project;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  canManage: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="card-elevated p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            project.projectType === 'Road' ? 'bg-primary/10 text-primary' :
            project.projectType === 'Railway' ? 'bg-info/10 text-info' :
            project.projectType === 'Industrial'? 'bg-accent/10 text-accent' : 'bg-warning/10 text-warning'
          }`}>
            {PROJECT_TYPE_ICONS[project.projectType]}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-600 text-foreground truncate">{project.name}</h3>
              {project.isDemo && (
                <span className="text-2xs px-1.5 py-0.5 rounded bg-warning/10 text-warning border border-warning/20 font-500 flex-shrink-0">DEMO</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground chainage-mono mt-0.5">{project.projectCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-2xs px-2 py-0.5 rounded-full border font-500 capitalize ${STATUS_COLORS[project.status] ?? STATUS_COLORS.draft}`}>
            {project.status}
          </span>
          {canManage && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                <MoreVertical size={14} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 z-20 bg-card border border-border rounded-xl shadow-lg py-1 min-w-[140px]">
                  <button
                    onClick={() => { setMenuOpen(false); router.push(`/project-detail?id=${project.id}`); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted"
                  >
                    <Eye size={12} /> View Details
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); router.push(`/project-edit?id=${project.id}`); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted"
                  >
                    <Edit2 size={12} /> Edit Project
                  </button>
                  <div className="border-t border-border my-1" />
                  {project.status === 'archived' ? (
                    <button
                      onClick={() => { setMenuOpen(false); onRestore(project.id); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-accent hover:bg-muted"
                    >
                      <RotateCcw size={12} /> Restore Project
                    </button>
                  ) : (
                    <button
                      onClick={() => { setMenuOpen(false); onArchive(project.id); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-warning hover:bg-muted"
                    >
                      <Archive size={12} /> Archive Project
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {project.location && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin size={11} />
            <span className="truncate">{project.location}</span>
          </div>
        )}
        {project.contractValue && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <IndianRupee size={11} />
            <span>{formatCurrency(project.contractValue)}</span>
          </div>
        )}
        {project.startDate && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar size={11} />
            <span>{new Date(project.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        )}
        {project.plannedCompletionDate && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar size={11} />
            <span>Due: {new Date(project.plannedCompletionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        )}
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">Progress</span>
          <span className="text-xs font-600 font-tabular text-foreground">{project.progress}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              project.progress >= 80 ? 'bg-accent' : project.progress >= 50 ? 'bg-primary' : 'bg-warning'
            }`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border/50">
        <span className="text-2xs text-muted-foreground">{project.projectType}</span>
        <Link
          href={`/project-detail?id=${project.id}`}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View Details <Eye size={11} />
        </Link>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ProjectType | ''>('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  const [showArchived, setShowArchived] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const canManage = profile?.role === 'admin' || profile?.role === 'project_manager';

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.listProjects({
        search,
        projectType: typeFilter,
        status: showArchived ? 'archived' : (statusFilter as ProjectStatus | ''),
        includeArchived: showArchived,
      });
      setProjects(data);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter, showArchived]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleArchive = async (id: string) => {
    setActionLoading(id);
    try {
      await projectService.archiveProject(id);
      setSuccessMsg('Project archived successfully');
      await loadProjects();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleRestore = async (id: string) => {
    setActionLoading(id);
    try {
      await projectService.restoreProject(id);
      setSuccessMsg('Project restored successfully');
      await loadProjects();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <AppLayout currentPath="/projects">
      <Topbar
        title="Projects"
        subtitle="All infrastructure projects in your organisation"
        actions={
          canManage ? (
            <Link href="/project-setup" className="btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5">
              <Plus size={14} /> New Project
            </Link>
          ) : undefined
        }
      />

      <div className="px-6 xl:px-8 py-6 max-w-screen-2xl mx-auto space-y-5">
        {/* Success message */}
        {successMsg && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm">
            <TrendingUp size={14} />
            {successMsg}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
            <AlertCircle size={14} />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-xs underline">Dismiss</button>
          </div>
        )}

        {/* Filters */}
        <div className="card-elevated p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-9 py-2 text-sm w-full"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as ProjectType | '')}
                className="form-input py-2 text-sm pr-8 appearance-none"
              >
                <option value="">All Types</option>
                <option value="Road">Road / Highway</option>
                <option value="Railway">Railway</option>
                <option value="Industrial">Industrial</option>
                <option value="Building">Building</option>
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | '')}
                className="form-input py-2 text-sm pr-8 appearance-none"
                disabled={showArchived}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="delayed">Delayed</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>

            <button
              onClick={() => { setShowArchived(!showArchived); setStatusFilter(''); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-500 transition-colors ${
                showArchived ? 'bg-warning/10 border-warning/30 text-warning' : 'border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              <Archive size={12} />
              {showArchived ? 'Showing Archived' : 'Show Archived'}
            </button>
          </div>

          <span className="text-xs text-muted-foreground ml-auto">
            {loading ? 'Loading...' : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-primary" />
            <span className="ml-3 text-sm text-muted-foreground">Loading projects...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="card-elevated p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <FolderOpen size={28} className="text-muted-foreground" />
            </div>
            <h3 className="text-base font-600 text-foreground mb-1">
              {showArchived ? 'No archived projects' : 'No projects found'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-5">
              {showArchived
                ? 'No projects have been archived yet.'
                : search || typeFilter || statusFilter
                ? 'No projects match your current filters. Try adjusting the search or filters.' :'Your organisation has no projects yet. Create your first project to get started.'}
            </p>
            {!showArchived && !search && !typeFilter && !statusFilter && canManage && (
              <Link href="/project-setup" className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
                <Plus size={15} /> Create First Project
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className={actionLoading === project.id ? 'opacity-50 pointer-events-none' : ''}>
                <ProjectCard
                  project={project}
                  onArchive={handleArchive}
                  onRestore={handleRestore}
                  canManage={canManage}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
