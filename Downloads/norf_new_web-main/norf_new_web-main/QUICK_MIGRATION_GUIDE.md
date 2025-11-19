# Quick Migration Guide - 3 Steps

## Step 1: Copy and Run the SQL

I've copied the migration SQL to your clipboard! Just follow these steps:

1. Go to your new Supabase project: https://supabase.com/dashboard
2. Click **"SQL Editor"** (left sidebar)
3. Click **"New Query"**
4. Press **Ctrl+V** to paste the SQL (it's already copied!)
5. Click **"Run"** or press **Ctrl+Enter**
6. Wait for "✅ Database setup complete!" message

## Step 2: Create Your Admin User

After running the SQL, you need to:

1. Go to **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Enter your email and password
4. Click **"Create user"**

Then go back to **SQL Editor** and run:

```sql
-- Replace 'your-email@example.com' with YOUR email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'your-email@example.com';
```

## Step 3: Add Environment Variables

Create `.env.local` file in your project root:

```bash
# Create the file
New-Item -Path .env.local -ItemType File
```

Then add these values from your Supabase project:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
```

To get these values:
- Go to **Settings** → **API**
- Copy **Project URL** → VITE_SUPABASE_URL
- Copy **anon public** key → VITE_SUPABASE_PUBLISHABLE_KEY

## Step 4: Test It!

```bash
npm run dev
```

Then:
- Visit `http://localhost:8080/auth`
- Log in with your admin credentials
- Go to `/admin` and start adding content!

## That's It! 🎉

Your database is now ready and you can:
- Add team members at `/admin`
- Add work projects at `/admin`
- All data will be dynamic from your Supabase database








