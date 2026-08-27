'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import { User, Mail, Building2, Shield, LogOut, Edit3, Check, X, Clock, Activity, Key, Bell, AlertCircle, CheckCircle2, Loader2,  } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

const roleColors: Record<string, string> = {
  'admin': 'bg-warning/15 text-warning border-warning/25',
  'project_manager': 'bg-primary/15 text-primary border-primary/25',
  'site_engineer': 'bg-accent/15 text-accent border-accent/25',
  'client_consultant': 'bg-info/15 text-info border-info/25',
  'verification_officer': 'bg-success/15 text-success border-success/25',
};

const roleLabels: Record<string, string> = {
  'admin': 'Admin',
  'project_manager': 'Project Manager',
  'site_engineer': 'Site Engineer',
  'client_consultant': 'Client / Consultant',
  'verification_officer': 'Verification Officer',
};

const rolePermissions: Record<string, string[]> = {
  'admin': ['View Projects', 'Edit BOQ', 'Approve Entries', 'Export Reports', 'Manage Team', 'System Config'],
  'project_manager': ['View Projects', 'Edit BOQ', 'Approve Entries', 'Export Reports', 'Manage Team'],
  'site_engineer': ['View Projects', 'Submit Entries', 'Upload Photos'],
  'client_consultant': ['View Projects', 'View Reports'],
  'verification_officer': ['View Projects', 'Verify Entries', 'Export Reports'],
};

interface EditableField {
  phone: string;
  department: string;
}

interface AuditEntry {
  id: string;
  action: string;
  resource: string;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, signOut, updateProfile, loading } = useAuth();
  const supabase = createClient();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editFields, setEditFields] = useState<EditableField>({ phone: '', department: '' });
  const [savedFields, setSavedFields] = useState<EditableField>({ phone: '', department: '' });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [recentActivity, setRecentActivity] = useState<AuditEntry[]>([]);
  const [sessionStart] = useState(() => new Date());

  useEffect(() => {
    if (profile) {
      const fields = { phone: profile.phone || '', department: profile.department || '' };
      setEditFields(fields);
      setSavedFields(fields);
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    const fetchActivity = async () => {
      try {
        const { data } = await supabase
          .from('audit_log')
          .select('id, action, resource, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        if (data) setRecentActivity(data);
      } catch { /* non-critical */ }
    };
    fetchActivity();
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ phone: editFields.phone, department: editFields.department });
      setSavedFields({ ...editFields });
      setIsEditing(false);
      toast.success('Profile updated', { description: 'Your changes have been saved.' });
    } catch (err: any) {
      toast.error('Update failed', { description: err?.message || 'Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditFields({ ...savedFields });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (err: any) {
      toast.error('Sign out failed', { description: err?.message });
      setIsLoggingOut(false);
    }
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const role = profile?.role || user?.user_metadata?.role || 'site_engineer';
  const roleLabel = roleLabels[role] || role;
  const permissions = rolePermissions[role] || [];

  const sessionDuration = () => {
    const diff = Date.now() - sessionStart.getTime();
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const activityIcons: Record<string, React.ReactNode> = {
    'User Login': <Key size={13} className="text-muted-foreground" />,
    'User Logout': <LogOut size={13} className="text-muted-foreground" />,
    'Layer Verified': <CheckCircle2 size={13} className="text-accent" />,
    'Report Exported': <Activity size={13} className="text-primary" />,
    'BOQ Item Edited': <Edit3 size={13} className="text-warning" />,
    'Verification Rejected': <AlertCircle size={13} className="text-danger" />,
  };

  if (loading) {
    return (
      <AppLayout currentPath="/profile">
        <Topbar title="My Profile" subtitle="Account details, role, and session management" />
        <div className="flex items-center justify-center h-64">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout currentPath="/profile">
      <Topbar title="My Profile" subtitle="Account details, role, and session management" />

      <div className="p-6 space-y-6 max-w-5xl mx-auto">

        {/* ── Profile Hero Card ─────────────────────────────────────────────── */}
        <div className="card-elevated p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
                  <span className="text-2xl font-700 text-primary">{initials}</span>
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-accent border-2 border-card" title="Online" />
              </div>
              <div>
                <h2 className="text-xl font-700 text-foreground">{displayName}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-600 ${roleColors[role] ?? 'bg-muted text-muted-foreground border-border'}`}>
                    <Shield size={11} />
                    {roleLabel}
                  </span>
                  <span className="text-xs text-muted-foreground">{profile?.organisation || 'NHAI — Delhi Region'}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                  <Clock size={11} />
                  <span>Session started: {sessionStart.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button onClick={handleCancelEdit} className="btn-ghost text-sm px-3 py-2 flex items-center gap-1.5">
                    <X size={14} />Cancel
                  </button>
                  <button onClick={handleSaveProfile} disabled={isSaving} className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5">
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Save Changes
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="btn-secondary text-sm px-4 py-2 flex items-center gap-1.5">
                  <Edit3 size={14} />Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* User Information */}
            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 mb-5">
                <User size={15} className="text-primary" />
                <h3 className="text-sm font-600 text-foreground">User Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Full Name</label>
                  <div className="form-input bg-muted/40 text-muted-foreground cursor-not-allowed select-none">{displayName}</div>
                </div>
                <div>
                  <label className="form-label">Employee ID</label>
                  <div className="form-input bg-muted/40 text-muted-foreground cursor-not-allowed select-none font-mono text-xs">
                    {profile?.employee_id || '—'}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Work Email</label>
                  <div className="form-input bg-muted/40 text-muted-foreground cursor-not-allowed select-none flex items-center gap-2">
                    <Mail size={13} />
                    {user?.email || '—'}
                  </div>
                </div>
                <div>
                  <label className="form-label">Phone {isEditing && <span className="text-primary ml-1">(editable)</span>}</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editFields.phone}
                      onChange={(e) => setEditFields(f => ({ ...f, phone: e.target.value }))}
                      className="form-input"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  ) : (
                    <div className="form-input bg-muted/40 text-muted-foreground cursor-not-allowed select-none">
                      {savedFields.phone || '—'}
                    </div>
                  )}
                </div>
                <div>
                  <label className="form-label">Department {isEditing && <span className="text-primary ml-1">(editable)</span>}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFields.department}
                      onChange={(e) => setEditFields(f => ({ ...f, department: e.target.value }))}
                      className="form-input"
                      placeholder="e.g. Project Management Unit"
                    />
                  ) : (
                    <div className="form-input bg-muted/40 text-muted-foreground cursor-not-allowed select-none">
                      {savedFields.department || '—'}
                    </div>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Organisation</label>
                  <div className="form-input bg-muted/40 text-muted-foreground cursor-not-allowed select-none flex items-center gap-2">
                    <Building2 size={13} />
                    {profile?.organisation || 'NHAI — Delhi Region'}
                  </div>
                </div>
              </div>
            </div>

            {/* Role & Permissions */}
            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={15} className="text-primary" />
                <h3 className="text-sm font-600 text-foreground">Role & Permissions</h3>
              </div>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${roleColors[role] ?? 'bg-muted border-border'} mb-4`}>
                <Shield size={18} />
                <div>
                  <div className="text-sm font-700">{roleLabel}</div>
                  <div className="text-xs opacity-70 mt-0.5">Your access level in KARTAA OS</div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {permissions.map((perm) => (
                  <div key={perm} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
                    <CheckCircle2 size={12} className="text-accent flex-shrink-0" />
                    <span className="text-xs text-foreground">{perm}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Activity */}
            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={15} className="text-primary" />
                <h3 className="text-sm font-600 text-foreground">Recent Activity</h3>
              </div>
              {recentActivity.length === 0 ? (
                <p className="text-xs text-muted-foreground">No recent activity found.</p>
              ) : (
                <div className="space-y-2">
                  {recentActivity.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/30 border border-border/50">
                      <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        {activityIcons[entry.action] || <Activity size={13} className="text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-500 text-foreground">{entry.action}</div>
                        <div className="text-2xs text-muted-foreground truncate">{entry.resource}</div>
                      </div>
                      <span className="text-2xs text-muted-foreground flex-shrink-0">
                        {new Date(entry.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right column ─────────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Session State */}
            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={15} className="text-primary" />
                <h3 className="text-sm font-600 text-foreground">Session State</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <span className="flex items-center gap-1.5 text-xs text-accent font-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Duration</span>
                  <span className="text-xs font-600 text-foreground">{sessionDuration()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Email verified</span>
                  <span className="text-xs font-600 text-accent">
                    {user?.email_confirmed_at ? 'Yes' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Provider</span>
                  <span className="text-xs font-600 text-foreground capitalize">
                    {user?.app_metadata?.provider || 'email'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bell size={15} className="text-primary" />
                <h3 className="text-sm font-600 text-foreground">Notifications</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Critical Alerts', defaultOn: true },
                  { label: 'Progress Updates', defaultOn: true },
                  { label: 'Report Delivery', defaultOn: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-foreground">{item.label}</span>
                    <button className={`relative w-8 h-4 rounded-full transition-colors ${item.defaultOn ? 'bg-primary' : 'bg-muted'}`}>
                      <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${item.defaultOn ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Logout */}
            <div className="card-elevated p-5">
              <h3 className="text-sm font-600 text-foreground mb-3">Sign Out</h3>
              {!showLogoutConfirm ? (
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-danger/30 bg-danger/8 text-danger text-sm font-500 hover:bg-danger/15 transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">Are you sure you want to sign out?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      className="flex-1 btn-ghost text-sm py-2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-danger text-white text-sm font-500 hover:bg-danger/90 transition-colors disabled:opacity-60"
                    >
                      {isLoggingOut ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
