'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  TrendingUp,
  MapPin,
  FileBarChart2,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  ShieldCheck,
  Building2,
  AlertTriangle,
  BrainCircuit,
  Map,
  Eye,
  Grid3X3,
  FileText,
  CalendarDays,
  BadgeCheck,
  UserCircle,
  ScrollText,
  Satellite,
  LogOut,
  X,
  Train,
  IndianRupee,
  Layers,
  Ruler,
  UploadCloud,
  ClipboardCheck,
  Activity,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  group: string;
  /** If set, only show for these demo sectors (or always show when not in demo mode) */
  sectors?: Array<'building' | 'roads' | 'industrial_railway'>;
  /** If true, hide when in demo mode */
  hideInDemo?: boolean;
}

const navItems: NavItem[] = [
  { id: 'nav-dashboard', label: 'Dashboard', href: '/', icon: <LayoutDashboard size={18} />, group: 'main' },
  { id: 'nav-projects', label: 'All Projects', href: '/projects', icon: <FolderKanban size={18} />, group: 'main' },
  { id: 'nav-project-setup', label: 'New Project', href: '/project-setup', icon: <Building2 size={18} />, group: 'main' },
  { id: 'nav-project-detail', label: 'Project Detail', href: '/project-detail', icon: <Building2 size={18} />, group: 'main' },
  { id: 'nav-boq', label: 'BOQ Workflow', href: '/boq-workflow', icon: <ClipboardList size={18} />, group: 'main' },
  { id: 'nav-pdf-takeoff', label: 'PDF Takeoff Tool', href: '/pdf-takeoff', icon: <Ruler size={18} />, group: 'main' },
  { id: 'nav-progress', label: 'Progress Entries', href: '/project-detail', icon: <TrendingUp size={18} />, badge: 12, group: 'main' },
  // GIS Map & Satellite: only for roads and industrial_railway
  { id: 'nav-gis-map', label: 'GIS Map', href: '/gis-map', icon: <Map size={18} />, group: 'main', sectors: ['roads', 'industrial_railway'] },
  { id: 'nav-satellite', label: 'Satellite Monitor', href: '/satellite-monitor', icon: <Satellite size={18} />, group: 'main', sectors: ['roads', 'industrial_railway'] },
  { id: 'nav-sites', label: 'Site Map', href: '/gis-map', icon: <MapPin size={18} />, group: 'main' },
  // DPR & Schedule group
  { id: 'nav-master-plan', label: 'Master Plan Upload', href: '/master-plan', icon: <UploadCloud size={18} />, group: 'dpr' },
  { id: 'nav-dpr-entry', label: 'DPR Entry', href: '/dpr-entry', icon: <ClipboardCheck size={18} />, group: 'dpr' },
  { id: 'nav-variance-engine', label: 'Variance Engine', href: '/variance-engine', icon: <Activity size={18} />, group: 'dpr' },
  // Railway group
  { id: 'nav-railway-dashboard', label: 'Rail Dashboard', href: '/railway-dashboard', icon: <Train size={18} />, group: 'railway' },
  { id: 'nav-railway-dpr', label: 'Railway DPR', href: '/railway-dpr', icon: <FileText size={18} />, group: 'railway' },
  { id: 'nav-railway-wbs', label: 'Railway WBS & Assets', href: '/railway-wbs', icon: <Layers size={18} />, group: 'railway' },
  { id: 'nav-railway-boq', label: 'Railway BOQ', href: '/railway-boq', icon: <IndianRupee size={18} />, group: 'railway' },
  { id: 'nav-railway-report', label: 'Railway Report', href: '/railway-report', icon: <FileBarChart2 size={18} />, group: 'railway' },
  // Intelligence group
  { id: 'nav-intelligence', label: 'Road Intelligence', href: '/progress-intelligence', icon: <BrainCircuit size={18} />, group: 'intelligence' },
  { id: 'nav-railway-intelligence', label: 'Railway Intelligence', href: '/progress-intelligence?tab=railway', icon: <Train size={18} />, group: 'intelligence' },
  { id: 'nav-reports', label: 'Reports & Export', href: '/reports-export', icon: <FileBarChart2 size={18} />, group: 'intelligence' },
  { id: 'nav-verification', label: 'Verification', href: '/site-verification', icon: <ShieldCheck size={18} />, badge: 5, group: 'intelligence' },
  { id: 'nav-alerts', label: 'Alerts', href: '/notifications', icon: <AlertTriangle size={18} />, badge: 2, group: 'intelligence' },
  // Industrial group
  { id: 'nav-industrial-activity', label: 'Activity Grid', href: '/industrial-activity', icon: <Grid3X3 size={18} />, group: 'industrial' },
  { id: 'nav-industrial-dpr', label: 'Industrial DPR', href: '/industrial-dpr', icon: <FileText size={18} />, group: 'industrial' },
  { id: 'nav-industrial-schedule', label: 'Ind. Schedule', href: '/industrial-schedule', icon: <CalendarDays size={18} />, group: 'industrial' },
  { id: 'nav-industrial-verification', label: 'Ind. KARTAA Score', href: '/industrial-verification', icon: <BadgeCheck size={18} />, group: 'industrial' },
  // Admin group
  { id: 'nav-client-portal', label: 'Client Portal', href: '/client-portal', icon: <Eye size={18} />, group: 'admin' },
  { id: 'nav-audit-logs', label: 'Audit Trail', href: '/audit-logs', icon: <ScrollText size={18} />, group: 'admin' },
  { id: 'nav-team', label: 'Team Management', href: '/project-team', icon: <Users size={18} />, group: 'admin' },
  { id: 'nav-org', label: 'Organisation', href: '#', icon: <Building2 size={18} />, group: 'admin' },
  { id: 'nav-profile', label: 'My Profile', href: '/profile', icon: <UserCircle size={18} />, group: 'admin' },
  { id: 'nav-settings', label: 'Settings', href: '#', icon: <Settings size={18} />, group: 'admin' },
];

/** Groups visible per demo sector */
const SECTOR_GROUPS: Record<string, string[]> = {
  building: ['main', 'dpr', 'intelligence', 'admin'],
  roads: ['main', 'dpr', 'intelligence', 'admin'],
  industrial_railway: ['main', 'dpr', 'railway', 'intelligence', 'industrial', 'admin'],
};

const groupLabels: Record<string, string> = {
  main: 'Project',
  dpr: 'DPR & Schedule',
  railway: 'Railway',
  intelligence: 'Intelligence',
  industrial: 'Industrial',
  admin: 'Admin',
};

interface SidebarProps {
  currentPath?: string;
  onMobileClose?: () => void;
}

export default function Sidebar({ currentPath = '/', onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();
  const { isDemoUser, demoSector } = useDemo();

  const allGroups = ['main', 'dpr', 'railway', 'intelligence', 'industrial', 'admin'];

  // Determine which groups to show
  const visibleGroups = isDemoUser && demoSector
    ? SECTOR_GROUPS[demoSector] ?? allGroups
    : allGroups;

  function isItemVisible(item: NavItem): boolean {
    if (!isDemoUser || !demoSector) return true;
    // If item has sector restrictions, only show for matching sectors
    if (item.sectors && item.sectors.length > 0) {
      return item.sectors.includes(demoSector as any);
    }
    return true;
  }

  function handleNavClick() {
    onMobileClose?.();
  }

  // Demo sector label for org switcher
  const sectorLabels: Record<string, string> = {
    building: 'Building Construction',
    roads: 'Roads & Highways',
    industrial_railway: 'Industrial & Railway',
  };

  return (
    <aside
      className="relative flex flex-col h-screen border-r border-border bg-card flex-shrink-0 transition-all duration-300 ease-in-out"
      style={{ width: collapsed ? 64 : 240 }}
    >
      {/* Logo + mobile close button */}
      <div className="flex items-center h-16 px-3 border-b border-border flex-shrink-0 overflow-hidden">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <AppLogo size={32} />
          {!collapsed && (
            <div className="flex flex-col min-w-0 overflow-hidden">
              <span className="font-bold text-sm text-foreground tracking-tight leading-none">KARTAA OS</span>
              <span className="text-2xs text-muted-foreground leading-none mt-0.5">v1.0 — Phase 2</span>
            </div>
          )}
        </div>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
            aria-label="Close menu"
          >
            <X size={16} className="text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Org switcher */}
      {!collapsed && (
        <div className="mx-3 mt-3 mb-1 px-3 py-2 rounded-lg bg-muted border border-border cursor-pointer hover:border-primary/30 transition-colors">
          <div className="text-2xs text-muted-foreground uppercase tracking-wider mb-0.5">
            {isDemoUser ? 'Demo Sector' : 'Organisation'}
          </div>
          <div className="text-sm font-medium text-foreground truncate">
            {isDemoUser && demoSector ? sectorLabels[demoSector] : 'NHAI — Delhi Region'}
          </div>
          {isDemoUser && (
            <div className="text-2xs text-accent mt-0.5">Demo Mode</div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-2 space-y-0.5">
        {visibleGroups.map((group) => {
          const items = navItems.filter((n) => n.group === group && isItemVisible(n));
          if (items.length === 0) return null;
          return (
            <div key={`group-${group}`} className="mb-2">
              {!collapsed && (
                <div className={`px-3 py-1.5 text-2xs font-600 uppercase tracking-widest select-none ${
                  group === 'railway' ? 'text-info/70' : 'text-muted-foreground/60'
                }`}>
                  {groupLabels[group]}
                </div>
              )}
              {items.map((item) => {
                const isActive = currentPath === item.href || currentPath?.startsWith(item.href.split('?')[0]);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={handleNavClick}
                    className={`nav-item-base ${isActive ? 'nav-item-active' : ''} ${collapsed ? 'justify-center px-0' : ''} ${
                      group === 'railway' && !isActive ? 'hover:bg-info/5' : ''
                    }`}
                    title={collapsed ? item.label : undefined}
                    id={item.id === 'nav-industrial-dpr' ? 'tour-dpr-sidebar' : undefined}
                  >
                    <span className={`flex-shrink-0 ${group === 'railway' && !isActive ? 'text-info/70' : ''}`}>{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="ml-auto flex-shrink-0 text-2xs font-600 px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && item.badge !== undefined && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User profile + logout */}
      <div className={`border-t border-border p-3 flex-shrink-0 ${collapsed ? 'flex flex-col items-center gap-2' : 'flex flex-col gap-2'}`}>
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <Link href="/profile" onClick={handleNavClick} className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 hover:border-primary/60 transition-colors">
            <span className="text-xs font-700 text-primary">{isDemoUser ? 'DM' : 'RK'}</span>
          </Link>
          {!collapsed && (
            <Link href="/profile" onClick={handleNavClick} className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
              <div className="text-sm font-500 text-foreground truncate">
                {isDemoUser && demoSector ? `Demo — ${sectorLabels[demoSector]}` : 'Rajesh Kumar'}
              </div>
              <div className="text-2xs text-muted-foreground truncate">
                {isDemoUser ? 'Demo Account' : 'Project Manager'}
              </div>
            </Link>
          )}
          {!collapsed && (
            <button className="flex-shrink-0 p-1 rounded hover:bg-muted transition-colors relative">
              <Bell size={15} className="text-muted-foreground" />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-danger" />
            </button>
          )}
        </div>

        <button
          onClick={signOut}
          title="Log out"
          className={`flex items-center gap-2 rounded-lg bg-danger/10 hover:bg-danger/20 transition-colors group text-danger font-600 text-xs
            ${collapsed ? 'p-2 justify-center w-full' : 'px-3 py-2 w-full'}`}
        >
          <LogOut size={15} className="flex-shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>

      {/* Collapse toggle — desktop only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border items-center justify-center hover:bg-secondary transition-colors z-10 shadow-card hidden md:flex"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} className="text-muted-foreground" /> : <ChevronLeft size={12} className="text-muted-foreground" />}
      </button>
    </aside>
  );
}