'use client';

import { createClient } from '@/lib/supabase/client';

export type ProjectStatus = 'active' | 'delayed' | 'on-hold' | 'draft' | 'completed' | 'archived';
export type ProjectType = 'Road' | 'Industrial' | 'Railway' | 'Building';

export interface Project {
  id: string;
  code: string;
  projectCode: string;
  name: string;
  projectType: ProjectType;
  location: string;
  client: string;
  contractor: string;
  consultant: string;
  contractValue: number | null;
  startDate: string | null;
  plannedCompletionDate: string | null;
  description: string;
  budget: string;
  progress: number;
  kartaaScore: number;
  spi: number;
  status: ProjectStatus;
  lastUpdated: string;
  organisation: string;
  isDemo: boolean;
  createdBy: string | null;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  projectCode: string;
  projectType: ProjectType;
  location: string;
  client: string;
  contractor: string;
  consultant: string;
  contractValue?: number | null;
  startDate?: string | null;
  plannedCompletionDate?: string | null;
  description?: string;
  status?: ProjectStatus;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  id: string;
}

function mapRow(row: any): Project {
  return {
    id: row.id,
    code: row.code,
    projectCode: row.project_code ?? row.code,
    name: row.name,
    projectType: row.project_type as ProjectType,
    location: row.location ?? '',
    client: row.client ?? '',
    contractor: row.contractor ?? '',
    consultant: row.consultant ?? '',
    contractValue: row.contract_value ?? null,
    startDate: row.start_date ?? null,
    plannedCompletionDate: row.planned_completion_date ?? null,
    description: row.description ?? '',
    budget: row.budget ?? '',
    progress: Number(row.progress ?? 0),
    kartaaScore: Number(row.kartaa_score ?? 0),
    spi: Number(row.spi ?? 0),
    status: row.status as ProjectStatus,
    lastUpdated: row.last_updated ?? '',
    organisation: row.organisation ?? '',
    isDemo: row.is_demo ?? false,
    createdBy: row.created_by ?? null,
    ownerId: row.owner_id ?? null,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

export const projectService = {
  async listProjects(filters?: {
    search?: string;
    projectType?: ProjectType | '';
    status?: ProjectStatus | '';
    includeArchived?: boolean;
  }): Promise<Project[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    // Exclude archived by default
    if (!filters?.includeArchived) {
      query = query.neq('status', 'archived');
    }

    if (filters?.projectType) {
      query = query.eq('project_type', filters.projectType);
    }

    if (filters?.status && filters.status !== 'archived') {
      query = query.eq('status', filters.status);
    } else if (filters?.status === 'archived') {
      query = query.eq('status', 'archived');
    }

    const { data, error } = await query;

    if (error) {
      console.error('listProjects error:', error.message);
      throw new Error(error.message);
    }

    let projects = (data ?? []).map(mapRow);

    // Client-side search filter
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.projectCode.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q)
      );
    }

    return projects;
  },

  async getProject(id: string): Promise<Project | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('getProject error:', error.message);
      throw new Error(error.message);
    }

    return data ? mapRow(data) : null;
  },

  async createProject(input: CreateProjectInput): Promise<Project> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get user profile for organisation
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('organisation, role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) throw new Error(profileError.message);
    if (!profile) throw new Error('User profile not found');

    if (!['admin', 'project_manager'].includes(profile.role)) {
      throw new Error('Insufficient permissions. Only Owner (admin) or Project Manager can create projects.');
    }

    const code = input.projectCode.toUpperCase().trim();

    const { data, error } = await supabase
      .from('projects')
      .insert({
        code,
        project_code: code,
        name: input.name.trim(),
        project_type: input.projectType,
        location: input.location?.trim() ?? '',
        client: input.client?.trim() ?? '',
        contractor: input.contractor?.trim() ?? '',
        consultant: input.consultant?.trim() ?? '',
        contract_value: input.contractValue ?? null,
        start_date: input.startDate ?? null,
        planned_completion_date: input.plannedCompletionDate ?? null,
        description: input.description?.trim() ?? '',
        status: input.status ?? 'draft',
        budget: input.contractValue ? `₹${Number(input.contractValue).toLocaleString('en-IN')}` : '',
        progress: 0,
        kartaa_score: 0,
        spi: 0,
        last_updated: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        organisation: profile.organisation,
        is_demo: false,
        created_by: user.id,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(`Project code "${code}" already exists. Please use a unique project code.`);
      }
      console.error('createProject error:', error.message);
      throw new Error(error.message);
    }

    return mapRow(data);
  },

  async updateProject(input: UpdateProjectInput): Promise<Project> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) throw new Error(profileError.message);
    if (!profile) throw new Error('User profile not found');

    if (!['admin', 'project_manager'].includes(profile.role)) {
      throw new Error('Insufficient permissions. Only Owner (admin) or Project Manager can edit projects.');
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
      last_updated: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    if (input.name !== undefined) updates.name = input.name.trim();
    if (input.projectCode !== undefined) {
      updates.code = input.projectCode.toUpperCase().trim();
      updates.project_code = input.projectCode.toUpperCase().trim();
    }
    if (input.projectType !== undefined) updates.project_type = input.projectType;
    if (input.location !== undefined) updates.location = input.location.trim();
    if (input.client !== undefined) updates.client = input.client.trim();
    if (input.contractor !== undefined) updates.contractor = input.contractor.trim();
    if (input.consultant !== undefined) updates.consultant = input.consultant.trim();
    if (input.contractValue !== undefined) {
      updates.contract_value = input.contractValue;
      updates.budget = input.contractValue ? `₹${Number(input.contractValue).toLocaleString('en-IN')}` : '';
    }
    if (input.startDate !== undefined) updates.start_date = input.startDate;
    if (input.plannedCompletionDate !== undefined) updates.planned_completion_date = input.plannedCompletionDate;
    if (input.description !== undefined) updates.description = input.description.trim();
    if (input.status !== undefined) updates.status = input.status;

    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', input.id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(`Project code already exists. Please use a unique project code.`);
      }
      console.error('updateProject error:', error.message);
      throw new Error(error.message);
    }

    return mapRow(data);
  },

  async archiveProject(id: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || !['admin', 'project_manager'].includes(profile.role)) {
      throw new Error('Insufficient permissions to archive projects.');
    }

    const { error } = await supabase
      .from('projects')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(error.message);
  },

  async restoreProject(id: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || !['admin', 'project_manager'].includes(profile.role)) {
      throw new Error('Insufficient permissions to restore projects.');
    }

    const { error } = await supabase
      .from('projects')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(error.message);
  },
};
