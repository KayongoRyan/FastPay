-- Migration: Update work_projects table schema
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor)

-- Add new columns to work_projects table
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

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'work_projects' 
  AND table_schema = 'public'
ORDER BY ordinal_position;












