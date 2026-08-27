'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle2, Loader2, Building2, Road, Train, Home, Calendar, IndianRupee, Users, MapPin, FileText, AlertCircle } from 'lucide-react';
import type { ProjectFormData } from './ProjectSetupWizard';
import { projectService } from '@/lib/services/projectService';

interface Props {
  formData: ProjectFormData;
  onBack: () => void;
}

function ReviewSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          {icon}
        </div>
        <h3 className="text-sm font-600 text-foreground">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
        {children}
      </div>
    </div>
  );
}

function ReviewField({ label, value, mono = false, highlight = false }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div className={`text-sm font-500 ${mono ? 'chainage-mono' : ''} ${highlight ? 'text-primary font-600' : 'text-foreground'}`}>
        {value}
      </div>
    </div>
  );
}

const typeIcon: Record<string, React.ReactNode> = {
  Road: <Road size={20} className="text-primary" />,
  Railway: <Train size={20} className="text-info" />,
  Industrial: <Building2 size={20} className="text-accent" />,
  Building: <Home size={20} className="text-warning" />,
};

export default function StepReview({ formData, onBack }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  const handleCreate = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Parse contract value from string (remove ₹, commas, etc.)
      let contractValue: number | null = null;
      if (formData.sanctionedBudget) {
        const cleaned = formData.sanctionedBudget.replace(/[^0-9.]/g, '');
        const parsed = parseFloat(cleaned);
        if (!isNaN(parsed)) contractValue = parsed;
      }

      const project = await projectService.createProject({
        name: formData.projectName,
        projectCode: formData.projectCode,
        projectType: formData.projectType,
        location: [formData.location, formData.district, formData.state].filter(Boolean).join(', '),
        client: formData.clientOrg,
        contractor: formData.contractorOrg,
        consultant: formData.pmcOrg,
        contractValue,
        startDate: formData.startDate || null,
        plannedCompletionDate: formData.targetCompletionDate || null,
        description: formData.description || '',
        status: 'draft',
      });

      setCreatedProjectId(project.id);
      setSubmitted(true);

      // Navigate to the real project detail page after a short delay
      setTimeout(() => router.push(`/project-detail?id=${project.id}`), 1800);
    } catch (err: any) {
      setError(err.message ?? 'Failed to create project. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (submitted && createdProjectId) {
    return (
      <div className="card-elevated p-12 flex flex-col items-center justify-center text-center fade-in">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-accent" />
        </div>
        <h2 className="text-xl font-700 text-foreground">Project Created</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          {formData.projectName} has been saved to the database and is now active in KARTAA OS.
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={14} className="animate-spin" />
          Redirecting to project...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20">
          <AlertCircle size={16} className="text-danger flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-500 text-danger">Failed to Create Project</p>
            <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
        </div>
      )}

      {/* Review header */}
      <div className="card-elevated p-5 flex items-start gap-4 border-primary/20 bg-primary/4">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
          {typeIcon[formData.projectType] ?? <Building2 size={20} className="text-primary" />}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-700 text-foreground truncate">{formData.projectName || 'Untitled Project'}</h2>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-500 ${
              formData.projectType === 'Road' ? 'bg-primary/10 text-primary' :
              formData.projectType === 'Railway' ? 'bg-info/10 text-info' :
              formData.projectType === 'Industrial'? 'bg-accent/10 text-accent' : 'bg-warning/10 text-warning'
            }`}>
              {formData.projectType}
            </span>
            <span className="text-xs text-muted-foreground chainage-mono">{formData.projectCode}</span>
            {formData.location && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin size={11} />
                {formData.location}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Review sections */}
      <ReviewSection icon={<FileText size={14} />} title="Project Identity">
        <ReviewField label="Project Name" value={formData.projectName} highlight />
        <ReviewField label="Project Code" value={formData.projectCode} mono />
        <ReviewField label="DPR Reference" value={formData.dprNumber} mono />
        <ReviewField label="Client / Employer" value={formData.clientOrg} />
        <ReviewField label="Main Contractor" value={formData.contractorOrg} />
        <ReviewField label="PMC / Consultant" value={formData.pmcOrg || 'Not appointed'} />
        <ReviewField label="Location" value={formData.location} />
        <ReviewField label="District & State" value={[formData.district, formData.state].filter(Boolean).join(', ')} />
      </ReviewSection>

      <ReviewSection icon={<MapPin size={14} />} title={formData.projectType === 'Road' || formData.projectType === 'Railway' ? 'Chainage & Scope' : 'Area & Scope'}>
        {(formData.projectType === 'Road' || formData.projectType === 'Railway') ? (
          <>
            <ReviewField label="Chainage Start" value={formData.chainageStart} mono highlight />
            <ReviewField label="Chainage End" value={formData.chainageEnd} mono highlight />
            <ReviewField label="Total Length" value={formData.totalLengthKm ? `${formData.totalLengthKm} km` : ''} />
          </>
        ) : (
          <ReviewField label="Total Area" value={formData.totalAreaSqm ? `${formData.totalAreaSqm} m²` : ''} highlight />
        )}
        <ReviewField label="Milestones Defined" value={`${formData.milestones.length} milestones`} />
      </ReviewSection>

      <ReviewSection icon={<IndianRupee size={14} />} title="Budget & Schedule">
        <ReviewField label="Sanctioned Budget" value={formData.sanctionedBudget ? `₹${formData.sanctionedBudget}` : ''} highlight />
        <ReviewField label="Contingency" value={formData.contingencyBudget ? `₹${formData.contingencyBudget}` : 'Not specified'} />
        <ReviewField label="Contract Date" value={formData.contractDate} />
        <ReviewField label="Commencement Date" value={formData.startDate} />
        <ReviewField label="Target Completion" value={formData.targetCompletionDate} />
        <ReviewField label="Revised Completion" value={formData.revisedCompletionDate || 'No extension'} />
      </ReviewSection>

      <ReviewSection icon={<Users size={14} />} title="Team & Access">
        <ReviewField label="Project Manager" value={formData.projectManager} highlight />
        <ReviewField label="PM Email" value={formData.pmEmail} />
        <ReviewField label="Site Engineers" value={`${formData.siteEngineers.filter(se => se.name).length} assigned`} />
        <ReviewField label="Client Representative" value={formData.clientRepName || 'Not assigned'} />
        <ReviewField label="Client Access" value={formData.isClientReadOnly ? 'Read-only (Phase 1)' : 'Full access'} />
        <ReviewField label="Consultant" value={formData.consultantName || 'Not assigned'} />
        <ReviewField label="Consultant Access" value={formData.isConsultantReadOnly ? 'Read-only (Phase 1)' : 'Full access'} />
      </ReviewSection>

      {/* Milestone summary */}
      {formData.milestones.filter(m => m.name).length > 0 && (
        <div className="card-elevated p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Calendar size={14} />
            </div>
            <h3 className="text-sm font-600 text-foreground">Milestones Summary</h3>
          </div>
          <div className="space-y-2">
            {formData.milestones.filter(m => m.name).map((ms, idx) => (
              <div key={ms.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                <span className="w-5 h-5 rounded-full bg-muted text-muted-foreground text-xs font-700 flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <span className="flex-1 text-sm text-foreground">{ms.name}</span>
                {ms.targetDate && <span className="text-xs text-muted-foreground">{ms.targetDate}</span>}
                {ms.chainageRef && <span className="text-xs chainage-mono text-primary">{ms.chainageRef}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IP notice */}
      <div className="px-4 py-3 rounded-lg border border-border bg-muted/20 text-xs text-muted-foreground">
        <span className="font-500 text-foreground">KARTAA OS IP Policy: </span>
        All project data, scoring logic, and verification rules are stored in exportable PostgreSQL schemas. Source code and business logic remain independently maintainable per KARTAA OS IP policy.
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button type="button" onClick={onBack} disabled={isSubmitting} className="btn-secondary px-5 py-2.5">
          <ChevronLeft size={16} />
          Back to Team
        </button>
        <button
          type="button"
          onClick={handleCreate}
          disabled={isSubmitting}
          className="btn-primary px-8 py-2.5 text-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Saving to Database...
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              Create Project in KARTAA OS
            </>
          )}
        </button>
      </div>
    </div>
  );
}