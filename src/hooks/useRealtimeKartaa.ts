'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

type TableName = 'dashboard_kpis' | 'project_alerts' | 'activity_grid_cells' | 'satellite_layers' | 'dpr_submissions';

interface RealtimeOptions {
  table: TableName;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  filter?: string;
}

/**
 * Subscribe to Supabase real-time changes for a given KARTAA table.
 * Automatically unsubscribes on unmount.
 */
export function useRealtimeKartaa({ table, onInsert, onUpdate, onDelete, filter }: RealtimeOptions) {
  const supabase = createClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const handleChange = useCallback(
    (payload: any) => {
      if (payload.eventType === 'INSERT' && onInsert) onInsert(payload.new);
      else if (payload.eventType === 'UPDATE' && onUpdate) onUpdate(payload.new);
      else if (payload.eventType === 'DELETE' && onDelete) onDelete(payload.old);
    },
    [onInsert, onUpdate, onDelete]
  );

  useEffect(() => {
    const channelName = `kartaa_${table}_${Date.now()}`;
    const channelConfig: any = {
      event: '*',
      schema: 'public',
      table,
    };
    if (filter) channelConfig.filter = filter;

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', channelConfig, handleChange)
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter]);

  return null;
}
