'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpDown, Eye, Edit2, MoreHorizontal, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';
import { useDemo, DEMO_PROJECTS } from '@/contexts/DemoContext';

type ProjectStatus = 'active' | 'delayed' | 'on-hold' | 'draft' | 'completed';

interface Project {
  id: string;
  code: string;
  name: string;
  project_type: 'Road' | 'Industrial';
  location: string;
  chainage_range: string;
  budget: string;
  progress: number;
  kartaa_score: number;
  spi: number;
  status: ProjectStatus;
  last_updated: string;
}

const FALLBACK_PROJECTS: Project[] = [
  { id: 'proj-001', code: 'NHAI-DL-2024-048', name: 'NH-48 Bypass Package 3', project_type: 'Road', location: 'Gurgaon, Haryana', chainage_range: '42+000 – 67+500', budget: '₹6,21,40,000', progress: 77.1, kartaa_score: 82, spi: 0.88, status: 'active', last_updated: '23 Aug' },
  { id: 'proj-002', code: 'HSIIDC-MN-2023-112', name: 'Manesar Industrial Phase II', project_type: 'Industrial', location: 'Manesar, Haryana', chainage_range: '—', budget: '₹9,14,00,000', progress: 44.1, kartaa_score: 61, spi: 0.71, status: 'delayed', last_updated: '18 Aug' },
  { id: 'proj-003', code: 'NHAI-HR-2024-031', name: 'Kundli–Manesar Expressway', project_type: 'Road', location: 'Sonipat–Gurgaon Corridor', chainage_range: '0+000 – 83+200', budget: '₹14,82,00,000', progress: 52.8, kartaa_score: 91, spi: 0.96, status: 'active', last_updated: '23 Aug' },
  { id: 'proj-004', code: 'HPWD-FR-2024-007', name: 'Faridabad Ring Road Segment 4', project_type: 'Road', location: 'Faridabad, Haryana', chainage_range: '18+400 – 34+700', budget: '₹11,34,00,000', progress: 38.4, kartaa_score: 74, spi: 0.81, status: 'on-hold', last_updated: '20 Aug' },
  { id: 'proj-005', code: 'NHAI-HR-2025-019', name: 'Bahadurgarh Bypass Extension', project_type: 'Road', location: 'Bahadurgarh, Haryana', chainage_range: '12+000 – 29+500', budget: '₹7,62,00,000', progress: 67.3, kartaa_score: 79, spi: 0.93, status: 'active', last_updated: '22 Aug' },
  { id: 'proj-006', code: 'DMIDC-RP-2024-044', name: 'Rewari Packaging Hub — Phase I', project_type: 'Industrial', location: 'Rewari, Haryana', chainage_range: '—', budget: '₹5,48,00,000', progress: 91.2, kartaa_score: 88, spi: 0.99, status: 'completed', last_updated: '21 Aug' },
  { id: 'proj-007', code: 'NHAI-UP-2025-003', name: 'Delhi–Meerut Expressway Pkg-7', project_type: 'Road', location: 'Ghaziabad, UP', chainage_range: '68+000 – 92+400', budget: '₹18,90,00,000', progress: 12.4, kartaa_score: 0, spi: 0.0, status: 'draft', last_updated: '15 Aug' },
  { id: 'proj-008', code: 'HSIIDC-GG-2024-088', name: 'Gurugram Tech Corridor Block-B', project_type: 'Industrial', location: 'Gurugram Sector 81', chainage_range: '—', budget: '₹8,33,00,000', progress: 58.7, kartaa_score: 76, spi: 0.85, status: 'active', last_updated: '23 Aug' },
];

type SortKey = 'name' | 'progress' | 'kartaa_score' | 'spi' | 'status';

const statusConfig: Record<ProjectStatus, { label: string; variant: any }> = {
  active: { label: 'Active', variant: 'success' },
  delayed: { label: 'Delayed', variant: 'danger' },
  'on-hold': { label: 'On Hold', variant: 'warning' },
  draft: { label: 'Draft', variant: 'default' },
  completed: { label: 'Completed', variant: 'info' },
};

function scoreColor(score: number) {
  if (score >= 85) return 'text-success';
  if (score >= 70) return 'text-accent';
  if (score >= 55) return 'text-warning';
  if (score === 0) return 'text-muted-foreground';
  return 'text-danger';
}

function spiColor(spi: number) {
  if (spi >= 0.95) return 'text-success';
  if (spi >= 0.85) return 'text-accent';
  if (spi >= 0.75) return 'text-warning';
  if (spi === 0) return 'text-muted-foreground';
  return 'text-danger';
}

export default function ProjectStatusTable() {
  const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('kartaa_score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const perPage = 6;
  const supabase = createClient();
  const { isDemoUser, demoSector } = useDemo();

  useEffect(() => {
    const fetchProjects = async () => {
      // Demo mode: use sector-filtered demo projects
      if (isDemoUser && demoSector) {
        const sectorProjects = DEMO_PROJECTS.filter((p) => p.sector === demoSector) as unknown as Project[];
        setProjects(sectorProjects);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('kartaa_score', { ascending: false });
        if (!error && data && data.length > 0) {
          setProjects(data);
        }
      } catch {
        // use fallback
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [isDemoUser, demoSector]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = projects
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const mult = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'name') return mult * a.name.localeCompare(b.name);
      if (sortKey === 'progress') return mult * (a.progress - b.progress);
      if (sortKey === 'kartaa_score') return mult * (a.kartaa_score - b.kartaa_score);
      if (sortKey === 'spi') return mult * (a.spi - b.spi);
      if (sortKey === 'status') return mult * a.status.localeCompare(b.status);
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / perPage);
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleRow = (id: string) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  const toggleAll = () => setSelectedRows(prev => prev.length === pageData.length ? [] : pageData.map(p => p.id));

  const SortBtn = ({ col }: { col: SortKey }) => (
    <button onClick={() => handleSort(col)} className="ml-1 opacity-40 hover:opacity-100 transition-opacity">
      <ArrowUpDown size={11} />
    </button>
  );

  return (
    <div className="card-elevated flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h3 className="text-sm font-600 text-foreground">Project Portfolio</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{projects.length} projects · {projects.filter(p => p.status === 'active').length} active</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-8 pr-3 py-1.5 text-xs bg-muted border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50 w-44"
            />
          </div>
          <button className="p-1.5 rounded-lg border border-border bg-muted hover:bg-muted/80 transition-colors">
            <Filter size={13} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-2.5 text-left w-8">
                <input type="checkbox" checked={selectedRows.length === pageData.length && pageData.length > 0} onChange={toggleAll} className="w-3 h-3 accent-primary rounded" />
              </th>
              <th className="px-4 py-2.5 text-left font-600 text-muted-foreground">
                Project <SortBtn col="name" />
              </th>
              <th className="px-4 py-2.5 text-left font-600 text-muted-foreground hidden lg:table-cell">Location</th>
              <th className="px-4 py-2.5 text-center font-600 text-muted-foreground">
                Progress <SortBtn col="progress" />
              </th>
              <th className="px-4 py-2.5 text-center font-600 text-muted-foreground">
                KARTAA <SortBtn col="kartaa_score" />
              </th>
              <th className="px-4 py-2.5 text-center font-600 text-muted-foreground hidden xl:table-cell">
                SPI <SortBtn col="spi" />
              </th>
              <th className="px-4 py-2.5 text-center font-600 text-muted-foreground">
                Status <SortBtn col="status" />
              </th>
              <th className="px-4 py-2.5 text-center font-600 text-muted-foreground hidden md:table-cell">Updated</th>
              <th className="px-4 py-2.5 text-center font-600 text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3" colSpan={9}>
                    <div className="h-4 bg-muted rounded w-full" />
                  </td>
                </tr>
              ))
            ) : pageData.map((project) => {
              const sc = statusConfig[project.status];
              return (
                <tr key={project.id} className={`hover:bg-muted/20 transition-colors ${selectedRows.includes(project.id) ? 'bg-primary/5' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedRows.includes(project.id)} onChange={() => toggleRow(project.id)} className="w-3 h-3 accent-primary rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-600 text-foreground truncate max-w-[180px]">{project.name}</div>
                    <div className="text-muted-foreground font-mono mt-0.5">{project.code}</div>
                    <span className={`inline-block mt-1 text-2xs px-1.5 py-0.5 rounded font-500 ${project.project_type === 'Road' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                      {project.project_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    <div>{project.location}</div>
                    {project.chainage_range !== '—' && <div className="font-mono text-2xs mt-0.5">{project.chainage_range}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-600 text-foreground">{project.progress}%</span>
                      <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-700 text-sm ${scoreColor(project.kartaa_score)}`}>
                      {project.kartaa_score > 0 ? project.kartaa_score : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center hidden xl:table-cell">
                    <span className={`font-600 ${spiColor(project.spi)}`}>
                      {project.spi > 0 ? project.spi.toFixed(2) : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={sc.variant} size="sm">{sc.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground hidden md:table-cell">{project.last_updated}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Link href={`/project-detail?id=${project.id}`} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <Eye size={13} />
                      </Link>
                      <Link href={`/project-edit?id=${project.id}`} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <Edit2 size={13} />
                      </Link>
                      <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <MoreHorizontal size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-3 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {selectedRows.length > 0 ? `${selectedRows.length} selected · ` : ''}
          {filtered.length} projects
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded hover:bg-muted transition-colors disabled:opacity-30">
            <ChevronLeft size={13} />
          </button>
          <span className="text-xs text-muted-foreground px-2">{page} / {totalPages || 1}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded hover:bg-muted transition-colors disabled:opacity-30">
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}