'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Trash2,
  UserCheck,
  Eye,
  Lock,
  Users,
  Mail,
  ChevronDown,
  Save,
  AlertCircle,
  CheckCircle2,
  X,
  Pencil,
  Shield,
  UserCog,
} from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = 'Project Manager' | 'Site Engineer' | 'Client Representative' | 'Supervision Consultant' | 'Viewer';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  chainageFrom?: string;
  chainageTo?: string;
  isReadOnly: boolean;
  status: 'active' | 'pending' | 'inactive';
  addedOn: string;
}

interface RoleConfig {
  label: Role;
  description: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
  canEdit: boolean;
}

// ─── Role config ──────────────────────────────────────────────────────────────
const roleConfigs: RoleConfig[] = [
  {
    label: 'Project Manager',
    description: 'Full access — manage all project data, BOQ, progress entries, and team',
    color: 'text-primary',
    bg: 'bg-primary/10',
    icon: <UserCheck size={14} />,
    canEdit: true,
  },
  {
    label: 'Site Engineer',
    description: 'Submit progress entries, upload photos, log field activity within assigned chainage',
    color: 'text-accent',
    bg: 'bg-accent/10',
    icon: <UserCog size={14} />,
    canEdit: true,
  },
  {
    label: 'Client Representative',
    description: 'Read-only — view dashboards, progress charts, BOQ summary, verification status',
    color: 'text-info',
    bg: 'bg-info/10',
    icon: <Eye size={14} />,
    canEdit: false,
  },
  {
    label: 'Supervision Consultant',
    description: 'Read-only — view all project data and reports, cannot submit or edit',
    color: 'text-warning',
    bg: 'bg-warning/10',
    icon: <Shield size={14} />,
    canEdit: false,
  },
  {
    label: 'Viewer',
    description: 'Read-only access to project dashboard and summary reports only',
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    icon: <Eye size={14} />,
    canEdit: false,
  },
];

// ─── Demo seed data ───────────────────────────────────────────────────────────
const initialMembers: TeamMember[] = [
  {
    id: 'tm-001',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@nhai.gov.in',
    role: 'Project Manager',
    isReadOnly: false,
    status: 'active',
    addedOn: '12 Mar 2024',
  },
  {
    id: 'tm-002',
    name: 'Suresh Pillai',
    email: 'suresh.pillai@contractor.in',
    role: 'Site Engineer',
    chainageFrom: '42+000',
    chainageTo: '55+000',
    isReadOnly: false,
    status: 'active',
    addedOn: '14 Mar 2024',
  },
  {
    id: 'tm-003',
    name: 'Anita Sharma',
    email: 'anita.sharma@contractor.in',
    role: 'Site Engineer',
    chainageFrom: '55+000',
    chainageTo: '67+500',
    isReadOnly: false,
    status: 'active',
    addedOn: '14 Mar 2024',
  },
  {
    id: 'tm-004',
    name: 'Priya Mehta',
    email: 'priya.mehta@nhai.gov.in',
    role: 'Client Representative',
    isReadOnly: true,
    status: 'active',
    addedOn: '20 Mar 2024',
  },
  {
    id: 'tm-005',
    name: 'Arjun Reddy',
    email: 'arjun.reddy@consultant.in',
    role: 'Supervision Consultant',
    isReadOnly: true,
    status: 'pending',
    addedOn: '22 Mar 2024',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: Role }) {
  const cfg = roleConfigs.find((r) => r.label === role);
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-2xs font-600 px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
      {cfg.icon}
      {role}
    </span>
  );
}

function StatusDot({ status }: { status: TeamMember['status'] }) {
  const map = {
    active: 'bg-accent',
    pending: 'bg-warning',
    inactive: 'bg-muted-foreground/40',
  };
  const label = { active: 'Active', pending: 'Invite Pending', inactive: 'Inactive' };
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${map[status]}`} />
      {label[status]}
    </span>
  );
}

interface EditMemberModalProps {
  member: TeamMember;
  onSave: (updated: TeamMember) => void;
  onClose: () => void;
}

function EditMemberModal({ member, onSave, onClose }: EditMemberModalProps) {
  const [form, setForm] = useState<TeamMember>({ ...member });
  const [error, setError] = useState('');

  const selectedRoleCfg = roleConfigs.find((r) => r.label === form.role);

  function handleSave() {
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Enter a valid email address');
      return;
    }
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <UserCog size={15} className="text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-600 text-foreground">Edit Team Member</h2>
              <p className="text-2xs text-muted-foreground">Update role or assignment details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X size={15} className="text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-xs text-danger px-3 py-2 rounded-lg bg-danger/8 border border-danger/20">
              <AlertCircle size={13} /> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Full Name <span className="text-danger">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="form-input mt-1"
                placeholder="e.g. Rajesh Kumar"
              />
            </div>
            <div>
              <label className="form-label">Work Email <span className="text-danger">*</span></label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="form-input mt-1"
                placeholder="name@organisation.in"
              />
            </div>
          </div>

          {/* Role selector */}
          <div>
            <label className="form-label">Role</label>
            <div className="relative mt-1">
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role, isReadOnly: !roleConfigs.find(r => r.label === e.target.value)?.canEdit }))}
                className="form-input appearance-none pr-8 cursor-pointer"
              >
                {roleConfigs.map((r) => (
                  <option key={r.label} value={r.label}>{r.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            {selectedRoleCfg && (
              <p className="text-2xs text-muted-foreground mt-1.5 flex items-center gap-1">
                {selectedRoleCfg.canEdit ? null : <Lock size={10} />}
                {selectedRoleCfg.description}
              </p>
            )}
          </div>

          {/* Chainage — only for Site Engineers */}
          {form.role === 'Site Engineer' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Assigned Chainage From</label>
                <p className="form-helper">Leave blank for full project access</p>
                <input
                  type="text"
                  value={form.chainageFrom ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, chainageFrom: e.target.value }))}
                  placeholder="0+000"
                  className="form-input text-sm chainage-mono mt-1"
                />
              </div>
              <div>
                <label className="form-label">Assigned Chainage To</label>
                <p className="form-helper">Activity outside range will be flagged</p>
                <input
                  type="text"
                  value={form.chainageTo ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, chainageTo: e.target.value }))}
                  placeholder="25+500"
                  className="form-input text-sm chainage-mono mt-1"
                />
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="form-label">Status</label>
            <div className="relative mt-1">
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TeamMember['status'] }))}
                className="form-input appearance-none pr-8 cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="pending">Invite Pending</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="btn-secondary py-2 px-4 text-sm">Cancel</button>
          <button onClick={handleSave} className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5">
            <Save size={13} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

interface AddMemberModalProps {
  onAdd: (member: TeamMember) => void;
  onClose: () => void;
}

function AddMemberModal({ onAdd, onClose }: AddMemberModalProps) {
  const [form, setForm] = useState<Omit<TeamMember, 'id' | 'addedOn'>>({
    name: '',
    email: '',
    role: 'Site Engineer',
    chainageFrom: '',
    chainageTo: '',
    isReadOnly: false,
    status: 'pending',
  });
  const [error, setError] = useState('');

  const selectedRoleCfg = roleConfigs.find((r) => r.label === form.role);

  function handleAdd() {
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Enter a valid email address');
      return;
    }
    onAdd({
      ...form,
      id: `tm-${Date.now()}`,
      addedOn: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Plus size={15} className="text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-600 text-foreground">Add Team Member</h2>
              <p className="text-2xs text-muted-foreground">Invite a new member to this project</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X size={15} className="text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-xs text-danger px-3 py-2 rounded-lg bg-danger/8 border border-danger/20">
              <AlertCircle size={13} /> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Full Name <span className="text-danger">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="form-input mt-1"
                placeholder="e.g. Suresh Pillai"
              />
            </div>
            <div>
              <label className="form-label">Work Email <span className="text-danger">*</span></label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="form-input mt-1"
                placeholder="name@organisation.in"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Role</label>
            <div className="relative mt-1">
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role, isReadOnly: !roleConfigs.find(r => r.label === e.target.value)?.canEdit }))}
                className="form-input appearance-none pr-8 cursor-pointer"
              >
                {roleConfigs.map((r) => (
                  <option key={r.label} value={r.label}>{r.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            {selectedRoleCfg && (
              <p className="text-2xs text-muted-foreground mt-1.5 flex items-center gap-1">
                {selectedRoleCfg.canEdit ? null : <Lock size={10} />}
                {selectedRoleCfg.description}
              </p>
            )}
          </div>

          {form.role === 'Site Engineer' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Assigned Chainage From</label>
                <p className="form-helper">Leave blank for full project access</p>
                <input
                  type="text"
                  value={form.chainageFrom ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, chainageFrom: e.target.value }))}
                  placeholder="0+000"
                  className="form-input text-sm chainage-mono mt-1"
                />
              </div>
              <div>
                <label className="form-label">Assigned Chainage To</label>
                <p className="form-helper">Activity outside range will be flagged</p>
                <input
                  type="text"
                  value={form.chainageTo ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, chainageTo: e.target.value }))}
                  placeholder="25+500"
                  className="form-input text-sm chainage-mono mt-1"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="btn-secondary py-2 px-4 text-sm">Cancel</button>
          <button onClick={handleAdd} className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5">
            <Plus size={13} /> Add Member
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProjectTeamPage() {
  const { selectedProject } = useProject();
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  function handleSaveEdit(updated: TeamMember) {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setSavedIds((prev) => [...prev, updated.id]);
    setTimeout(() => setSavedIds((prev) => prev.filter((id) => id !== updated.id)), 2500);
    setEditingMember(null);
  }

  function handleAdd(member: TeamMember) {
    setMembers((prev) => [...prev, member]);
    setShowAddModal(false);
  }

  function handleRemove(id: string) {
    setRemovingId(id);
  }

  function confirmRemove() {
    if (removingId) {
      setMembers((prev) => prev.filter((m) => m.id !== removingId));
      setRemovingId(null);
    }
  }

  const roleGroups: Role[] = ['Project Manager', 'Site Engineer', 'Client Representative', 'Supervision Consultant', 'Viewer'];

  return (
    <AppLayout currentPath="/project-team">
      <Topbar
        title="Team Management"
        subtitle={`${selectedProject.name} · Manage roles and access`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/project-detail" className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
              <ArrowLeft size={13} /> Project Detail
            </Link>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5"
            >
              <Plus size={13} /> Add Member
            </button>
          </div>
        }
      />

      <div className="px-6 xl:px-8 py-6 max-w-screen-xl mx-auto space-y-6">

        {/* Summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Members', value: members.length, color: 'text-foreground', bg: 'bg-muted' },
            { label: 'Active', value: members.filter((m) => m.status === 'active').length, color: 'text-accent', bg: 'bg-accent/10' },
            { label: 'Invite Pending', value: members.filter((m) => m.status === 'pending').length, color: 'text-warning', bg: 'bg-warning/10' },
            { label: 'Roles Assigned', value: new Set(members.map((m) => m.role)).size, color: 'text-primary', bg: 'bg-primary/10' },
          ].map((s) => (
            <div key={s.label} className="card-elevated p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                <Users size={18} className={s.color} />
              </div>
              <div>
                <div className={`text-2xl font-700 font-tabular ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Role legend */}
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} className="text-muted-foreground" />
            <h3 className="text-xs font-600 text-foreground uppercase tracking-wider">Role Permissions</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {roleConfigs.map((r) => (
              <div key={r.label} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/40">
                <span className={`mt-0.5 flex-shrink-0 ${r.color}`}>{r.icon}</span>
                <div>
                  <div className={`text-xs font-600 ${r.color}`}>{r.label}</div>
                  <div className="text-2xs text-muted-foreground leading-relaxed">{r.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Members table */}
        <div className="card-elevated overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h3 className="text-sm font-600 text-foreground">Project Team</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{members.length} members · Click edit to change role or assignment</p>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {['Member', 'Role', 'Chainage / Zone', 'Status', 'Added', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-500 uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-700 text-primary">
                            {m.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-500 text-foreground flex items-center gap-1.5">
                            {m.name}
                            {savedIds.includes(m.id) && (
                              <span className="flex items-center gap-0.5 text-2xs text-accent">
                                <CheckCircle2 size={11} /> Saved
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-2xs text-muted-foreground">
                            <Mail size={10} />
                            {m.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={m.role} />
                      {m.isReadOnly && (
                        <div className="flex items-center gap-1 text-2xs text-muted-foreground mt-1">
                          <Lock size={9} /> Read-only
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs chainage-mono text-muted-foreground">
                      {m.chainageFrom && m.chainageTo
                        ? `${m.chainageFrom} – ${m.chainageTo}`
                        : m.chainageFrom
                        ? `From ${m.chainageFrom}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusDot status={m.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{m.addedOn}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingMember(m)}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                          title="Edit member"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleRemove(m.id)}
                          className="p-1.5 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors"
                          title="Remove member"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden divide-y divide-border/50">
            {members.map((m) => (
              <div key={m.id} className="px-4 py-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-700 text-primary">
                        {m.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-500 text-foreground truncate">{m.name}</div>
                      <div className="text-2xs text-muted-foreground truncate">{m.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setEditingMember(m)}
                      className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleRemove(m.id)}
                      className="p-2 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <RoleBadge role={m.role} />
                  <StatusDot status={m.status} />
                  {m.chainageFrom && m.chainageTo && (
                    <span className="text-2xs chainage-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {m.chainageFrom} – {m.chainageTo}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {members.length === 0 && (
            <div className="py-16 text-center">
              <Users size={32} className="mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No team members yet</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary mt-4 py-2 px-4 text-sm inline-flex items-center gap-1.5"
              >
                <Plus size={13} /> Add First Member
              </button>
            </div>
          )}
        </div>

        {/* Role breakdown by group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roleGroups.map((role) => {
            const group = members.filter((m) => m.role === role);
            if (group.length === 0) return null;
            const cfg = roleConfigs.find((r) => r.label === role)!;
            return (
              <div key={role} className="card-elevated p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex items-center gap-1.5 text-xs font-600 ${cfg.color}`}>
                    {cfg.icon}
                    {role}
                  </div>
                  <span className={`text-2xs font-600 px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                    {group.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {group.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-xs">
                      <span className="text-foreground font-500 truncate">{m.name}</span>
                      <StatusDot status={m.status} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit modal */}
      {editingMember && (
        <EditMemberModal
          member={editingMember}
          onSave={handleSaveEdit}
          onClose={() => setEditingMember(null)}
        />
      )}

      {/* Add modal */}
      {showAddModal && (
        <AddMemberModal
          onAdd={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Remove confirmation */}
      {removingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center flex-shrink-0">
                <Trash2 size={18} className="text-danger" />
              </div>
              <div>
                <h3 className="text-sm font-600 text-foreground">Remove Member</h3>
                <p className="text-xs text-muted-foreground">
                  {members.find((m) => m.id === removingId)?.name} will lose access to this project.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setRemovingId(null)} className="btn-secondary py-2 px-4 text-sm">Cancel</button>
              <button onClick={confirmRemove} className="py-2 px-4 text-sm font-600 rounded-xl bg-danger text-white hover:bg-danger/90 transition-colors flex items-center gap-1.5">
                <Trash2 size={13} /> Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
