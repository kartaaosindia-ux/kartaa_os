import React from 'react';

type BadgeVariant = 'active' | 'delayed' | 'on-hold' | 'draft' | 'completed' | 'verified' | 'pending' | 'rejected';

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  dot?: boolean;
}

const variantMap: Record<BadgeVariant, string> = {
  active: 'status-active',
  delayed: 'status-delayed',
  'on-hold': 'status-on-hold',
  draft: 'status-draft',
  completed: 'status-completed',
  verified: 'status-verified',
  pending: 'status-on-hold',
  rejected: 'status-delayed',
};

export default function Badge({ variant, label, dot = true }: BadgeProps) {
  return (
    <span className={`status-badge ${variantMap[variant]}`}>
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 flex-shrink-0" />
      )}
      {label}
    </span>
  );
}