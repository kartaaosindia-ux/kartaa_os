'use client';
import React, { useState, useEffect, Suspense } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Loader2, AlertCircle, CheckCircle2,
  Road, Train, Building2, Home
} from 'lucide-react';
import { projectService, type Project, type ProjectType, type ProjectStatus } from '@/lib/services/projectService';
import { useAuth } from '@/contexts/AuthContext';

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'Road', label: 'Road / Highway EPC' },
  { value: 'Railway', label: 'Railway / Rail Infrastructure' },
  { value: 'Industrial', label: 'Industrial EPC' },
  { value: 'Building', label: 'Building Construction' },
];

const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
];

interface FormState {
  name: string;
  projectCode: string;
  projectType: ProjectType;
  location: string;
  client: string;
  contractor: string;
  consultant: string;
  contractValue: string;
  startDate: string;
  plannedCompletionDate: string;
  description: string;
  status: ProjectStatus;
}

function ProjectEditContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const projectId = searchParams.get('id');

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<FormState>({
    name: '',
    projectCode: '',
    projectType: 'Road',
    location: '',
    client: '',
    contractor: '',
    consultant: '',
    contractValue: '',
    startDate: '',
    plannedCompletionDate: '',
    description: '',
    status: 'draft',
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const canManage = profile?.role === 'admin' || profile?.role === 'project_manager';

  useEffect(() => {
    if (!projectId) {
      setError('No project ID provided');
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const data = await projectService.getProject(projectId);
        if (!data) {
          setError('Project not found');
          return;
        }
        setProject(data);
        setForm({
          name: data.name,
          projectCode: data.projectCode,
          projectType: data.projectType,
          location: data.location,
          client: data.client,
          contractor: data.contractor,
          consultant: data.consultant,
          contractValue: data.contractValue ? String(data.contractValue) : '',
          startDate: data.startDate ?? '',
          plannedCompletionDate: data.plannedCompletionDate ?? '',
          description: data.description,
          status: data.status === 'archived' ? 'active' : data.status,
        });
      } catch (err: any) {
        setError(err.message ?? 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [projectId]);

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) errs.name = 'Project name is required';
    else if (form.name.trim().length < 5) errs.name = 'Name must be at least 5 characters';
    if (!form.projectCode.trim()) errs.projectCode = 'Project code is required';
    else if (!/^[A-Z0-9\-]+$/i.test(form.projectCode.trim())) errs.projectCode = 'Use letters, numbers and hyphens only';
    if (!form.client.trim()) errs.client = 'Client is required';
    if (!form.contractor.trim()) errs.contractor = 'Contractor is required';
    if (form.contractValue && isNaN(Number(form.contractValue))) errs.contractValue = 'Must be a valid number';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSave = async () => {
    if (!validate() || !project) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await projectService.updateProject({
        id: project.id,
        name: form.name,
        projectCode: form.projectCode,
        projectType: form.projectType,
        location: form.location,
        client: form.client,
        contractor: form.contractor,
        consultant: form.consultant,
        contractValue: form.contractValue ? Number(form.contractValue) : null,
        startDate: form.startDate || null,
        plannedCompletionDate: form.plannedCompletionDate || null,
        description: form.description,
        status: form.status,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push(`/project-detail?id=${project.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message ?? 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout currentPath="/project-edit">
        <Topbar title="Edit Project" subtitle="Loading..." />
        <div className="flex items-center justify-center py-32">
          <Loader2 size={28} className="animate-spin text-primary" />
          <span className="ml-3 text-sm text-muted-foreground">Loading project...</span>
        </div>
      </AppLayout>
    );
  }

  if (error && !project) {
    return (
      <AppLayout currentPath="/project-edit">
        <Topbar title="Edit Project" subtitle="Error" />
        <div className="px-6 py-12 max-w-screen-2xl mx-auto">
          <div className="card-elevated p-8 flex flex-col items-center text-center">
            <AlertCircle size={32} className="text-danger mb-3" />
            <h3 className="text-base font-600 text-foreground mb-1">Unable to Load Project</h3>
            <p className="text-sm text-muted-foreground mb-5">{error}</p>
            <Link href="/projects" className="btn-primary px-6 py-2.5 text-sm">Back to Projects</Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!canManage) {
    return (
      <AppLayout currentPath="/project-edit">
        <Topbar title="Edit Project" subtitle="Access Denied" />
        <div className="px-6 py-12 max-w-screen-2xl mx-auto">
          <div className="card-elevated p-8 flex flex-col items-center text-center">
            <AlertCircle size={32} className="text-warning mb-3" />
            <h3 className="text-base font-600 text-foreground mb-1">Insufficient Permissions</h3>
            <p className="text-sm text-muted-foreground mb-5">Only Owner (admin) or Project Manager can edit projects.</p>
            <Link href={`/project-detail?id=${projectId}`} className="btn-primary px-6 py-2.5 text-sm">Back to Project</Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const InputField = ({ label, field, type = 'text', placeholder, required, helper }: {
    label: string; field: keyof FormState; type?: string; placeholder?: string; required?: boolean; helper?: string;
  }) => (
    <div>
      <label className="form-label">{label}{required && <span className="text-danger ml-0.5">*</span>}</label>
      {helper && <p className="form-helper">{helper}</p>}
      <input
        type={type}
        value={form[field] as string}
        onChange={(e) => handleChange(field, e.target.value)}
        placeholder={placeholder}
        className={`form-input mt-1 ${fieldErrors[field] ? 'form-input-error' : ''}`}
      />
      {fieldErrors[field] && (
        <p className="form-error"><AlertCircle size={11} />{fieldErrors[field]}</p>
      )}
    </div>
  );

  return (
    <AppLayout currentPath="/project-edit">
      <Topbar
        title={`Edit: ${project?.name ?? 'Project'}`}
        subtitle={project?.projectCode ?? ''}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/project-detail?id=${projectId}`} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
              <ArrowLeft size={13} /> Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        }
      />

      <div className="px-6 xl:px-8 py-6 max-w-3xl mx-auto space-y-5">
        {/* Success */}
        {success && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm">
            <CheckCircle2 size={14} /> Changes saved successfully. Redirecting to project...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20">
            <AlertCircle size={16} className="text-danger flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-500 text-danger">Save Failed</p>
              <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-xs text-muted-foreground">✕</button>
          </div>
        )}

        {/* Demo warning */}
        {project?.isDemo && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-warning/8 border border-warning/20 text-warning text-sm">
            <AlertCircle size={14} />
            This is a DEMO project. Changes will be saved but this is synthetic data only.
          </div>
        )}

        {/* Project Type */}
        <div className="card-elevated p-5">
          <h2 className="text-base font-600 text-foreground mb-1">Project Type</h2>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {PROJECT_TYPES.map((pt) => {
              const isActive = form.projectType === pt.value;
              const icon = pt.value === 'Road' ? <Road size={16} /> : pt.value === 'Railway' ? <Train size={16} /> : pt.value === 'Industrial' ? <Building2 size={16} /> : <Home size={16} />;
              return (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => handleChange('projectType', pt.value)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    isActive ? 'border-primary bg-primary/8' : 'border-border hover:border-border/80'
                  }`}
                >
                  <span className={`${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{icon}</span>
                  <span className={`text-sm font-500 ${isActive ? 'text-primary' : 'text-foreground'}`}>{pt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Basic Info */}
        <div className="card-elevated p-5 space-y-4">
          <h2 className="text-base font-600 text-foreground">Project Identity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <InputField label="Project Name" field="name" required placeholder="e.g. NH-48 Bypass Package 3" />
            </div>
            <InputField label="Project Code" field="projectCode" required placeholder="e.g. NHAI-DL-2026-048" helper="Letters, numbers and hyphens only" />
            <InputField label="Location" field="location" placeholder="e.g. Gurgaon, Haryana" />
          </div>
        </div>

        {/* Organisations */}
        <div className="card-elevated p-5 space-y-4">
          <h2 className="text-base font-600 text-foreground">Organisations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Client / Employer" field="client" required placeholder="e.g. NHAI" />
            <InputField label="Main Contractor" field="contractor" required placeholder="e.g. L&T Infrastructure" />
            <InputField label="Consultant / PMC" field="consultant" placeholder="e.g. AECOM India" />
          </div>
        </div>

        {/* Budget & Schedule */}
        <div className="card-elevated p-5 space-y-4">
          <h2 className="text-base font-600 text-foreground">Budget & Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Contract Value (₹)" field="contractValue" type="number" placeholder="e.g. 621400000" helper="Enter amount in rupees (without ₹ symbol)" />
            <InputField label="Start Date" field="startDate" type="date" />
            <InputField label="Planned Completion" field="plannedCompletionDate" type="date" />
          </div>
        </div>

        {/* Status */}
        <div className="card-elevated p-5">
          <h2 className="text-base font-600 text-foreground mb-3">Project Status</h2>
          <div className="flex flex-wrap gap-2">
            {PROJECT_STATUSES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => handleChange('status', s.value)}
                className={`px-4 py-2 rounded-lg border text-sm font-500 transition-all ${
                  form.status === s.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="card-elevated p-5">
          <h2 className="text-base font-600 text-foreground mb-3">Description</h2>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Brief description of the project scope, objectives, and key details..."
            rows={4}
            className="form-input w-full resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between pb-6">
          <Link href={`/project-detail?id=${projectId}`} className="btn-secondary px-5 py-2.5">
            <ArrowLeft size={16} /> Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-8 py-2.5 text-sm"
          >
            {saving ? (
              <><Loader2 size={15} className="animate-spin" /> Saving Changes...</>
            ) : (
              <><Save size={15} /> Save Changes</>
            )}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

export default function ProjectEditPage() {
  return (
    <Suspense fallback={
      <AppLayout currentPath="/project-edit">
        <Topbar title="Edit Project" subtitle="Loading..." />
        <div className="flex items-center justify-center py-32">
          <Loader2 size={28} className="animate-spin text-primary" />
          <span className="ml-3 text-sm text-muted-foreground">Loading...</span>
        </div>
      </AppLayout>
    }>
      <ProjectEditContent />
    </Suspense>
  );
}
