'use client';
import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import StepBasicInfo from './StepBasicInfo';
import StepScopeAndBudget from './StepScopeAndBudget';
import StepTeamAndRoles from './StepTeamAndRoles';
import StepReview from './StepReview';

export type ProjectType = 'Road' | 'Industrial' | 'Railway' | 'Building';
export type ProjectFormData = {
  // Step 1 — Basic Info
  projectName: string;
  projectCode: string;
  projectType: ProjectType;
  dprNumber: string;
  clientOrg: string;
  contractorOrg: string;
  pmcOrg: string;
  location: string;
  district: string;
  state: string;
  description: string;

  // Railway-specific fields
  railwayZone: string;
  division: string;
  gauge: string;
  trackType: string;
  numberOfStations: string;
  numberOfBridges: string;
  numberOfRobRub: string;
  numberOfCulverts: string;
  numberOfLevelCrossings: string;

  // Step 2 — Scope & Budget
  chainageStart: string;
  chainageEnd: string;
  totalLengthKm: string;
  totalAreaSqm: string;
  sanctionedBudget: string;
  contingencyBudget: string;
  startDate: string;
  targetCompletionDate: string;
  revisedCompletionDate: string;
  contractDate: string;
  milestones: { id: string; name: string; targetDate: string; chainageRef: string }[];

  // Step 3 — Team & Roles
  projectManager: string;
  pmEmail: string;
  siteEngineers: { id: string; name: string; email: string; chainageFrom: string; chainageTo: string }[];
  clientRepName: string;
  clientRepEmail: string;
  consultantName: string;
  consultantEmail: string;
  isClientReadOnly: boolean;
  isConsultantReadOnly: boolean;
};

const steps = [
  { id: 'step-basic', label: 'Basic Info', description: 'Project identity & type' },
  { id: 'step-scope', label: 'Scope & Budget', description: 'Chainage, cost & schedule' },
  { id: 'step-team', label: 'Team & Roles', description: 'Assign engineers & clients' },
  { id: 'step-review', label: 'Review', description: 'Confirm and create project' },
];

const defaultFormData: ProjectFormData = {
  projectName: '',
  projectCode: '',
  projectType: 'Road',
  dprNumber: '',
  clientOrg: '',
  contractorOrg: '',
  pmcOrg: '',
  location: '',
  district: '',
  state: 'Haryana',
  description: '',
  // Railway defaults
  railwayZone: '',
  division: '',
  gauge: 'Broad Gauge (1676mm)',
  trackType: 'Double Line',
  numberOfStations: '',
  numberOfBridges: '',
  numberOfRobRub: '',
  numberOfCulverts: '',
  numberOfLevelCrossings: '',
  // Scope
  chainageStart: '0+000',
  chainageEnd: '',
  totalLengthKm: '',
  totalAreaSqm: '',
  sanctionedBudget: '',
  contingencyBudget: '',
  startDate: '',
  targetCompletionDate: '',
  revisedCompletionDate: '',
  contractDate: '',
  milestones: [
    { id: 'ms-001', name: 'Site Clearance & Mobilisation', targetDate: '', chainageRef: '' },
    { id: 'ms-002', name: 'Earthwork Completion', targetDate: '', chainageRef: '' },
    { id: 'ms-003', name: 'Sub-base & Base Course', targetDate: '', chainageRef: '' },
  ],
  projectManager: '',
  pmEmail: '',
  siteEngineers: [
    { id: 'se-001', name: '', email: '', chainageFrom: '', chainageTo: '' }
  ],
  clientRepName: '',
  clientRepEmail: '',
  consultantName: '',
  consultantEmail: '',
  isClientReadOnly: true,
  isConsultantReadOnly: true,
};

export default function ProjectSetupWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProjectFormData>(defaultFormData);

  const updateFormData = (updates: Partial<ProjectFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const goNext = () => setCurrentStep(s => Math.min(s + 1, steps.length - 1));
  const goPrev = () => setCurrentStep(s => Math.max(s - 1, 0));

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step indicator */}
      <div className="card-elevated p-5 mb-6">
        <div className="flex items-center">
          {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => idx < currentStep && setCurrentStep(idx)}
                className={`flex items-center gap-3 flex-shrink-0 ${idx < currentStep ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  idx < currentStep ? 'bg-accent text-accent-foreground' :
                  idx === currentStep ? 'bg-primary text-primary-foreground': 'bg-muted text-muted-foreground border border-border'
                }`}>
                  {idx < currentStep ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <span className="text-xs font-700">{idx + 1}</span>
                  )}
                </div>
                <div className="hidden sm:block">
                  <div className={`text-sm font-600 ${idx === currentStep ? 'text-foreground' : idx < currentStep ? 'text-accent' : 'text-muted-foreground'}`}>
                    {step.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
              </button>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-px mx-3 transition-colors duration-300 ${idx < currentStep ? 'bg-accent/50' : 'bg-border'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-muted-foreground text-right">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>

      {/* Step content */}
      <div className="fade-in">
        {currentStep === 0 && (
          <StepBasicInfo formData={formData} updateFormData={updateFormData} onNext={goNext} />
        )}
        {currentStep === 1 && (
          <StepScopeAndBudget formData={formData} updateFormData={updateFormData} onNext={goNext} onBack={goPrev} />
        )}
        {currentStep === 2 && (
          <StepTeamAndRoles formData={formData} updateFormData={updateFormData} onNext={goNext} onBack={goPrev} />
        )}
        {currentStep === 3 && (
          <StepReview formData={formData} onBack={goPrev} />
        )}
      </div>
    </div>
  );
}