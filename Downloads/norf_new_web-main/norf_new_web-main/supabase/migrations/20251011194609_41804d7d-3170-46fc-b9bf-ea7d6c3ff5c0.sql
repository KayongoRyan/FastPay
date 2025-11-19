-- Create user_roles table (if not exists)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

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

-- Enable RLS on team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Only admins can insert team members" ON public.team_members;
DROP POLICY IF EXISTS "Only admins can update team members" ON public.team_members;
DROP POLICY IF EXISTS "Only admins can delete team members" ON public.team_members;

-- RLS policies for team_members
CREATE POLICY "Anyone can view team members"
  ON public.team_members FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert team members"
  ON public.team_members FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update team members"
  ON public.team_members FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete team members"
  ON public.team_members FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create work_projects table
CREATE TABLE IF NOT EXISTS public.work_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on work_projects
ALTER TABLE public.work_projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view work projects" ON public.work_projects;
DROP POLICY IF EXISTS "Only admins can insert work projects" ON public.work_projects;
DROP POLICY IF EXISTS "Only admins can update work projects" ON public.work_projects;
DROP POLICY IF EXISTS "Only admins can delete work projects" ON public.work_projects;

-- RLS policies for work_projects
CREATE POLICY "Anyone can view work projects"
  ON public.work_projects FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert work projects"
  ON public.work_projects FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update work projects"
  ON public.work_projects FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete work projects"
  ON public.work_projects FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

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

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS set_updated_at_team_members ON public.team_members;
DROP TRIGGER IF EXISTS set_updated_at_work_projects ON public.work_projects;

-- Add triggers for updated_at
CREATE TRIGGER set_updated_at_team_members
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_work_projects
  BEFORE UPDATE ON public.work_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();