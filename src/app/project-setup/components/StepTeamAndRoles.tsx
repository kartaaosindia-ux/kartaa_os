'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AlertCircle, ChevronRight, ChevronLeft, Plus, Trash2, UserCheck, Eye, Lock } from 'lucide-react';
import Toggle from '@/components/ui/Toggle';
import type { ProjectFormData } from './ProjectSetupWizard';

interface Props {
  formData: ProjectFormData;
  updateFormData: (updates: Partial<ProjectFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepTeamAndRoles({ formData, updateFormData, onNext, onBack }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<ProjectFormData>({
    defaultValues: formData,
  });

  const [siteEngineers, setSiteEngineers] = useState(formData.siteEngineers);
  const [isClientReadOnly, setIsClientReadOnly] = useState(formData.isClientReadOnly);
  const [isConsultantReadOnly, setIsConsultantReadOnly] = useState(formData.isConsultantReadOnly);

  const addEngineer = () => {
    setSiteEngineers(prev => [...prev, { id: `se-${Date.now()}`, name: '', email: '', chainageFrom: '', chainageTo: '' }]);
  };

  const removeEngineer = (id: string) => {
    setSiteEngineers(prev => prev.filter(e => e.id !== id));
  };

  const onSubmit = (data: ProjectFormData) => {
    updateFormData({ ...data, siteEngineers, isClientReadOnly, isConsultantReadOnly });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-5">
        {/* Project Manager */}
        <div className="card-elevated p-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <UserCheck size={14} className="text-primary" />
            </div>
            <h2 className="text-base font-600 text-foreground">Project Manager</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Full access — can manage all project data, BOQ, progress entries, and team assignments
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="projectManager" className="form-label">Full Name <span className="text-danger">*</span></label>
              <input
                id="projectManager"
                type="text"
                placeholder="e.g. Rajesh Kumar"
                {...register('projectManager', { required: 'Project manager name is required' })}
                className={`form-input mt-1 ${errors.projectManager ? 'form-input-error' : ''}`}
              />
              {errors.projectManager && <p className="form-error"><AlertCircle size={11} />{errors.projectManager.message}</p>}
            </div>

            <div>
              <label htmlFor="pmEmail" className="form-label">Work Email <span className="text-danger">*</span></label>
              <p className="form-helper">KARTAA OS account invite will be sent to this email</p>
              <input
                id="pmEmail"
                type="email"
                placeholder="rajesh.kumar@organisation.in"
                {...register('pmEmail', {
                  required: 'PM email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                })}
                className={`form-input mt-1 ${errors.pmEmail ? 'form-input-error' : ''}`}
              />
              {errors.pmEmail && <p className="form-error"><AlertCircle size={11} />{errors.pmEmail.message}</p>}
            </div>
          </div>
        </div>

        {/* Site Engineers */}
        <div className="card-elevated p-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-base font-600 text-foreground">Site Engineers</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Can submit progress entries, upload photos, and log field activity within their assigned chainage
              </p>
            </div>
            <button
              type="button"
              onClick={addEngineer}
              className="btn-secondary py-1.5 px-3 text-xs flex-shrink-0"
            >
              <Plus size={13} />
              Add Engineer
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {siteEngineers.map((se, idx) => (
              <div key={se.id} className="p-4 rounded-xl border border-border/60 bg-muted/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-600 text-muted-foreground uppercase tracking-wider">
                    Site Engineer {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEngineer(se.id)}
                    disabled={siteEngineers.length <= 1}
                    className="p-1.5 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors disabled:opacity-30"
                    title="Remove site engineer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      value={se.name}
                      onChange={(e) => setSiteEngineers(prev => prev.map(s => s.id === se.id ? { ...s, name: e.target.value } : s))}
                      placeholder="e.g. Suresh Pillai"
                      className="form-input text-sm"
                    />
                  </div>
                  <div>
                    <label className="form-label">Work Email</label>
                    <input
                      type="email"
                      value={se.email}
                      onChange={(e) => setSiteEngineers(prev => prev.map(s => s.id === se.id ? { ...s, email: e.target.value } : s))}
                      placeholder="suresh.pillai@organisation.in"
                      className="form-input text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Assigned Chainage From</label>
                    <p className="form-helper">Leave blank for full project access</p>
                    <input
                      type="text"
                      value={se.chainageFrom}
                      onChange={(e) => setSiteEngineers(prev => prev.map(s => s.id === se.id ? { ...s, chainageFrom: e.target.value } : s))}
                      placeholder="0+000"
                      className="form-input text-sm chainage-mono mt-1"
                    />
                  </div>
                  <div>
                    <label className="form-label">Assigned Chainage To</label>
                    <p className="form-helper">Field activity outside this range will be flagged</p>
                    <input
                      type="text"
                      value={se.chainageTo}
                      onChange={(e) => setSiteEngineers(prev => prev.map(s => s.id === se.id ? { ...s, chainageTo: e.target.value } : s))}
                      placeholder="25+500"
                      className="form-input text-sm chainage-mono mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client / Consultant access */}
        <div className="card-elevated p-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-info/10 border border-info/20 flex items-center justify-center">
              <Eye size={14} className="text-info" />
            </div>
            <h2 className="text-base font-600 text-foreground">Client & Consultant Access</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Client and consultant accounts are read-only in the Phase 1 prototype — they can view dashboards and reports but cannot edit project data
          </p>

          <div className="space-y-5">
            {/* Client rep */}
            <div className="p-4 rounded-xl border border-border/60 bg-muted/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-600 text-foreground">Client Representative</span>
                <div className="flex items-center gap-2">
                  <Lock size={12} className="text-muted-foreground" />
                  <Toggle
                    checked={isClientReadOnly}
                    onChange={setIsClientReadOnly}
                    label="Read-only access"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="clientRepName" className="form-label">Full Name</label>
                  <input
                    id="clientRepName"
                    type="text"
                    placeholder="e.g. Priya Mehta"
                    {...register('clientRepName')}
                    className="form-input text-sm mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="clientRepEmail" className="form-label">Work Email</label>
                  <input
                    id="clientRepEmail"
                    type="email"
                    placeholder="priya.mehta@nhai.gov.in"
                    {...register('clientRepEmail', {
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                    })}
                    className={`form-input text-sm mt-1 ${errors.clientRepEmail ? 'form-input-error' : ''}`}
                  />
                  {errors.clientRepEmail && <p className="form-error"><AlertCircle size={11} />{errors.clientRepEmail.message}</p>}
                </div>
              </div>
              {isClientReadOnly && (
                <div className="mt-3 flex items-center gap-2 text-xs text-info px-3 py-2 rounded-lg bg-info/8 border border-info/20">
                  <Eye size={12} />
                  This user will see: Project dashboard, progress charts, BOQ summary, verification status — but cannot submit or edit any data
                </div>
              )}
            </div>

            {/* Consultant */}
            <div className="p-4 rounded-xl border border-border/60 bg-muted/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-600 text-foreground">Supervision Consultant</span>
                <div className="flex items-center gap-2">
                  <Lock size={12} className="text-muted-foreground" />
                  <Toggle
                    checked={isConsultantReadOnly}
                    onChange={setIsConsultantReadOnly}
                    label="Read-only access"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="consultantName" className="form-label">Full Name</label>
                  <input
                    id="consultantName"
                    type="text"
                    placeholder="e.g. Arjun Reddy"
                    {...register('consultantName')}
                    className="form-input text-sm mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="consultantEmail" className="form-label">Work Email</label>
                  <input
                    id="consultantEmail"
                    type="email"
                    placeholder="arjun.reddy@stup.co.in"
                    {...register('consultantEmail', {
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                    })}
                    className={`form-input text-sm mt-1 ${errors.consultantEmail ? 'form-input-error' : ''}`}
                  />
                  {errors.consultantEmail && <p className="form-error"><AlertCircle size={11} />{errors.consultantEmail.message}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 px-4 py-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground">
            <span className="font-500 text-foreground">Phase 1 Note: </span>
            Full external portal with granular permission controls is planned for Phase 2. Current implementation supports read-only dashboard access only.
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button type="button" onClick={onBack} className="btn-secondary px-5 py-2.5">
            <ChevronLeft size={16} />
            Back
          </button>
          <button type="submit" className="btn-primary px-6 py-2.5">
            Review Project
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </form>
  );
}