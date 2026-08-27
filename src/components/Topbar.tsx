'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, HelpCircle, ChevronDown, Building2, Route, Factory, Check } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { useDemo } from '@/contexts/DemoContext';

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  Road: <Route size={11} />,
  Industrial: <Factory size={11} />,
  Building: <Building2 size={11} />,
  Railway: <Route size={11} />,
};

const TYPE_DOT: Record<string, string> = {
  Road: 'bg-amber-400',
  Industrial: 'bg-primary',
  Building: 'bg-accent',
  Railway: 'bg-info',
};

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  const { selectedProject, setSelectedProject, sectorProjects } = useProject();
  const { isDemoUser, demoSector } = useDemo();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Group projects by type from the sector-filtered list
  const projectsByType = sectorProjects.reduce<Record<string, typeof sectorProjects>>((acc, proj) => {
    const key = proj.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(proj);
    return acc;
  }, {});

  const typeGroups = Object.entries(projectsByType);

  return (
    <header className="h-14 md:h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-3 md:px-6 gap-2 md:gap-4 flex-shrink-0 sticky top-0 z-10">
      <div className="flex-1 min-w-0">
        <h1 className="text-base md:text-lg font-600 text-foreground leading-tight truncate">{title}</h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate hidden sm:block">{subtitle}</p>
        )}
      </div>

      {/* Global Project Selector */}
      <div className="relative flex-shrink-0" ref={dropdownRef} id="tour-project-selector">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg border border-border bg-muted/40 hover:bg-muted transition-colors text-sm max-w-[140px] md:max-w-[220px]"
        >
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${TYPE_DOT[selectedProject.type] ?? 'bg-primary'}`} />
          <span className="truncate font-500 text-foreground text-xs hidden sm:block">{selectedProject.name}</span>
          <ChevronDown size={13} className={`flex-shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1.5 w-72 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
            {isDemoUser && demoSector && (
              <div className="px-3 pt-2.5 pb-1.5 border-b border-border">
                <span className="text-2xs font-600 uppercase tracking-wider text-accent">
                  {demoSector.replace('_', ' & ')} sector
                </span>
              </div>
            )}
            {typeGroups.map(([type, projects], groupIdx) => (
              <div key={type}>
                {groupIdx > 0 && <div className="border-t border-border mx-3" />}
                <div className="px-3 pt-3 pb-2">
                  <div className="flex items-center gap-1.5 text-2xs font-600 uppercase tracking-wider text-muted-foreground mb-1.5">
                    {TYPE_ICON[type] ?? <Building2 size={11} />}
                    {type} Projects
                  </div>
                  {projects.map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => { setSelectedProject(proj); setOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-muted transition-colors text-left group"
                    >
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${TYPE_DOT[proj.type] ?? 'bg-primary'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-500 text-foreground truncate">{proj.name}</div>
                        <div className="text-2xs text-muted-foreground truncate">{proj.code} · {proj.subtitle}</div>
                      </div>
                      {selectedProject.id === proj.id && (
                        <Check size={13} className="text-primary flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
        <div className="relative hidden md:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects, BOQ..."
            className="form-input pl-9 py-2 w-56 text-sm"
          />
        </div>
        <button className="p-1.5 md:p-2 rounded-lg hover:bg-muted transition-colors relative">
          <Bell size={16} className="text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-danger" />
        </button>
        <button className="p-1.5 md:p-2 rounded-lg hover:bg-muted transition-colors hidden sm:flex">
          <HelpCircle size={16} className="text-muted-foreground" />
        </button>
        {actions}
      </div>
    </header>
  );
}