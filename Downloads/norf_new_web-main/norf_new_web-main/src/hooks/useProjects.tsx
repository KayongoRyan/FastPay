import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Project = Omit<Tables<'work_projects'>, 'credits' | 'images'> & {
  credits: { label: string; value: string }[];
  images: string[];
  // Backward/forward compatibility while schema/types migrate
  video_url?: string | null;
};

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('work_projects')
          .select('*')
          .order('display_order', { ascending: true });

        if (fetchError) throw fetchError;

        // Transform the data to match our Project type
        const transformedProjects = (data || []).map((project) => {
          const credits = project.credits ? (typeof project.credits === 'string' ? JSON.parse(project.credits) : project.credits) : [];
          const images = project.images ? (typeof project.images === 'string' ? JSON.parse(project.images) : project.images) : [];
          const video_url = (project as any).video_url ?? (project as any).youtube_url ?? null;

          // If thumbnail is a YouTube link, derive a high-res thumbnail
          let thumbnail = (project as any).thumbnail as string | null;
          try {
            if (thumbnail) {
              const u = new URL(thumbnail);
              if (u.hostname.includes('youtu.be')) {
                const id = u.pathname.replace('/', '');
                thumbnail = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
              } else if (u.hostname.includes('youtube.com')) {
                const id = u.searchParams.get('v');
                if (id) thumbnail = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
              }
            }
          } catch {}

          return {
            ...(project as any),
            credits,
            images,
            thumbnail,
            video_url,
          } as Project;
        });

        // TEMP DEBUG: Log what we got back
        try {
          // eslint-disable-next-line no-console
          console.log('[useProjects] fetched rows:', data ? data.length : 0);
          if (data && data.length > 0) {
            // eslint-disable-next-line no-console
            console.log('[useProjects] first row keys:', Object.keys(data[0] as Record<string, unknown>));
            // eslint-disable-next-line no-console
            console.log('[useProjects] first row sample:', {
              id: (data[0] as any).id,
              title: (data[0] as any).title,
              categories: (data[0] as any).categories,
              thumbnail: (data[0] as any).thumbnail,
            });
          }
        } catch {}

        setProjects(transformedProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const refreshProjects = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('work_projects')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      const transformedProjects = (data || []).map((project) => {
        const credits = project.credits ? (typeof project.credits === 'string' ? JSON.parse(project.credits) : project.credits) : [];
        const images = project.images ? (typeof project.images === 'string' ? JSON.parse(project.images) : project.images) : [];
        const video_url = (project as any).video_url ?? (project as any).youtube_url ?? null;
        let thumbnail = (project as any).thumbnail as string | null;
        try {
          if (thumbnail) {
            const u = new URL(thumbnail);
            if (u.hostname.includes('youtu.be')) {
              const id = u.pathname.replace('/', '');
              thumbnail = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
            } else if (u.hostname.includes('youtube.com')) {
              const id = u.searchParams.get('v');
              if (id) thumbnail = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
            }
          }
        } catch {}

        return {
          ...(project as any),
          credits,
          images,
          thumbnail,
          video_url,
        } as Project;
      });

      setProjects(transformedProjects);
    } catch (err) {
      console.error('Error refreshing projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh projects');
    } finally {
      setLoading(false);
    }
  };

  return { projects, loading, error, refreshProjects };
};


