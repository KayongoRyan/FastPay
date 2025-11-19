import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type TeamMember = Tables<'team_members'>;

export const useTeamMembers = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('team_members')
          .select('*')
          .order('display_order', { ascending: true });

        if (fetchError) throw fetchError;

        setMembers(data || []);
      } catch (err) {
        console.error('Error fetching team members:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch team members');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();

    // Subscribe to realtime changes for automatic updates
    const channel = supabase
      .channel('team_members_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_members'
        },
        async () => {
          // Refetch members when any change occurs (without showing loading state)
          try {
            const { data, error: fetchError } = await supabase
              .from('team_members')
              .select('*')
              .order('display_order', { ascending: true });

            if (fetchError) throw fetchError;

            setMembers(data || []);
          } catch (err) {
            console.error('Error refreshing team members:', err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const refreshMembers = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('team_members')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      setMembers(data || []);
    } catch (err) {
      console.error('Error refreshing team members:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh team members');
    } finally {
      setLoading(false);
    }
  };

  return { members, loading, error, refreshMembers };
};












