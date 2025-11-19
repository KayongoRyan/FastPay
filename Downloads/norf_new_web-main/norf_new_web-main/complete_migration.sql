-- ==========================================
-- COMPLETE DATABASE SETUP FOR NORF CRE8IONS
-- ==========================================
-- Run this entire file in your Supabase SQL Editor
-- ==========================================

-- ============================================
-- STEP 1: Create Enums
-- ============================================

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- ============================================
-- STEP 2: Create Tables
-- ============================================

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create work_projects table
CREATE TABLE IF NOT EXISTS public.work_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  year TEXT,
  thumbnail TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  credits JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  youtube_url TEXT,
  slug TEXT UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- STEP 3: Enable Row Level Security
-- ============================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_projects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Create Functions
-- ============================================

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================
-- STEP 5: Create Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_work_projects_slug ON public.work_projects(slug);

-- ============================================
-- STEP 6: Create RLS Policies
-- ============================================

-- User Roles Policies
DROP POLICY IF EXISTS "Anyone can view user roles" ON public.user_roles;
CREATE POLICY "Anyone can view user roles"
  ON public.user_roles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins can insert user roles" ON public.user_roles;
CREATE POLICY "Only admins can insert user roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Team Members Policies
DROP POLICY IF EXISTS "Anyone can view team members" ON public.team_members;
CREATE POLICY "Anyone can view team members"
  ON public.team_members FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins can insert team members" ON public.team_members;
CREATE POLICY "Only admins can insert team members"
  ON public.team_members FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can update team members" ON public.team_members;
CREATE POLICY "Only admins can update team members"
  ON public.team_members FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can delete team members" ON public.team_members;
CREATE POLICY "Only admins can delete team members"
  ON public.team_members FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Work Projects Policies
DROP POLICY IF EXISTS "Anyone can view work projects" ON public.work_projects;
CREATE POLICY "Anyone can view work projects"
  ON public.work_projects FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins can insert work projects" ON public.work_projects;
CREATE POLICY "Only admins can insert work projects"
  ON public.work_projects FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can update work projects" ON public.work_projects;
CREATE POLICY "Only admins can update work projects"
  ON public.work_projects FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can delete work projects" ON public.work_projects;
CREATE POLICY "Only admins can delete work projects"
  ON public.work_projects FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- STEP 7: Create Triggers
-- ============================================

DROP TRIGGER IF EXISTS set_updated_at_team_members ON public.team_members;
CREATE TRIGGER set_updated_at_team_members
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_work_projects ON public.work_projects;
CREATE TRIGGER set_updated_at_work_projects
  BEFORE UPDATE ON public.work_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- STEP 8: Verify Setup
-- ============================================

-- Verify tables were created
SELECT 
  'Tables Created' as status,
  table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_roles', 'team_members', 'work_projects')
ORDER BY table_name;

-- Verify columns in work_projects
SELECT 
  'work_projects columns' as info,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'work_projects' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================
-- SETUP COMPLETE!
-- ============================================

SELECT '✅ Database setup complete!' as message,
       'Next: Create admin user and add credentials to .env.local' as next_step;

