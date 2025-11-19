# Setup New Supabase Database

Follow these steps to switch to a new Supabase project.

## Step 1: Create a New Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: Your project name (e.g., "Norf Cre8ions")
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to initialize

## Step 2: Get Your API Keys

1. In your new project, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with: `eyJhbGci...`)

## Step 3: Create Environment File

Create a `.env.local` file in your project root:

```bash
# In your project root
touch .env.local
```

Or on Windows PowerShell:
```powershell
New-Item -Path .env.local -ItemType File
```

Then add your keys:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key-here
```

## Step 4: Set Up Database Schema

You need to run **all migrations** in your new Supabase project in order:

### Migration 1: Create app_role enum and tables
Run this SQL in the Supabase SQL Editor:

```sql
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
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
CREATE TABLE public.team_members (
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

-- Create work_projects table
CREATE TABLE public.work_projects (
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
```

### Migration 2: Add RLS Policies

```sql
-- RLS policies for user_roles
CREATE POLICY "Anyone can view user roles"
  ON public.user_roles FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert user roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

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
```

### Migration 3: Add triggers and updated fields

```sql
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

-- Add triggers for updated_at
CREATE TRIGGER set_updated_at_team_members
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_work_projects
  BEFORE UPDATE ON public.work_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add new columns to work_projects
ALTER TABLE public.work_projects 
  ADD COLUMN IF NOT EXISTS year TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail TEXT,
  ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('image', 'video')),
  ADD COLUMN IF NOT EXISTS credits JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS youtube_url TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index on slug
CREATE INDEX IF NOT EXISTS idx_work_projects_slug ON public.work_projects(slug);
```

## Step 5: Create Your First Admin User

1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Enter email and password
4. Click **"Create user"**

Then in SQL Editor, run:

```sql
-- Replace 'your-user-email@example.com' with your actual email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'your-user-email@example.com';
```

## Step 6: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/auth` and log in with your admin credentials

3. Try accessing `/admin` - you should be able to:
   - Add team members
   - Add work projects

## Migration Checklist

- [ ] Created new Supabase project
- [ ] Copied API keys to `.env.local`
- [ ] Ran Migration 1 (create tables)
- [ ] Ran Migration 2 (RLS policies)
- [ ] Ran Migration 3 (triggers & new fields)
- [ ] Created admin user
- [ ] Tested login and admin access

## Troubleshooting

**"No user role" error:**
- Make sure you added your user to the `user_roles` table with 'admin' role

**"Permission denied" errors:**
- Check that RLS policies are enabled on all tables
- Verify your user has admin role in `user_roles` table

**Environment variables not loading:**
- Make sure `.env.local` is in the project root
- Restart your dev server after changing `.env.local`
- Check that variables start with `VITE_`

## Next Steps

After setup is complete:
1. Add your team members via `/admin`
2. Add work projects with full details
3. Deploy to production (Vercel, Netlify, etc.)
4. Remember to add production environment variables in your hosting platform!












