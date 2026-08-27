import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  heading: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, heading, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4 text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-base font-600 text-foreground mb-2">{heading}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-5">{description}</p>
      {action}
    </div>
  );
}