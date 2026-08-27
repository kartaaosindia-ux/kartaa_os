'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import { Eye, ShieldCheck, TrendingUp, AlertTriangle, CheckCircle2, Clock, MapPin, FileText, Download, Lock, User, Calendar, Info, Camera, FileBarChart2,  } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
type PortalRole = 'client' | 'consultant' | 'authority';

interface PortalUser {
  id: string;
  name: string;
  role: PortalRole;
  organisation: string;
  accessLevel: string;
  lastLogin: string;
  projectsAccess: string[];
}

interface ProgressEntry {
  chainage: string;
  layer: string;
  completedOn: string;
  kartaaScore: number;
  status: 'verified' | 'pending' | 'flagged';
  evidence: number;
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const portalUsers: PortalUser[] = [
  { id: 'u1', name: 'Suresh Mehta', role: 'client', organisation: 'NHAI — Client Division', accessLevel: 'Read-only · Progress + Reports', lastLogin: '20 Aug 2026, 14:32', projectsAccess: ['NH-48 Pkg 3', 'NH-19 Pkg 1'] },
  { id: 'u2', name: 'Dr. Priya Nair', role: 'consultant', organisation: 'AECOM India Pvt. Ltd.', accessLevel: 'Read-only · Verification + BOQ', lastLogin: '19 Aug 2026, 09:15', projectsAccess: ['DL Exp. Pkg 2'] },
  { id: 'u3', name: 'Anand Sharma', role: 'authority', organisation: 'MoRTH — Quality Wing', accessLevel: 'Read-only · All modules', lastLogin: '18 Aug 2026, 16:48', projectsAccess: ['NH-48 Pkg 3', 'NH-19 Pkg 1', 'DL Exp. Pkg 2'] },
];

const progressTrend = [
  { week: 'W1 Jul', progress: 64 },
  { week: 'W2 Jul', progress: 67 },
  { week: 'W3 Jul', progress: 70 },
  { week: 'W4 Jul', progress: 73 },
  { week: 'W1 Aug', progress: 75 },
  { week: 'W2 Aug', progress: 77 },
  { week: 'W3 Aug', progress: 77 },
];

const progressEntries: ProgressEntry[] = [
  { chainage: '42+000–43+500', layer: 'BC Layer', completedOn: '18 Aug 2026', kartaaScore: 88, status: 'verified', evidence: 14 },
  { chainage: '43+500–45+000', layer: 'DBM Layer', completedOn: '15 Aug 2026', kartaaScore: 74, status: 'pending', evidence: 9 },
  { chainage: '45+000–47+200', layer: 'WMM Layer', completedOn: '10 Aug 2026', kartaaScore: 91, status: 'verified', evidence: 18 },
  { chainage: '47+200–49+000', layer: 'DBM Layer', completedOn: '08 Aug 2026', kartaaScore: 62, status: 'flagged', evidence: 6 },
  { chainage: '49+000–51+500', layer: 'Sub-base (GSB)', completedOn: '02 Aug 2026', kartaaScore: 94, status: 'verified', evidence: 21 },
  { chainage: '51+500–53+000', layer: 'Sub-grade', completedOn: '28 Jul 2026', kartaaScore: 96, status: 'verified', evidence: 24 },
];

const availableReports = [
  { title: 'Monthly Progress Report — Jul 2026', date: '15 Aug 2026', size: '4.2 MB', type: 'PDF' },
  { title: 'KARTAA Verification Summary — Aug W3', date: '20 Aug 2026', size: '2.1 MB', type: 'PDF' },
  { title: 'Executive Dashboard Snapshot', date: '20 Aug 2026', size: '0.9 MB', type: 'PDF' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const roleConfig: Record<PortalRole, { label: string; cls: string }> = {
  client: { label: 'Client', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  consultant: { label: 'Consultant', cls: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  authority: { label: 'Authority', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
};

const statusConfig = {
  verified: { label: 'Verified', cls: 'text-emerald-400 bg-emerald-500/10', icon: <CheckCircle2 size={12} /> },
  pending: { label: 'Pending', cls: 'text-amber-400 bg-amber-500/10', icon: <Clock size={12} /> },
  flagged: { label: 'Flagged', cls: 'text-danger bg-danger/10', icon: <AlertTriangle size={12} /> },
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ClientPortalPage() {
  const [selectedUser, setSelectedUser] = useState<PortalUser>(portalUsers[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'verification' | 'reports'>('overview');

  return (
    <AppLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        <Topbar title="Client / Consultant Portal" subtitle="Read-only stakeholder view — limited access by role" />
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Read-only Banner */}
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/8 border border-amber-500/20 rounded-xl">
            <Lock size={15} className="text-amber-400 flex-shrink-0" />
            <div className="text-xs text-amber-300">
              <span className="font-600">Read-Only Portal View</span> — Stakeholders can view progress, verification status, and approved reports. No data entry or modification is permitted. All actions are audit-logged.
            </div>
          </div>

          {/* Portal User Switcher */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-3">Viewing As — Portal User</div>
            <div className="grid grid-cols-3 gap-3">
              {portalUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    selectedUser.id === user.id
                      ? 'border-primary bg-primary/5' :'border-border hover:border-primary/30 bg-muted/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-2xs font-700 text-primary">
                      {user.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-xs font-600 text-foreground">{user.name}</div>
                      <span className={`text-2xs font-500 px-1.5 py-0.5 rounded-full border ${roleConfig[user.role].cls}`}>
                        {roleConfig[user.role].label}
                      </span>
                    </div>
                  </div>
                  <div className="text-2xs text-muted-foreground">{user.organisation}</div>
                  <div className="text-2xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Eye size={10} /> {user.accessLevel}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected User Info Strip */}
          <div className="flex items-center gap-4 px-4 py-3 bg-card border border-border rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-700 text-primary">
              {selectedUser.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="text-sm font-600 text-foreground">{selectedUser.name}</div>
              <div className="text-xs text-muted-foreground">{selectedUser.organisation}</div>
            </div>
            <div className="text-right">
              <div className="text-2xs text-muted-foreground">Last login</div>
              <div className="text-xs font-500 text-foreground">{selectedUser.lastLogin}</div>
            </div>
            <div className="text-right">
              <div className="text-2xs text-muted-foreground">Projects</div>
              <div className="text-xs font-500 text-foreground">{selectedUser.projectsAccess.join(', ')}</div>
            </div>
            <div className="px-3 py-1.5 bg-muted rounded-lg text-2xs text-muted-foreground flex items-center gap-1.5">
              <Lock size={11} /> {selectedUser.accessLevel}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border">
            {(['overview', 'progress', 'verification', 'reports'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-500 capitalize border-b-2 transition-colors -mb-px ${
                  activeTab === tab
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'overview' ? 'Project Overview' : tab === 'progress' ? 'Progress Log' : tab === 'verification' ? 'Verification Status' : 'Shared Reports'}
              </button>
            ))}
          </div>

          {/* ── Overview Tab ── */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* KPI Cards */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Overall Progress', value: '77.1%', sub: 'NH-48 Pkg 3', icon: <TrendingUp size={16} />, color: 'text-primary' },
                  { label: 'KARTAA Score', value: '82/100', sub: 'Verified by system', icon: <ShieldCheck size={16} />, color: 'text-emerald-400' },
                  { label: 'Active Chainage', value: '42+000', sub: 'Current front', icon: <MapPin size={16} />, color: 'text-amber-400' },
                  { label: 'Pending Verification', value: '5 items', sub: 'Requires attention', icon: <Clock size={16} />, color: 'text-danger' },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-muted flex items-center justify-center ${kpi.color}`}>
                      {kpi.icon}
                    </div>
                    <div>
                      <div className="text-xl font-700 text-foreground">{kpi.value}</div>
                      <div className="text-xs font-500 text-foreground">{kpi.label}</div>
                      <div className="text-2xs text-muted-foreground">{kpi.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Trend + Project Info */}
              <div className="grid grid-cols-3 gap-5">
                <div className="col-span-2 bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm font-600 text-foreground">Progress Trend — NH-48 Pkg 3</div>
                      <div className="text-2xs text-muted-foreground">Jul–Aug 2026 · % completion</div>
                    </div>
                    <div className="flex items-center gap-1 text-2xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                      <Lock size={10} /> Read-only
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={progressTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} domain={[60, 85]} />
                      <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                      <Line type="monotone" dataKey="progress" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} name="Progress %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                  <div className="text-sm font-600 text-foreground">Project Details</div>
                  {[
                    { label: 'Project', value: 'NH-48 Package 3' },
                    { label: 'Chainage', value: '42+000 to 67+500' },
                    { label: 'Contractor', value: 'L&T Infrastructure' },
                    { label: 'Contract Value', value: '₹ 847 Cr' },
                    { label: 'Target Completion', value: 'Mar 2027' },
                    { label: 'Current Phase', value: 'DBM Layer' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <span className="text-xs font-500 text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Access Restrictions Notice */}
              <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
                <Info size={15} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-600 text-foreground mb-1">Access Permissions for {selectedUser.name}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    This portal provides <span className="text-foreground font-500">read-only visibility</span> into project progress, KARTAA verification scores, and approved reports.
                    Drawing files, BOQ unit rates, contractor financials, and internal team communications are <span className="text-danger font-500">not accessible</span> at this permission level.
                    Contact the Project Manager to request elevated access.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Progress Log Tab ── */}
          {activeTab === 'progress' && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="text-sm font-600 text-foreground">Progress Entries — NH-48 Pkg 3</div>
                <div className="flex items-center gap-1.5 text-2xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded-lg">
                  <Lock size={10} /> View-only · No edits permitted
                </div>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {['Chainage', 'Layer', 'Completed On', 'KARTAA Score', 'Evidence', 'Status'].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-2xs font-600 uppercase tracking-wider text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {progressEntries.map((entry) => {
                    const s = statusConfig[entry.status];
                    return (
                      <tr key={entry.chainage} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-foreground">{entry.chainage}</td>
                        <td className="py-3 px-4 text-xs text-foreground">{entry.layer}</td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">{entry.completedOn}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full max-w-16">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${entry.kartaaScore}%`,
                                  background: entry.kartaaScore >= 85 ? '#22c55e' : entry.kartaaScore >= 70 ? '#f59e0b' : '#ef4444',
                                }}
                              />
                            </div>
                            <span className="text-xs font-600 text-foreground">{entry.kartaaScore}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Camera size={12} /> {entry.evidence} photos
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`flex items-center gap-1 text-2xs font-500 px-2 py-0.5 rounded-full w-fit ${s.cls}`}>
                            {s.icon} {s.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Verification Tab ── */}
          {activeTab === 'verification' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Verified Entries', value: '4', total: '6', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Pending Review', value: '1', total: '6', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                  { label: 'Flagged Items', value: '1', total: '6', color: 'text-danger', bg: 'bg-danger/10' },
                ].map((stat) => (
                  <div key={stat.label} className={`${stat.bg} border border-border rounded-xl p-4 text-center`}>
                    <div className={`text-3xl font-700 ${stat.color}`}>{stat.value}<span className="text-lg text-muted-foreground">/{stat.total}</span></div>
                    <div className="text-xs font-500 text-foreground mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck size={16} className="text-primary" />
                  <div className="text-sm font-600 text-foreground">KARTAA Verification Principle</div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  KARTAA OS uses <span className="text-foreground font-500">assisted verification, never automated certification</span>. Every verification score shown here is based on evidence submitted by the site team and reviewed by the Project Manager. Clients and consultants can view scores and flag concerns — final certification remains with the authorised engineer.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Evidence Quality', score: 82, icon: <Camera size={14} /> },
                    { label: 'BOQ Match', score: 91, icon: <FileText size={14} /> },
                    { label: 'Schedule Adherence', score: 78, icon: <Calendar size={14} /> },
                  ].map((dim) => (
                    <div key={dim.label} className="bg-muted/40 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2 text-muted-foreground">{dim.icon}<span className="text-xs">{dim.label}</span></div>
                      <div className="text-xl font-700 text-foreground">{dim.score}<span className="text-sm text-muted-foreground">/100</span></div>
                      <div className="h-1.5 bg-muted rounded-full mt-2">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${dim.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Reports Tab ── */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="text-sm font-600 text-foreground mb-1">Shared Reports</div>
                <div className="text-xs text-muted-foreground mb-4">Reports approved for external sharing by the Project Manager. Download available in PDF format.</div>
                <div className="space-y-3">
                  {availableReports.map((report) => (
                    <div key={report.title} className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                          <FileBarChart2 size={14} />
                        </div>
                        <div>
                          <div className="text-xs font-500 text-foreground">{report.title}</div>
                          <div className="text-2xs text-muted-foreground">{report.date} · {report.size} · {report.type}</div>
                        </div>
                      </div>
                      <button className="flex items-center gap-1.5 text-xs font-500 text-primary hover:text-primary/80 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors">
                        <Download size={12} /> Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-muted/30 border border-border rounded-xl p-4 flex items-start gap-3">
                <Info size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-xs text-muted-foreground">
                  Only reports explicitly shared by the Project Manager are visible here. To request additional reports or data exports, contact <span className="text-foreground font-500">Rajesh Kumar (PM)</span> via the project communication channel.
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </AppLayout>
  );
}
