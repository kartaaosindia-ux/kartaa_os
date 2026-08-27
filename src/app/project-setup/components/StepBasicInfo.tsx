'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { AlertCircle, ChevronRight, Road, Building2, Train, Home } from 'lucide-react';
import type { ProjectFormData, ProjectType } from './ProjectSetupWizard';

interface Props {
  formData: ProjectFormData;
  updateFormData: (updates: Partial<ProjectFormData>) => void;
  onNext: () => void;
}

const stateOptions = [
  'Haryana', 'Delhi', 'Uttar Pradesh', 'Rajasthan', 'Punjab',
  'Himachal Pradesh', 'Uttarakhand', 'Bihar', 'Madhya Pradesh', 'Maharashtra',
  'Gujarat', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Andhra Pradesh',
  'West Bengal', 'Odisha', 'Chhattisgarh', 'Jharkhand', 'Assam',
];

const railwayZones = [
  'Central Railway', 'Eastern Railway', 'East Central Railway',
  'East Coast Railway', 'Northern Railway', 'North Central Railway',
  'North Eastern Railway', 'Northeast Frontier Railway', 'North Western Railway',
  'Southern Railway', 'South Central Railway', 'South Eastern Railway',
  'South East Central Railway', 'South Western Railway', 'Western Railway',
  'West Central Railway', 'Metro Railway Kolkata',
];

const gaugeOptions = [
  'Broad Gauge (1676mm)',
  'Metre Gauge (1000mm)',
  'Narrow Gauge (762mm)',
  'Standard Gauge (1435mm)',
];

const trackTypeOptions = [
  'Single Line', 'Double Line', 'Triple Line', 'Quadruple Line',
];

const projectTypeConfig: { type: ProjectType; label: string; subtitle: string; icon: React.ReactNode; color: string; activeBorder: string; activeBg: string; activeText: string; activeIconBg: string }[] = [
  { type: 'Road', label: 'Road / Highway EPC', subtitle: 'Chainage-based tracking, DPR, lane configuration', icon: <Road size={18} />, color: 'text-primary', activeBorder: 'border-primary', activeBg: 'bg-primary/8', activeText: 'text-primary', activeIconBg: 'bg-primary/15 text-primary' },
  { type: 'Railway', label: 'Railway / Rail Infrastructure', subtitle: 'Chainage, track, OHE, signalling, asset register', icon: <Train size={18} />, color: 'text-info', activeBorder: 'border-info', activeBg: 'bg-info/8', activeText: 'text-info', activeIconBg: 'bg-info/15 text-info' },
  { type: 'Industrial', label: 'Industrial EPC', subtitle: 'Grid-based tracking, floor plans, structural steel', icon: <Building2 size={18} />, color: 'text-accent', activeBorder: 'border-accent', activeBg: 'bg-accent/8', activeText: 'text-accent', activeIconBg: 'bg-accent/15 text-accent' },
  { type: 'Building', label: 'Building Construction', subtitle: 'Floor-wise tracking, RCC, finishes, MEP', icon: <Home size={18} />, color: 'text-warning', activeBorder: 'border-warning', activeBg: 'bg-warning/8', activeText: 'text-warning', activeIconBg: 'bg-warning/15 text-warning' },
];

export default function StepBasicInfo({ formData, updateFormData, onNext }: Props) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProjectFormData>({
    defaultValues: formData,
  });

  const projectType = watch('projectType');
  const isRailway = projectType === 'Railway';

  const onSubmit = (data: ProjectFormData) => {
    updateFormData(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-5">
        {/* Project Type */}
        <div className="card-elevated p-5">
          <h2 className="text-base font-600 text-foreground mb-1">Project Type</h2>
          <p className="text-xs text-muted-foreground mb-4">Select the infrastructure category — this determines tracking fields throughout KARTAA OS</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projectTypeConfig.map((cfg) => {
              const isActive = projectType === cfg.type;
              return (
                <button
                  key={`type-${cfg.type}`}
                  type="button"
                  onClick={() => setValue('projectType', cfg.type)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-150 ${
                    isActive ? `${cfg.activeBorder} ${cfg.activeBg}` : 'border-border hover:border-border/80 hover:bg-muted/20'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isActive ? cfg.activeIconBg : 'bg-muted text-muted-foreground'
                  }`}>
                    {cfg.icon}
                  </div>
                  <div>
                    <div className={`text-sm font-600 ${isActive ? cfg.activeText : 'text-foreground'}`}>
                      {cfg.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{cfg.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <input type="hidden" {...register('projectType')} />
        </div>

        {/* Project Identity */}
        <div className="card-elevated p-5">
          <h2 className="text-base font-600 text-foreground mb-1">Project Identity</h2>
          <p className="text-xs text-muted-foreground mb-4">Core identification details — used across all reports and verification records</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="projectName" className="form-label">Project Name <span className="text-danger">*</span></label>
              <p className="form-helper">Use the official project name as per DPR / contract document</p>
              <input
                id="projectName"
                type="text"
                placeholder={isRailway ? 'e.g. Nagpur–Betul New Rail Line Package 2' : 'e.g. NH-48 Bypass Package 3 — Gurgaon'}
                {...register('projectName', { required: 'Project name is required', minLength: { value: 5, message: 'Name must be at least 5 characters' } })}
                className={`form-input mt-1 ${errors.projectName ? 'form-input-error' : ''}`}
              />
              {errors.projectName && <p className="form-error"><AlertCircle size={11} />{errors.projectName.message}</p>}
            </div>

            <div>
              <label htmlFor="projectCode" className="form-label">Project Code <span className="text-danger">*</span></label>
              <p className="form-helper">{isRailway ? 'e.g. CR-NGP-2026-002' : 'e.g. NHAI-DL-2026-048'}</p>
              <input
                id="projectCode"
                type="text"
                placeholder={isRailway ? 'CR-NGP-2026-XXX' : 'NHAI-DL-2026-XXX'}
                {...register('projectCode', { required: 'Project code is required', pattern: { value: /^[A-Z0-9\-]+$/i, message: 'Use letters, numbers and hyphens only' } })}
                className={`form-input mt-1 ${errors.projectCode ? 'form-input-error' : ''}`}
              />
              {errors.projectCode && <p className="form-error"><AlertCircle size={11} />{errors.projectCode.message}</p>}
            </div>

            <div>
              <label htmlFor="dprNumber" className="form-label">DPR Reference Number <span className="text-danger">*</span></label>
              <p className="form-helper">Detailed Project Report document reference</p>
              <input
                id="dprNumber"
                type="text"
                placeholder="e.g. DPR/CR/2024/NGP/002"
                {...register('dprNumber', { required: 'DPR reference number is required' })}
                className={`form-input mt-1 ${errors.dprNumber ? 'form-input-error' : ''}`}
              />
              {errors.dprNumber && <p className="form-error"><AlertCircle size={11} />{errors.dprNumber.message}</p>}
            </div>
          </div>
        </div>

        {/* Railway-specific fields */}
        {isRailway && (
          <div className="card-elevated p-5 border-info/30">
            <div className="flex items-center gap-2 mb-1">
              <Train size={16} className="text-info" />
              <h2 className="text-base font-600 text-foreground">Railway Details</h2>
              <span className="text-2xs px-2 py-0.5 rounded-full bg-info/10 text-info border border-info/20 font-500">Railway Specific</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Railway zone, division, gauge and infrastructure counts</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="railwayZone" className="form-label">Railway Zone <span className="text-danger">*</span></label>
                <select
                  id="railwayZone"
                  {...register('railwayZone', { required: isRailway ? 'Railway zone is required' : false })}
                  className={`form-input mt-1 ${errors.railwayZone ? 'form-input-error' : ''}`}
                >
                  <option value="">Select Zone</option>
                  {railwayZones.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
                {errors.railwayZone && <p className="form-error"><AlertCircle size={11} />{errors.railwayZone.message}</p>}
              </div>

              <div>
                <label htmlFor="division" className="form-label">Division <span className="text-danger">*</span></label>
                <input
                  id="division"
                  type="text"
                  placeholder="e.g. Nagpur Division"
                  {...register('division', { required: isRailway ? 'Division is required' : false })}
                  className={`form-input mt-1 ${errors.division ? 'form-input-error' : ''}`}
                />
                {errors.division && <p className="form-error"><AlertCircle size={11} />{errors.division.message}</p>}
              </div>

              <div>
                <label htmlFor="gauge" className="form-label">Gauge</label>
                <select id="gauge" {...register('gauge')} className="form-input mt-1">
                  {gaugeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="trackType" className="form-label">Track Type</label>
                <select id="trackType" {...register('trackType')} className="form-input mt-1">
                  {trackTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs font-600 text-muted-foreground mb-3 uppercase tracking-wider">Infrastructure Counts</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {[
                    { id: 'numberOfStations', label: 'Stations', field: 'numberOfStations' as const },
                    { id: 'numberOfBridges', label: 'Bridges', field: 'numberOfBridges' as const },
                    { id: 'numberOfRobRub', label: 'ROB/RUB', field: 'numberOfRobRub' as const },
                    { id: 'numberOfCulverts', label: 'Culverts', field: 'numberOfCulverts' as const },
                    { id: 'numberOfLevelCrossings', label: 'Level Crossings', field: 'numberOfLevelCrossings' as const },
                  ].map(f => (
                    <div key={f.id}>
                      <label htmlFor={f.id} className="form-label text-2xs">{f.label}</label>
                      <input
                        id={f.id}
                        type="number"
                        min="0"
                        placeholder="0"
                        {...register(f.field)}
                        className="form-input mt-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Organisations */}
        <div className="card-elevated p-5">
          <h2 className="text-base font-600 text-foreground mb-1">Organisations</h2>
          <p className="text-xs text-muted-foreground mb-4">Client authority, contractor, and project management consultant</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="clientOrg" className="form-label">Client / Employer Authority <span className="text-danger">*</span></label>
              <input
                id="clientOrg"
                type="text"
                placeholder={isRailway ? 'e.g. Indian Railways / RVNL' : 'e.g. NHAI, HPWD, HSIIDC'}
                {...register('clientOrg', { required: 'Client organisation is required' })}
                className={`form-input mt-1 ${errors.clientOrg ? 'form-input-error' : ''}`}
              />
              {errors.clientOrg && <p className="form-error"><AlertCircle size={11} />{errors.clientOrg.message}</p>}
            </div>

            <div>
              <label htmlFor="contractorOrg" className="form-label">Main Contractor <span className="text-danger">*</span></label>
              <input
                id="contractorOrg"
                type="text"
                placeholder="e.g. L&T Infrastructure Ltd."
                {...register('contractorOrg', { required: 'Contractor organisation is required' })}
                className={`form-input mt-1 ${errors.contractorOrg ? 'form-input-error' : ''}`}
              />
              {errors.contractorOrg && <p className="form-error"><AlertCircle size={11} />{errors.contractorOrg.message}</p>}
            </div>

            <div>
              <label htmlFor="pmcOrg" className="form-label">PMC / Supervision Consultant</label>
              <p className="form-helper">Leave blank if no PMC appointed</p>
              <input
                id="pmcOrg"
                type="text"
                placeholder="e.g. RITES Ltd., IRCON"
                {...register('pmcOrg')}
                className="form-input mt-1"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card-elevated p-5">
          <h2 className="text-base font-600 text-foreground mb-1">Location</h2>
          <p className="text-xs text-muted-foreground mb-4">Project geographic location — used for site map and regional reporting</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label htmlFor="location" className="form-label">Project Location / Corridor Description <span className="text-danger">*</span></label>
              <input
                id="location"
                type="text"
                placeholder={isRailway ? 'e.g. Nagpur–Betul New Rail Line, Central India' : 'e.g. Gurgaon–Manesar Corridor, NH-48'}
                {...register('location', { required: 'Location is required' })}
                className={`form-input mt-1 ${errors.location ? 'form-input-error' : ''}`}
              />
              {errors.location && <p className="form-error"><AlertCircle size={11} />{errors.location.message}</p>}
            </div>

            <div>
              <label htmlFor="district" className="form-label">District <span className="text-danger">*</span></label>
              <input
                id="district"
                type="text"
                placeholder="e.g. Nagpur"
                {...register('district', { required: 'District is required' })}
                className={`form-input mt-1 ${errors.district ? 'form-input-error' : ''}`}
              />
              {errors.district && <p className="form-error"><AlertCircle size={11} />{errors.district.message}</p>}
            </div>

            <div>
              <label htmlFor="state" className="form-label">State <span className="text-danger">*</span></label>
              <select
                id="state"
                {...register('state', { required: 'State is required' })}
                className={`form-input mt-1 ${errors.state ? 'form-input-error' : ''}`}
              >
                {stateOptions.map((s) => (
                  <option key={`state-${s}`} value={s}>{s}</option>
                ))}
              </select>
              {errors.state && <p className="form-error"><AlertCircle size={11} />{errors.state.message}</p>}
            </div>

            <div className="md:col-span-3">
              <label htmlFor="description" className="form-label">Project Description</label>
              <p className="form-helper">Brief scope summary for reports and dashboards</p>
              <textarea
                id="description"
                rows={3}
                placeholder={isRailway
                  ? 'e.g. New double-line broad gauge railway from Ch. 120+000 to 206+000, including 8 stations, 24 bridges and OHE...'
                  : 'e.g. 4-lane divided carriageway bypass from Ch. 42+000 to 67+500, including 3 major bridges...'}
                {...register('description')}
                className="form-input resize-none"
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-end">
          <button type="submit" className="btn-primary px-6 py-2.5">
            Save & Continue
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </form>
  );
}