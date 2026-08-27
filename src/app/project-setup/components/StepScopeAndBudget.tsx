'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AlertCircle, ChevronRight, ChevronLeft, Plus, Trash2, IndianRupee } from 'lucide-react';
import type { ProjectFormData } from './ProjectSetupWizard';

interface Props {
  formData: ProjectFormData;
  updateFormData: (updates: Partial<ProjectFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

function formatInr(val: string): string {
  const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
  if (isNaN(num)) return '';
  // Indian numbering: last 3 digits, then groups of 2
  const s = num.toString();
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  const formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return formatted + ',' + last3;
}

export default function StepScopeAndBudget({ formData, updateFormData, onNext, onBack }: Props) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProjectFormData>({
    defaultValues: formData,
  });

  const [milestones, setMilestones] = useState(formData.milestones);
  const projectType = formData.projectType;

  const addMilestone = () => {
    const newMs = { id: `ms-${Date.now()}`, name: '', targetDate: '', chainageRef: '' };
    setMilestones(prev => [...prev, newMs]);
  };

  const removeMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  const onSubmit = (data: ProjectFormData) => {
    updateFormData({ ...data, milestones });
    onNext();
  };

  const validateChainage = (val: string) => {
    return /^\d+\+\d{3}$/.test(val) || 'Format must be 0+000 (e.g. 42+500)';
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-5">
        {/* Chainage / Area Scope */}
        <div className="card-elevated p-5">
          <h2 className="text-base font-600 text-foreground mb-1">
            {projectType === 'Road' ? 'Chainage Scope' : 'Area Scope'}
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            {projectType === 'Road' ?'Define the chainage range for this project — all progress entries will reference these chainages' :'Define the total built-up area and grid dimensions for this industrial project'}
          </p>

          {projectType === 'Road' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="chainageStart" className="form-label">Chainage Start <span className="text-danger">*</span></label>
                <p className="form-helper">Format: 0+000</p>
                <input
                  id="chainageStart"
                  type="text"
                  placeholder="0+000"
                  {...register('chainageStart', {
                    required: 'Chainage start is required',
                    validate: validateChainage,
                  })}
                  className={`form-input mt-1 chainage-mono ${errors.chainageStart ? 'form-input-error' : ''}`}
                />
                {errors.chainageStart && <p className="form-error"><AlertCircle size={11} />{errors.chainageStart.message}</p>}
              </div>

              <div>
                <label htmlFor="chainageEnd" className="form-label">Chainage End <span className="text-danger">*</span></label>
                <p className="form-helper">Format: 42+500</p>
                <input
                  id="chainageEnd"
                  type="text"
                  placeholder="42+500"
                  {...register('chainageEnd', {
                    required: 'Chainage end is required',
                    validate: validateChainage,
                  })}
                  className={`form-input mt-1 chainage-mono ${errors.chainageEnd ? 'form-input-error' : ''}`}
                />
                {errors.chainageEnd && <p className="form-error"><AlertCircle size={11} />{errors.chainageEnd.message}</p>}
              </div>

              <div>
                <label htmlFor="totalLengthKm" className="form-label">Total Length (km) <span className="text-danger">*</span></label>
                <p className="form-helper">Net construction length in kilometres</p>
                <div className="relative mt-1">
                  <input
                    id="totalLengthKm"
                    type="number"
                    step="0.001"
                    placeholder="e.g. 25.500"
                    {...register('totalLengthKm', {
                      required: 'Total length is required',
                      min: { value: 0.1, message: 'Must be at least 0.1 km' },
                    })}
                    className={`form-input pr-10 ${errors.totalLengthKm ? 'form-input-error' : ''}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">km</span>
                </div>
                {errors.totalLengthKm && <p className="form-error"><AlertCircle size={11} />{errors.totalLengthKm.message}</p>}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="totalAreaSqm" className="form-label">Total Built-up Area (m²) <span className="text-danger">*</span></label>
                <p className="form-helper">Gross floor area across all structures</p>
                <div className="relative mt-1">
                  <input
                    id="totalAreaSqm"
                    type="number"
                    placeholder="e.g. 48500"
                    {...register('totalAreaSqm', { required: 'Total area is required', min: { value: 100, message: 'Must be at least 100 m²' } })}
                    className={`form-input pr-10 ${errors.totalAreaSqm ? 'form-input-error' : ''}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">m²</span>
                </div>
                {errors.totalAreaSqm && <p className="form-error"><AlertCircle size={11} />{errors.totalAreaSqm.message}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Budget */}
        <div className="card-elevated p-5">
          <h2 className="text-base font-600 text-foreground mb-1">Sanctioned Budget</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Enter amounts in ₹ INR — Indian numbering format (e.g. ₹1,16,00,000 = 1.16 Crore)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sanctionedBudget" className="form-label">Sanctioned Project Cost (₹) <span className="text-danger">*</span></label>
              <p className="form-helper">Total DPR-approved budget including all components</p>
              <div className="relative mt-1">
                <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="sanctionedBudget"
                  type="text"
                  placeholder="e.g. 6,21,40,000"
                  {...register('sanctionedBudget', {
                    required: 'Sanctioned budget is required',
                    pattern: { value: /^[\d,]+$/, message: 'Enter numbers only (with Indian comma formatting)' },
                  })}
                  className={`form-input pl-8 inr-value ${errors.sanctionedBudget ? 'form-input-error' : ''}`}
                />
              </div>
              {errors.sanctionedBudget && <p className="form-error"><AlertCircle size={11} />{errors.sanctionedBudget.message}</p>}
            </div>

            <div>
              <label htmlFor="contingencyBudget" className="form-label">Contingency Provision (₹)</label>
              <p className="form-helper">Approved contingency — typically 3–5% of project cost</p>
              <div className="relative mt-1">
                <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="contingencyBudget"
                  type="text"
                  placeholder="e.g. 18,64,200"
                  {...register('contingencyBudget', {
                    pattern: { value: /^[\d,]*$/, message: 'Enter numbers only' },
                  })}
                  className={`form-input pl-8 inr-value ${errors.contingencyBudget ? 'form-input-error' : ''}`}
                />
              </div>
              {errors.contingencyBudget && <p className="form-error"><AlertCircle size={11} />{errors.contingencyBudget.message}</p>}
            </div>
          </div>

          <div className="mt-4 px-4 py-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground">
            <span className="font-500 text-foreground">Note: </span>
            BOQ items will be linked to this sanctioned budget. KARTAA OS will alert when cumulative BOQ utilization exceeds 85% of sanctioned cost.
          </div>
        </div>

        {/* Schedule */}
        <div className="card-elevated p-5">
          <h2 className="text-base font-600 text-foreground mb-1">Project Schedule</h2>
          <p className="text-xs text-muted-foreground mb-4">Key contract dates — used for SPI calculation and schedule adherence tracking</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contractDate" className="form-label">Contract Award Date <span className="text-danger">*</span></label>
              <input
                id="contractDate"
                type="date"
                {...register('contractDate', { required: 'Contract date is required' })}
                className={`form-input mt-1 ${errors.contractDate ? 'form-input-error' : ''}`}
              />
              {errors.contractDate && <p className="form-error"><AlertCircle size={11} />{errors.contractDate.message}</p>}
            </div>

            <div>
              <label htmlFor="startDate" className="form-label">Commencement Date <span className="text-danger">*</span></label>
              <p className="form-helper">Date of site handover / Notice to Proceed</p>
              <input
                id="startDate"
                type="date"
                {...register('startDate', { required: 'Start date is required' })}
                className={`form-input mt-1 ${errors.startDate ? 'form-input-error' : ''}`}
              />
              {errors.startDate && <p className="form-error"><AlertCircle size={11} />{errors.startDate.message}</p>}
            </div>

            <div>
              <label htmlFor="targetCompletionDate" className="form-label">Original Completion Date <span className="text-danger">*</span></label>
              <input
                id="targetCompletionDate"
                type="date"
                {...register('targetCompletionDate', { required: 'Target completion date is required' })}
                className={`form-input mt-1 ${errors.targetCompletionDate ? 'form-input-error' : ''}`}
              />
              {errors.targetCompletionDate && <p className="form-error"><AlertCircle size={11} />{errors.targetCompletionDate.message}</p>}
            </div>

            <div>
              <label htmlFor="revisedCompletionDate" className="form-label">Revised Completion Date</label>
              <p className="form-helper">Leave blank if no extension granted</p>
              <input
                id="revisedCompletionDate"
                type="date"
                {...register('revisedCompletionDate')}
                className="form-input mt-1"
              />
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="card-elevated p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-600 text-foreground">Key Milestones</h2>
            <button
              type="button"
              onClick={addMilestone}
              className="btn-secondary py-1.5 px-3 text-xs"
            >
              <Plus size={13} />
              Add Milestone
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Define the major construction milestones — these will appear on the schedule tracking view
          </p>

          <div className="space-y-3">
            {milestones.map((ms, idx) => (
              <div key={ms.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                <div className="md:col-span-1 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-700 flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                </div>
                <div className="md:col-span-4">
                  <label className="form-label">Milestone Name</label>
                  <input
                    type="text"
                    value={ms.name}
                    onChange={(e) => setMilestones(prev => prev.map(m => m.id === ms.id ? { ...m, name: e.target.value } : m))}
                    placeholder="e.g. Sub-base completion"
                    className="form-input text-sm"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="form-label">Target Date</label>
                  <input
                    type="date"
                    value={ms.targetDate}
                    onChange={(e) => setMilestones(prev => prev.map(m => m.id === ms.id ? { ...m, targetDate: e.target.value } : m))}
                    className="form-input text-sm"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="form-label">
                    {projectType === 'Road' ? 'Chainage Reference' : 'Grid Reference'}
                  </label>
                  <input
                    type="text"
                    value={ms.chainageRef}
                    onChange={(e) => setMilestones(prev => prev.map(m => m.id === ms.id ? { ...m, chainageRef: e.target.value } : m))}
                    placeholder={projectType === 'Road' ? '0+000' : 'Grid A-1'}
                    className={`form-input text-sm ${projectType === 'Road' ? 'chainage-mono' : ''}`}
                  />
                </div>
                <div className="md:col-span-1 flex items-end justify-end pb-0.5">
                  <button
                    type="button"
                    onClick={() => removeMilestone(ms.id)}
                    disabled={milestones.length <= 1}
                    className="p-1.5 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Remove milestone"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button type="button" onClick={onBack} className="btn-secondary px-5 py-2.5">
            <ChevronLeft size={16} />
            Back
          </button>
          <button type="submit" className="btn-primary px-6 py-2.5">
            Save & Continue
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </form>
  );
}