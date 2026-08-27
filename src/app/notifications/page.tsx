'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import { Bell, AlertTriangle, CheckCircle2, Clock, X, Settings, Info, Zap, ShieldCheck, TrendingDown, MapPin, Users, Calendar, ToggleLeft, ToggleRight, RefreshCw, BellOff, BellRing,  } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
type AlertCategory = 'verification' | 'schedule' | 'financial' | 'quality' | 'system';
type AlertStatus = 'unread' | 'read' | 'acknowledged' | 'dismissed';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  category: AlertCategory;
  status: AlertStatus;
  project: string;
  chainage?: string;
  timestamp: string;
  assignedTo?: string;
  actionRequired: boolean;
}

interface AlertRule {
  id: string;
  name: string;
  trigger: string;
  severity: AlertSeverity;
  category: AlertCategory;
  enabled: boolean;
  recipients: string[];
  lastTriggered: string;
  triggerCount: number;
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const alerts: Alert[] = [
  {
    id: 'alrt-001', title: 'Verification Overdue — DBM Layer', severity: 'critical', category: 'verification', status: 'unread',
    description: 'NH-19 Pkg 1: No verification activity recorded for DBM layer at 38+500–40+000 in 21 days. KARTAA score at risk of automatic downgrade.',
    project: 'NH-19 Pkg 1', chainage: '38+500–40+000', timestamp: '20 Aug 2026, 09:14', assignedTo: 'Rajesh Kumar', actionRequired: true,
  },
  {
    id: 'alrt-002', title: 'KARTAA Score Drop — NH-19 DBM', severity: 'critical', category: 'quality', status: 'unread',
    description: 'KARTAA score fell from 71 → 48 over 7 days. Evidence gap and GPS mismatch detected. Immediate site inspection required.',
    project: 'NH-19 Pkg 1', chainage: '40+000–42+500', timestamp: '20 Aug 2026, 08:47', assignedTo: 'Rajesh Kumar', actionRequired: true,
  },
  {
    id: 'alrt-003', title: 'BOQ Overrun Warning — WMM Layer', severity: 'high', category: 'financial', status: 'unread',
    description: 'WMM layer BOQ consumption at 94.2% with 18% of chainage remaining. Projected overrun: ₹ 12.4 Lakhs. Review quantity takeoff.',
    project: 'NH-48 Pkg 3', chainage: '55+000–67+500', timestamp: '19 Aug 2026, 16:30', assignedTo: 'Finance Controller', actionRequired: true,
  },
  {
    id: 'alrt-004', title: 'Schedule Lag — DBM Layer NH-48', severity: 'high', category: 'schedule', status: 'read',
    description: 'DBM layer progress is 8 days behind planned schedule. SPI = 0.88. Current rate insufficient to meet milestone by 15 Sep 2026.',
    project: 'NH-48 Pkg 3', chainage: '47+200–55+000', timestamp: '19 Aug 2026, 11:15', assignedTo: 'Rajesh Kumar', actionRequired: true,
  },
  {
    id: 'alrt-005', title: 'Density Test Pending — WMM', severity: 'medium', category: 'quality', status: 'read',
    description: 'Density test results for WMM layer at 52+000–54+500 not uploaded. Required before proceeding to DBM layer.',
    project: 'NH-48 Pkg 3', chainage: '52+000–54+500', timestamp: '18 Aug 2026, 14:22', assignedTo: 'Site Engineer', actionRequired: true,
  },
  {
    id: 'alrt-006', title: 'Evidence Gap — 14 Days', severity: 'medium', category: 'verification', status: 'acknowledged',
    description: 'No site photos uploaded for NH-19 Pkg 1 WMM layer in 14 days. Evidence continuity score will drop below threshold.',
    project: 'NH-19 Pkg 1', chainage: '32+000–35+500', timestamp: '17 Aug 2026, 09:00', assignedTo: 'Site Engineer', actionRequired: false,
  },
  {
    id: 'alrt-007', title: 'New Report Available', severity: 'info', category: 'system', status: 'read',
    description: 'Monthly Progress Report for Jul 2026 has been generated and shared with client portal users.',
    project: 'All Projects', timestamp: '15 Aug 2026, 10:00', actionRequired: false,
  },
  {
    id: 'alrt-008', title: 'Partial BOQ Match — Sub-base', severity: 'low', category: 'financial', status: 'acknowledged',
    description: 'BOQ match for Sub-base (GSB) at NH-19 Pkg 1 is 79%. Quantity variance of 4.2% detected. Review drawing takeoff.',
    project: 'NH-19 Pkg 1', chainage: '28+000–32+000', timestamp: '14 Aug 2026, 15:45', actionRequired: false,
  },
  {
    id: 'alrt-009', title: 'GPS Accuracy Below Threshold', severity: 'medium', category: 'verification', status: 'dismissed',
    description: 'GPS accuracy for 3 photo submissions at DL Exp. Pkg 2 is below 10m threshold. Re-submission required.',
    project: 'DL Exp. Pkg 2', chainage: '12+500–14+000', timestamp: '13 Aug 2026, 12:30', actionRequired: false,
  },
];

const alertRules: AlertRule[] = [
  { id: 'rule-001', name: 'Verification Overdue (>14 days)', trigger: 'No verification activity for 14+ days on any active layer', severity: 'critical', category: 'verification', enabled: true, recipients: ['PM', 'Site Engineer'], lastTriggered: '20 Aug 2026', triggerCount: 3 },
  { id: 'rule-002', name: 'KARTAA Score Drop (>10 pts)', trigger: 'KARTAA score drops by 10+ points in 7-day window', severity: 'critical', category: 'quality', enabled: true, recipients: ['PM', 'Client Portal'], lastTriggered: '20 Aug 2026', triggerCount: 1 },
  { id: 'rule-003', name: 'BOQ Overrun Warning (>90%)', trigger: 'BOQ item consumption exceeds 90% with >10% chainage remaining', severity: 'high', category: 'financial', enabled: true, recipients: ['PM', 'Finance Controller'], lastTriggered: '19 Aug 2026', triggerCount: 2 },
  { id: 'rule-004', name: 'Schedule Lag (SPI < 0.90)', trigger: 'Schedule Performance Index falls below 0.90', severity: 'high', category: 'schedule', enabled: true, recipients: ['PM', 'NHAI Client'], lastTriggered: '19 Aug 2026', triggerCount: 4 },
  { id: 'rule-005', name: 'Evidence Gap (>7 days)', trigger: 'No site photos uploaded for active layer in 7+ days', severity: 'medium', category: 'verification', enabled: true, recipients: ['Site Engineer', 'PM'], lastTriggered: '17 Aug 2026', triggerCount: 6 },
  { id: 'rule-006', name: 'GPS Accuracy Below 10m', trigger: 'Photo GPS accuracy exceeds 10m radius', severity: 'medium', category: 'verification', enabled: false, recipients: ['Site Engineer'], lastTriggered: '13 Aug 2026', triggerCount: 9 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const severityConfig: Record<AlertSeverity, { label: string; cls: string; dot: string; icon: React.ReactNode }> = {
  critical: { label: 'Critical', cls: 'text-danger bg-danger/10 border-danger/20', dot: 'bg-danger', icon: <AlertTriangle size={14} /> },
  high: { label: 'High', cls: 'text-orange-400 bg-orange-500/10 border-orange-500/20', dot: 'bg-orange-400', icon: <AlertTriangle size={14} /> },
  medium: { label: 'Medium', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400', icon: <Info size={14} /> },
  low: { label: 'Low', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20', dot: 'bg-blue-400', icon: <Info size={14} /> },
  info: { label: 'Info', cls: 'text-muted-foreground bg-muted border-border', dot: 'bg-muted-foreground', icon: <Bell size={14} /> },
};

const categoryConfig: Record<AlertCategory, { label: string; icon: React.ReactNode }> = {
  verification: { label: 'Verification', icon: <ShieldCheck size={12} /> },
  schedule: { label: 'Schedule', icon: <Calendar size={12} /> },
  financial: { label: 'Financial', icon: <TrendingDown size={12} /> },
  quality: { label: 'Quality', icon: <Zap size={12} /> },
  system: { label: 'System', icon: <Bell size={12} /> },
};

const statusConfig: Record<AlertStatus, { label: string; cls: string }> = {
  unread: { label: 'Unread', cls: 'text-foreground font-600' },
  read: { label: 'Read', cls: 'text-muted-foreground' },
  acknowledged: { label: 'Acknowledged', cls: 'text-emerald-400' },
  dismissed: { label: 'Dismissed', cls: 'text-muted-foreground/50' },
};

// ─── Alert Card ───────────────────────────────────────────────────────────────
function AlertCard({ alert, onAcknowledge, onDismiss }: {
  alert: Alert;
  onAcknowledge: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const sev = severityConfig[alert.severity];
  const cat = categoryConfig[alert.category];
  const isDismissed = alert.status === 'dismissed';

  return (
    <div className={`bg-card border rounded-xl p-4 transition-all ${isDismissed ? 'opacity-40 border-border' : 'border-border hover:border-primary/20'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${sev.cls}`}>
          {sev.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm ${statusConfig[alert.status].cls}`}>{alert.title}</span>
              {alert.status === 'unread' && (
                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className={`text-2xs font-500 px-2 py-0.5 rounded-full border ${sev.cls}`}>{sev.label}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{alert.description}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="flex items-center gap-1 text-2xs text-muted-foreground">
              <MapPin size={10} /> {alert.project}
            </span>
            {alert.chainage && (
              <span className="font-mono text-2xs text-muted-foreground">{alert.chainage}</span>
            )}
            <span className="flex items-center gap-1 text-2xs text-muted-foreground">
              {cat.icon} {cat.label}
            </span>
            <span className="text-2xs text-muted-foreground ml-auto">{alert.timestamp}</span>
          </div>
          {!isDismissed && (
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border">
              {alert.actionRequired && (
                <span className="text-2xs font-500 text-danger flex items-center gap-1">
                  <Zap size={10} /> Action Required
                </span>
              )}
              {alert.assignedTo && (
                <span className="text-2xs text-muted-foreground flex items-center gap-1 ml-auto">
                  <Users size={10} /> {alert.assignedTo}
                </span>
              )}
              <div className="flex items-center gap-1.5">
                {alert.status !== 'acknowledged' && (
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="flex items-center gap-1 text-2xs font-500 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                  >
                    <CheckCircle2 size={11} /> Acknowledge
                  </button>
                )}
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="flex items-center gap-1 text-2xs text-muted-foreground px-2.5 py-1 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <X size={11} /> Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [alertList, setAlertList] = useState<Alert[]>(alerts);
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<AlertCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'alerts' | 'rules'>('alerts');
  const [rules, setRules] = useState<AlertRule[]>(alertRules);

  const handleAcknowledge = (id: string) => {
    setAlertList((prev) => prev.map((a) => a.id === id ? { ...a, status: 'acknowledged' } : a));
  };

  const handleDismiss = (id: string) => {
    setAlertList((prev) => prev.map((a) => a.id === id ? { ...a, status: 'dismissed' } : a));
  };

  const handleAcknowledgeAll = () => {
    setAlertList((prev) => prev.map((a) => a.status === 'unread' || a.status === 'read' ? { ...a, status: 'acknowledged' } : a));
  };

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const filteredAlerts = alertList.filter((a) => {
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    return true;
  });

  const unreadCount = alertList.filter((a) => a.status === 'unread').length;
  const criticalCount = alertList.filter((a) => a.severity === 'critical' && a.status !== 'dismissed').length;
  const actionCount = alertList.filter((a) => a.actionRequired && a.status !== 'dismissed' && a.status !== 'acknowledged').length;

  return (
    <AppLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        <Topbar title="Notifications & Alerts" subtitle="System alerts, verification flags, and schedule warnings" />
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* KPI Strip */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Unread Alerts', value: unreadCount, sub: 'Requires attention', icon: <BellRing size={16} />, color: 'text-primary' },
              { label: 'Critical Alerts', value: criticalCount, sub: 'Immediate action', icon: <AlertTriangle size={16} />, color: 'text-danger' },
              { label: 'Action Required', value: actionCount, sub: 'Pending response', icon: <Zap size={16} />, color: 'text-amber-400' },
              { label: 'Active Rules', value: rules.filter((r) => r.enabled).length, sub: `of ${rules.length} total`, icon: <Settings size={16} />, color: 'text-emerald-400' },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg bg-muted flex items-center justify-center ${kpi.color}`}>
                  {kpi.icon}
                </div>
                <div>
                  <div className="text-2xl font-700 text-foreground">{kpi.value}</div>
                  <div className="text-xs font-500 text-foreground">{kpi.label}</div>
                  <div className="text-2xs text-muted-foreground">{kpi.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border">
            {(['alerts', 'rules'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-500 capitalize border-b-2 transition-colors -mb-px ${
                  activeTab === tab
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'alerts' ? `Alert Feed ${unreadCount > 0 ? `(${unreadCount} new)` : ''}` : 'Alert Rules & Config'}
              </button>
            ))}
          </div>

          {/* ── Alerts Tab ── */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              {/* Filters + Actions */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  {(['all', 'critical', 'high', 'medium', 'low', 'info'] as const).map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSeverityFilter(sev)}
                      className={`px-2.5 py-1.5 text-xs font-500 rounded-md capitalize transition-colors ${
                        severityFilter === sev
                          ? 'bg-card text-foreground shadow-sm border border-border'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {sev === 'all' ? 'All' : sev}
                    </button>
                  ))}
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as AlertCategory | 'all')}
                  className="text-xs bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="all">All Categories</option>
                  <option value="verification">Verification</option>
                  <option value="schedule">Schedule</option>
                  <option value="financial">Financial</option>
                  <option value="quality">Quality</option>
                  <option value="system">System</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as AlertStatus | 'all')}
                  className="text-xs bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="dismissed">Dismissed</option>
                </select>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={handleAcknowledgeAll}
                    className="flex items-center gap-1.5 text-xs font-500 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
                  >
                    <CheckCircle2 size={12} /> Acknowledge All
                  </button>
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">
                    <RefreshCw size={12} /> Refresh
                  </button>
                </div>
              </div>

              {/* Alert List */}
              <div className="space-y-3">
                {filteredAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <BellOff size={32} className="text-muted-foreground mb-3" />
                    <div className="text-sm font-500 text-foreground">No alerts match your filters</div>
                    <div className="text-xs text-muted-foreground mt-1">Try adjusting the severity or category filters</div>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onAcknowledge={handleAcknowledge}
                      onDismiss={handleDismiss}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── Rules Tab ── */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Configure which conditions trigger alerts and who gets notified.</div>
                <button className="flex items-center gap-1.5 text-xs font-500 text-primary px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                  + Add Rule
                </button>
              </div>
              <div className="space-y-3">
                {rules.map((rule) => {
                  const sev = severityConfig[rule.severity];
                  const cat = categoryConfig[rule.category];
                  return (
                    <div key={rule.id} className={`bg-card border rounded-xl p-4 transition-all ${rule.enabled ? 'border-border' : 'border-border opacity-60'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${sev.cls}`}>
                          {sev.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-600 text-foreground">{rule.name}</span>
                              <span className={`text-2xs font-500 px-2 py-0.5 rounded-full border ${sev.cls}`}>{sev.label}</span>
                              <span className="flex items-center gap-1 text-2xs text-muted-foreground">
                                {cat.icon} {cat.label}
                              </span>
                            </div>
                            <button
                              onClick={() => toggleRule(rule.id)}
                              className={`flex items-center gap-1.5 text-xs font-500 px-3 py-1.5 rounded-lg border transition-colors ${
                                rule.enabled
                                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20' :'text-muted-foreground bg-muted border-border hover:bg-muted/80'
                              }`}
                            >
                              {rule.enabled ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                              {rule.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{rule.trigger}</p>
                          <div className="flex items-center gap-4 mt-2 flex-wrap">
                            <span className="flex items-center gap-1 text-2xs text-muted-foreground">
                              <Users size={10} /> {rule.recipients.join(', ')}
                            </span>
                            <span className="flex items-center gap-1 text-2xs text-muted-foreground">
                              <Clock size={10} /> Last triggered: {rule.lastTriggered}
                            </span>
                            <span className="flex items-center gap-1 text-2xs text-muted-foreground">
                              <Bell size={10} /> {rule.triggerCount}× this month
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </AppLayout>
  );
}
