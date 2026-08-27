'use client';
import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import {
  Search, Download, Filter, Shield, LogIn, LogOut, Edit3, CheckCircle2,
  FileDown, AlertTriangle, Eye, Trash2, UserPlus, RefreshCw, ChevronLeft,
  ChevronRight, Clock, User,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type ActionCategory = 'auth' | 'project' | 'verification' | 'export' | 'admin' | 'data';
type SeverityLevel = 'info' | 'warning' | 'critical' | 'success';

interface AuditEntry {
  id: string;
  created_at: string;
  user_name: string;
  user_id: string;
  user_role: string;
  action: string;
  category: ActionCategory;
  severity: SeverityLevel;
  resource: string;
  ip_address: string;
  details: string;
}

const categoryConfig: Record<ActionCategory, { label: string; color: string; icon: React.ReactNode }> = {
  auth: { label: 'Auth', color: 'bg-blue-500/15 text-blue-400', icon: <LogIn size={12} /> },
  project: { label: 'Project', color: 'bg-primary/15 text-primary', icon: <Edit3 size={12} /> },
  verification: { label: 'Verification', color: 'bg-accent/15 text-accent', icon: <CheckCircle2 size={12} /> },
  export: { label: 'Export', color: 'bg-purple-500/15 text-purple-400', icon: <FileDown size={12} /> },
  admin: { label: 'Admin', color: 'bg-orange-500/15 text-orange-400', icon: <Shield size={12} /> },
  data: { label: 'Data', color: 'bg-cyan-500/15 text-cyan-400', icon: <RefreshCw size={12} /> },
};

const severityConfig: Record<SeverityLevel, { label: string; dot: string }> = {
  info: { label: 'Info', dot: 'bg-blue-400' },
  success: { label: 'Success', dot: 'bg-success' },
  warning: { label: 'Warning', dot: 'bg-warning' },
  critical: { label: 'Critical', dot: 'bg-danger' },
};

const actionIcons: Record<string, React.ReactNode> = {
  'User Login': <LogIn size={14} className="text-blue-400" />,
  'User Logout': <LogOut size={14} className="text-muted-foreground" />,
  'Layer Verified': <CheckCircle2 size={14} className="text-success" />,
  'Verification Rejected': <AlertTriangle size={14} className="text-danger" />,
  'Report Exported': <FileDown size={14} className="text-purple-400" />,
  'Bulk Export': <FileDown size={14} className="text-purple-400" />,
  'BOQ Item Edited': <Edit3 size={14} className="text-warning" />,
  'BOQ Item Deleted': <Trash2 size={14} className="text-danger" />,
  'New User Created': <UserPlus size={14} className="text-accent" />,
  'User Role Changed': <Shield size={14} className="text-orange-400" />,
  'System Config Changed': <AlertTriangle size={14} className="text-danger" />,
};

const PAGE_SIZE = 10;

export default function AuditLogsPage() {
  const [auditData, setAuditData] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<ActionCategory | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('audit_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200);
        if (!error && data && data.length > 0) {
          setAuditData(data);
        }
      } catch {
        // use empty state
      } finally {
        setLoading(false);
      }
    };
    fetchAuditLogs();
  }, []);

  const uniqueUsers = useMemo(() => Array.from(new Set(auditData.map((e) => e.user_name))), [auditData]);
  const uniqueRoles = useMemo(() => Array.from(new Set(auditData.map((e) => e.user_role))), [auditData]);

  const filtered = useMemo(() => {
    return auditData.filter((e) => {
      const matchSearch = !search ||
        e.action?.toLowerCase().includes(search.toLowerCase()) ||
        e.user_name?.toLowerCase().includes(search.toLowerCase()) ||
        e.resource?.toLowerCase().includes(search.toLowerCase()) ||
        e.details?.toLowerCase().includes(search.toLowerCase());
      const matchUser = selectedUser === 'all' || e.user_name === selectedUser;
      const matchRole = selectedRole === 'all' || e.user_role === selectedRole;
      const matchCat = selectedCategory === 'all' || e.category === selectedCategory;
      const matchSev = selectedSeverity === 'all' || e.severity === selectedSeverity;
      const ts = e.created_at?.slice(0, 10) || '';
      const matchFrom = !dateFrom || ts >= dateFrom;
      const matchTo = !dateTo || ts <= dateTo;
      return matchSearch && matchUser && matchRole && matchCat && matchSev && matchFrom && matchTo;
    });
  }, [auditData, search, selectedUser, selectedRole, selectedCategory, selectedSeverity, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const today = new Date().toISOString().slice(0, 10);
  const stats = useMemo(() => ({
    total: auditData.length,
    critical: auditData.filter((e) => e.severity === 'critical').length,
    today: auditData.filter((e) => e.created_at?.slice(0, 10) === today).length,
    exports: auditData.filter((e) => e.category === 'export').length,
  }), [auditData]);

  const formatTimestamp = (ts: string) => {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AppLayout>
      <Topbar title="Audit Trail" subtitle="Compliance log of all user actions across the platform" />
      <main className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Events', value: stats.total, icon: <Clock size={16} />, color: 'text-primary', bg: 'bg-primary/10' },
            { label: "Today's Events", value: stats.today, icon: <RefreshCw size={16} />, color: 'text-accent', bg: 'bg-accent/10' },
            { label: 'Critical Actions', value: stats.critical, icon: <AlertTriangle size={16} />, color: 'text-danger', bg: 'bg-danger/10' },
            { label: 'Exports', value: stats.exports, icon: <FileDown size={16} />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          ].map((s) => (
            <div key={s.label} className="card-elevated p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0 ${s.color}`}>{s.icon}</div>
              <div>
                <div className="text-xl font-700 text-foreground">{loading ? '—' : s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card-elevated p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Filter size={14} className="text-muted-foreground" />
            <span className="text-xs font-600 text-muted-foreground uppercase tracking-wider">Filters & Search</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="relative lg:col-span-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search action, user, resource…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-2 text-sm bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
            <select value={selectedUser} onChange={(e) => { setSelectedUser(e.target.value); setPage(1); }} className="px-3 py-2 text-sm bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-primary/50">
              <option value="all">All Users</option>
              {uniqueUsers.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            <select value={selectedRole} onChange={(e) => { setSelectedRole(e.target.value); setPage(1); }} className="px-3 py-2 text-sm bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-primary/50">
              <option value="all">All Roles</option>
              {uniqueRoles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value as any); setPage(1); }} className="px-3 py-2 text-sm bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-primary/50">
              <option value="all">All Categories</option>
              {(Object.keys(categoryConfig) as ActionCategory[]).map((c) => <option key={c} value={c}>{categoryConfig[c].label}</option>)}
            </select>
            <select value={selectedSeverity} onChange={(e) => { setSelectedSeverity(e.target.value as any); setPage(1); }} className="px-3 py-2 text-sm bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-primary/50">
              <option value="all">All Severity</option>
              {(Object.keys(severityConfig) as SeverityLevel[]).map((s) => <option key={s} value={s}>{severityConfig[s].label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">From:</label>
              <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="px-2 py-1.5 text-xs bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-primary/50" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">To:</label>
              <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="px-2 py-1.5 text-xs bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-primary/50" />
            </div>
            {(search || selectedUser !== 'all' || selectedRole !== 'all' || selectedCategory !== 'all' || selectedSeverity !== 'all' || dateFrom || dateTo) && (
              <button onClick={() => { setSearch(''); setSelectedUser('all'); setSelectedRole('all'); setSelectedCategory('all'); setSelectedSeverity('all'); setDateFrom(''); setDateTo(''); setPage(1); }} className="text-xs text-primary hover:underline">
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="card-elevated overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <span className="text-sm font-600 text-foreground">
              {filtered.length} event{filtered.length !== 1 ? 's' : ''} {filtered.length !== auditData.length ? `(filtered from ${auditData.length})` : ''}
            </span>
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:bg-muted">
              <Download size={12} />
              Export CSV
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              <RefreshCw size={20} className="animate-spin mx-auto mb-2" />
              Loading audit logs…
            </div>
          ) : paginated.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No events match your filters.</div>
          ) : (
            <div className="divide-y divide-border/50">
              {paginated.map((entry) => {
                const cat = categoryConfig[entry.category] || categoryConfig.data;
                const sev = severityConfig[entry.severity] || severityConfig.info;
                const isExpanded = expandedId === entry.id;
                return (
                  <div key={entry.id} className="hover:bg-muted/20 transition-colors">
                    <div
                      className="px-5 py-3 flex items-center gap-3 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    >
                      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        {actionIcons[entry.action] || <Eye size={14} className="text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-1 md:gap-3 items-center">
                        <div className="md:col-span-1">
                          <div className="text-xs font-600 text-foreground truncate">{entry.action}</div>
                          <div className="text-2xs text-muted-foreground truncate">{entry.resource}</div>
                        </div>
                        <div className="hidden md:flex items-center gap-2">
                          <User size={11} className="text-muted-foreground flex-shrink-0" />
                          <div>
                            <div className="text-xs text-foreground">{entry.user_name}</div>
                            <div className="text-2xs text-muted-foreground">{entry.user_role}</div>
                          </div>
                        </div>
                        <div className="hidden md:flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-500 ${cat.color}`}>
                            {cat.icon}{cat.label}
                          </span>
                          <span className="flex items-center gap-1 text-2xs text-muted-foreground">
                            <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                            {sev.label}
                          </span>
                        </div>
                        <div className="text-2xs text-muted-foreground text-right hidden md:block">
                          {formatTimestamp(entry.created_at)}
                        </div>
                      </div>
                      <ChevronRight size={13} className={`text-muted-foreground flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                    {isExpanded && (
                      <div className="px-5 pb-4 pt-1 bg-muted/20 border-t border-border/30">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div><span className="text-muted-foreground">User ID:</span><div className="font-mono text-foreground mt-0.5 truncate">{entry.user_id || '—'}</div></div>
                          <div><span className="text-muted-foreground">IP Address:</span><div className="font-mono text-foreground mt-0.5">{entry.ip_address || '—'}</div></div>
                          <div><span className="text-muted-foreground">Timestamp:</span><div className="text-foreground mt-0.5">{formatTimestamp(entry.created_at)}</div></div>
                          <div><span className="text-muted-foreground">Event ID:</span><div className="font-mono text-foreground mt-0.5 truncate">{entry.id}</div></div>
                        </div>
                        <div className="mt-3">
                          <span className="text-xs text-muted-foreground">Details:</span>
                          <p className="text-xs text-foreground mt-1 leading-relaxed">{entry.details}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <div className="px-5 py-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
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

        <p className="text-2xs text-muted-foreground text-center">
          Audit logs retained for 7 years per NHAI compliance policy · All times in IST
        </p>
      </main>
    </AppLayout>
  );
}
