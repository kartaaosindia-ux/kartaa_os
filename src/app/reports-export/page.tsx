'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import { FileBarChart2, Download, Filter, Calendar, CheckCircle2, Clock, FileText, BarChart3, ShieldCheck, TrendingUp, AlertTriangle, Eye, RefreshCw, Printer, Mail, FileSpreadsheet, Share2, ArrowUpRight, Layers, File } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import { useProject } from '@/contexts/ProjectContext';

// ─── Types ────────────────────────────────────────────────────────────────────
type ReportCategory = 'progress' | 'financial' | 'verification' | 'compliance' | 'executive';
type ExportFormat = 'pdf' | 'xlsx' | 'csv';

interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  lastGenerated: string;
  frequency: string;
  pages: number;
  icon: React.ReactNode;
  tags: string[];
}

interface GeneratedReport {
  id: string;
  title: string;
  project: string;
  generatedOn: string;
  period: string;
  format: ExportFormat;
  size: string;
  status: 'ready' | 'generating' | 'failed';
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const reportTemplates: ReportTemplate[] = [
  {
    id: 'rpt-001',
    title: 'Monthly Progress Report',
    description: 'Chainage-wise progress, layer completion %, KARTAA scores, and schedule variance for the reporting period.',
    category: 'progress',
    lastGenerated: '15 Aug 2026',
    frequency: 'Monthly',
    pages: 18,
    icon: <TrendingUp size={18} />,
    tags: ['Chainage', 'Layers', 'SPI', 'CPI'],
  },
  {
    id: 'rpt-002',
    title: 'BOQ Utilisation & Cost Report',
    description: 'Item-wise BOQ consumption, cost-to-complete, variance analysis, and budget burn rate in ₹INR.',
    category: 'financial',
    lastGenerated: '10 Aug 2026',
    frequency: 'Bi-weekly',
    pages: 12,
    icon: <BarChart3 size={18} />,
    tags: ['BOQ', '₹INR', 'Variance', 'Burn Rate'],
  },
  {
    id: 'rpt-003',
    title: 'KARTAA Verification Audit Report',
    description: 'Evidence quality scores, GPS accuracy, photo verification status, and pending verification items by phase.',
    category: 'verification',
    lastGenerated: '18 Aug 2026',
    frequency: 'Weekly',
    pages: 24,
    icon: <ShieldCheck size={18} />,
    tags: ['Evidence', 'GPS', 'Score', 'Pending'],
  },
  {
    id: 'rpt-004',
    title: 'Executive Summary Dashboard',
    description: 'One-page KPI snapshot for senior management: overall progress, KARTAA score, risk flags, and key milestones.',
    category: 'executive',
    lastGenerated: '20 Aug 2026',
    frequency: 'Weekly',
    pages: 4,
    icon: <Layers size={18} />,
    tags: ['KPI', 'Risk', 'Milestones', 'Summary'],
  },
  {
    id: 'rpt-005',
    title: 'Compliance & Quality Report',
    description: 'IRC/MORTH compliance checklist, quality test results, non-conformance register, and corrective actions.',
    category: 'compliance',
    lastGenerated: '12 Aug 2026',
    frequency: 'Monthly',
    pages: 31,
    icon: <CheckCircle2 size={18} />,
    tags: ['IRC', 'MORTH', 'NCR', 'Quality'],
  },
  {
    id: 'rpt-006',
    title: 'Site Photo Evidence Export',
    description: 'Geotagged photo compilation with chainage references, timestamps, and verification status for each layer.',
    category: 'verification',
    lastGenerated: '19 Aug 2026',
    frequency: 'On-demand',
    pages: 56,
    icon: <Eye size={18} />,
    tags: ['Photos', 'Geotag', 'Chainage', 'Evidence'],
  },
];

const generatedReports: GeneratedReport[] = [
  { id: 'gen-001', title: 'Monthly Progress Report — Jul 2026', project: 'NH-48 Pkg 3', generatedOn: '15 Aug 2026', period: 'Jul 2026', format: 'pdf', size: '4.2 MB', status: 'ready' },
  { id: 'gen-002', title: 'BOQ Utilisation Report — W3 Aug', project: 'NH-19 Pkg 1', generatedOn: '18 Aug 2026', period: 'W3 Aug 2026', format: 'xlsx', size: '1.8 MB', status: 'ready' },
  { id: 'gen-003', title: 'KARTAA Verification Audit — Aug', project: 'DL Exp. Pkg 2', generatedOn: '20 Aug 2026', period: 'Aug 2026', format: 'pdf', size: '7.1 MB', status: 'ready' },
  { id: 'gen-004', title: 'Executive Summary — W3 Aug', project: 'All Projects', generatedOn: '20 Aug 2026', period: 'W3 Aug 2026', format: 'pdf', size: '0.9 MB', status: 'ready' },
  { id: 'gen-005', title: 'Compliance Report — Jul 2026', project: 'NH-48 Pkg 3', generatedOn: '12 Aug 2026', period: 'Jul 2026', format: 'pdf', size: '9.3 MB', status: 'ready' },
  { id: 'gen-006', title: 'Site Photo Evidence — DBM Layer', project: 'NH-19 Pkg 1', generatedOn: '19 Aug 2026', period: 'Aug 2026', format: 'pdf', size: '22.4 MB', status: 'generating' },
];

const progressChartData = [
  { month: 'Mar', nh48: 38, nh19: 29, dl_exp: 52 },
  { month: 'Apr', nh48: 48, nh19: 36, dl_exp: 61 },
  { month: 'May', nh48: 57, nh19: 44, dl_exp: 69 },
  { month: 'Jun', nh48: 64, nh19: 51, dl_exp: 75 },
  { month: 'Jul', nh48: 71, nh19: 58, dl_exp: 81 },
  { month: 'Aug', nh48: 77, nh19: 63, dl_exp: 87 },
];

const boqData = [
  { item: 'Sub-grade', budget: 420, spent: 418, remaining: 2 },
  { item: 'GSB', budget: 310, spent: 298, remaining: 12 },
  { item: 'WMM', budget: 540, spent: 461, remaining: 79 },
  { item: 'DBM', budget: 680, spent: 389, remaining: 291 },
  { item: 'BC', budget: 720, spent: 0, remaining: 720 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const categoryColors: Record<ReportCategory, string> = {
  progress: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  financial: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  verification: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  compliance: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  executive: 'bg-primary/15 text-primary border-primary/20',
};

const categoryLabels: Record<ReportCategory, string> = {
  progress: 'Progress',
  financial: 'Financial',
  verification: 'Verification',
  compliance: 'Compliance',
  executive: 'Executive',
};

const formatIcons: Record<ExportFormat, React.ReactNode> = {
  pdf: <File size={14} />,
  xlsx: <FileSpreadsheet size={14} />,
  csv: <FileText size={14} />,
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function ReportCard({ report, onGenerate }: { report: ReportTemplate; onGenerate: (id: string) => void }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-primary/30 transition-colors group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
            {report.icon}
          </div>
          <div>
            <div className="text-sm font-600 text-foreground leading-tight">{report.title}</div>
            <div className="text-2xs text-muted-foreground mt-0.5">{report.frequency} · {report.pages} pages</div>
          </div>
        </div>
        <span className={`text-2xs font-500 px-2 py-0.5 rounded-full border ${categoryColors[report.category]}`}>
          {categoryLabels[report.category]}
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{report.description}</p>
      <div className="flex flex-wrap gap-1">
        {report.tags.map((tag) => (
          <span key={tag} className="text-2xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">{tag}</span>
        ))}
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <span className="text-2xs text-muted-foreground flex items-center gap-1">
          <Clock size={11} /> Last: {report.lastGenerated}
        </span>
        <div className="flex items-center gap-2">
          <button className="text-2xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            <Eye size={12} /> Preview
          </button>
          <button
            onClick={() => onGenerate(report.id)}
            className="text-2xs font-500 px-3 py-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1"
          >
            <Download size={12} /> Generate
          </button>
        </div>
      </div>
    </div>
  );
}

function GeneratedReportRow({ report }: { report: GeneratedReport }) {
  const statusConfig = {
    ready: { label: 'Ready', cls: 'text-emerald-400 bg-emerald-500/10', icon: <CheckCircle2 size={12} /> },
    generating: { label: 'Generating…', cls: 'text-amber-400 bg-amber-500/10', icon: <RefreshCw size={12} className="animate-spin" /> },
    failed: { label: 'Failed', cls: 'text-danger bg-danger/10', icon: <AlertTriangle size={12} /> },
  };
  const s = statusConfig[report.status];
  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      <td className="py-3 px-4">
        <div className="text-sm font-500 text-foreground">{report.title}</div>
        <div className="text-2xs text-muted-foreground mt-0.5">{report.project}</div>
      </td>
      <td className="py-3 px-4 text-xs text-muted-foreground">{report.period}</td>
      <td className="py-3 px-4 text-xs text-muted-foreground">{report.generatedOn}</td>
      <td className="py-3 px-4">
        <span className="flex items-center gap-1 text-2xs font-500 text-muted-foreground">
          {formatIcons[report.format]} {report.format.toUpperCase()}
        </span>
      </td>
      <td className="py-3 px-4 text-xs text-muted-foreground">{report.size}</td>
      <td className="py-3 px-4">
        <span className={`flex items-center gap-1 text-2xs font-500 px-2 py-0.5 rounded-full w-fit ${s.cls}`}>
          {s.icon} {s.label}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          {report.status === 'ready' && (
            <>
              <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Download">
                <Download size={14} />
              </button>
              <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Share">
                <Share2 size={14} />
              </button>
              <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Print">
                <Printer size={14} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReportsExportPage() {
  const [activeCategory, setActiveCategory] = useState<ReportCategory | 'all'>('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | 'all'>('all');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'templates' | 'generated' | 'analytics'>('templates');
  const { selectedProject: activeProject } = useProject();

  const handleGenerate = (id: string) => {
    setGeneratingId(id);
    setTimeout(() => setGeneratingId(null), 2000);
  };

  const filteredTemplates = reportTemplates.filter((r) =>
    activeCategory === 'all' || r.category === activeCategory
  );

  const categories: Array<{ key: ReportCategory | 'all'; label: string }> = [
    { key: 'all', label: 'All Reports' },
    { key: 'progress', label: 'Progress' },
    { key: 'financial', label: 'Financial' },
    { key: 'verification', label: 'Verification' },
    { key: 'compliance', label: 'Compliance' },
    { key: 'executive', label: 'Executive' },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        <Topbar title="Reports & Export" subtitle={`Generate, schedule, and export reports — ${activeProject.name}`} />
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* KPI Strip */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Reports Generated', value: '47', sub: 'This month', icon: <FileBarChart2 size={16} />, color: 'text-primary' },
              { label: 'Pending Exports', value: '3', sub: '1 generating', icon: <Clock size={16} />, color: 'text-amber-400' },
              { label: 'Scheduled Reports', value: '8', sub: 'Auto-delivery on', icon: <Calendar size={16} />, color: 'text-emerald-400' },
              { label: 'Total Export Size', value: '284 MB', sub: 'Aug 2026', icon: <Download size={16} />, color: 'text-muted-foreground' },
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

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border">
            {(['templates', 'generated', 'analytics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-500 capitalize border-b-2 transition-colors -mb-px ${
                  activeTab === tab
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'templates' ? 'Report Templates' : tab === 'generated' ? 'Generated Reports' : 'Analytics Preview'}
              </button>
            ))}
          </div>

          {/* ── Templates Tab ── */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      className={`px-3 py-1.5 text-xs font-500 rounded-md transition-colors ${
                        activeCategory === cat.key
                          ? 'bg-card text-foreground shadow-sm border border-border'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="text-xs bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="all">All Projects</option>
                    <option value="nh48">NH-48 Pkg 3</option>
                    <option value="nh19">NH-19 Pkg 1</option>
                    <option value="dl">DL Exp. Pkg 2</option>
                  </select>
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value as ExportFormat | 'all')}
                    className="text-xs bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="all">All Formats</option>
                    <option value="pdf">PDF</option>
                    <option value="xlsx">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
              </div>

              {/* Report Cards Grid */}
              <div className="grid grid-cols-3 gap-4">
                {filteredTemplates.map((report) => (
                  <ReportCard key={report.id} report={report} onGenerate={handleGenerate} />
                ))}
              </div>

              {/* Bulk Export */}
              <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-600 text-foreground">Bulk Export Package</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Generate all reports for a project in one ZIP archive — PDF + Excel + Photo evidence</div>
                </div>
                <div className="flex items-center gap-3">
                  <select className="text-xs bg-muted border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary">
                    <option>NH-48 Pkg 3</option>
                    <option>NH-19 Pkg 1</option>
                    <option>DL Exp. Pkg 2</option>
                  </select>
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-500 hover:bg-primary/90 transition-colors">
                    <Download size={14} /> Export All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Generated Reports Tab ── */}
          {activeTab === 'generated' && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="text-sm font-600 text-foreground">Recent Generated Reports</div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border hover:border-primary/30 transition-colors">
                    <Filter size={12} /> Filter
                  </button>
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border hover:border-primary/30 transition-colors">
                    <Mail size={12} /> Email All
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {['Report', 'Period', 'Generated', 'Format', 'Size', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-2xs font-600 uppercase tracking-wider text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {generatedReports.map((r) => (
                      <GeneratedReportRow key={r.id} report={r} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Analytics Preview Tab ── */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-2 gap-5">
              {/* Progress Chart */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-600 text-foreground">Project Progress Trend</div>
                    <div className="text-2xs text-muted-foreground">Mar–Aug 2026 · % completion</div>
                  </div>
                  <button className="flex items-center gap-1 text-2xs text-primary hover:underline">
                    Export <ArrowUpRight size={11} />
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={progressChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} domain={[20, 100]} />
                    <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="nh48" stroke="#f59e0b" strokeWidth={2} dot={false} name="NH-48 Pkg 3" />
                    <Line type="monotone" dataKey="nh19" stroke="#ef4444" strokeWidth={2} dot={false} name="NH-19 Pkg 1" />
                    <Line type="monotone" dataKey="dl_exp" stroke="#22c55e" strokeWidth={2} dot={false} name="DL Exp. Pkg 2" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* BOQ Chart */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-600 text-foreground">BOQ Budget vs Spent</div>
                    <div className="text-2xs text-muted-foreground">NH-48 Pkg 3 · ₹ Lakhs</div>
                  </div>
                  <button className="flex items-center gap-1 text-2xs text-primary hover:underline">
                    Export <ArrowUpRight size={11} />
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={boqData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="item" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                    <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="budget" fill="var(--muted)" name="Budget" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="spent" fill="var(--primary)" name="Spent" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Scheduled Reports */}
              <div className="col-span-2 bg-card border border-border rounded-xl p-5">
                <div className="text-sm font-600 text-foreground mb-4">Scheduled Auto-Delivery</div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { title: 'Weekly Executive Summary', recipients: 'DG (Roads), CE-NH', next: 'Mon 25 Aug', format: 'PDF' },
                    { title: 'Monthly Progress Report', recipients: 'NHAI HQ, PM Team', next: '1 Sep 2026', format: 'PDF + Excel' },
                    { title: 'Bi-weekly BOQ Report', recipients: 'Finance Controller', next: 'Wed 27 Aug', format: 'Excel' },
                    { title: 'Verification Audit', recipients: 'Quality Team, Client', next: 'Fri 29 Aug', format: 'PDF' },
                  ].map((s) => (
                    <div key={s.title} className="bg-muted/40 border border-border rounded-lg p-3">
                      <div className="text-xs font-600 text-foreground mb-1">{s.title}</div>
                      <div className="text-2xs text-muted-foreground mb-2">{s.recipients}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xs text-primary flex items-center gap-1"><Calendar size={10} /> {s.next}</span>
                        <span className="text-2xs text-muted-foreground">{s.format}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </AppLayout>
  );
}
