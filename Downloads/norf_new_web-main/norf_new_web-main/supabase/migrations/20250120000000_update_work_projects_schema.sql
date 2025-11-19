-- Update work_projects table to include all project fields
ALTER TABLE public.work_projects 
  ADD COLUMN IF NOT EXISTS year TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail TEXT,
  ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('image', 'video')),
  ADD COLUMN IF NOT EXISTS credits JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS youtube_url TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_work_projects_slug ON public.work_projects(slug);

-- Rename image_url to be more specific (optional, keep for backward compatibility)
-- image_url will now serve as the main thumbnail


