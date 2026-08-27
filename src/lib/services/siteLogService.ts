'use client';

import { createClient } from '@/lib/supabase/client';

export interface SiteLog {
  id: string;
  userId: string;
  projectId: string | null;
  sector: string;
  activity: string;
  location: string;
  logDate: string;
  status: string;
  notes: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSiteLogInput {
  projectId?: string | null;
  sector: string;
  activity: string;
  location: string;
  logDate?: string;
  status?: string;
  notes?: string;
}

function toSiteLog(row: any): SiteLog {
  return {
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id ?? null,
    sector: row.sector,
    activity: row.activity,
    location: row.location,
    logDate: row.log_date,
    status: row.status,
    notes: row.notes,
    isDemo: row.is_demo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const siteLogService = {
  async getAll(): Promise<SiteLog[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('site_logs')
      .select('*')
      .or(`user_id.eq.${user.id},is_demo.eq.true`)
      .order('log_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(toSiteLog);
  },

  async getBySector(sector: string): Promise<SiteLog[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('site_logs')
      .select('*')
      .eq('sector', sector)
      .or(`user_id.eq.${user.id},is_demo.eq.true`)
      .order('log_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(toSiteLog);
  },

  async create(input: CreateSiteLogInput): Promise<SiteLog> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('site_logs')
      .insert({
        user_id: user.id,
        project_id: input.projectId ?? null,
        sector: input.sector,
        activity: input.activity,
        location: input.location,
        log_date: input.logDate ?? new Date().toISOString().split('T')[0],
        status: input.status ?? 'pending',
        notes: input.notes ?? '',
        is_demo: false,
      })
      .select()
      .single();

    if (error) throw error;
    return toSiteLog(data);
  },

  async update(id: string, updates: Partial<CreateSiteLogInput>): Promise<SiteLog> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const dbUpdates: any = {};
    if (updates.sector !== undefined) dbUpdates.sector = updates.sector;
    if (updates.activity !== undefined) dbUpdates.activity = updates.activity;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.logDate !== undefined) dbUpdates.log_date = updates.logDate;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('site_logs')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return toSiteLog(data);
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('site_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },
};
