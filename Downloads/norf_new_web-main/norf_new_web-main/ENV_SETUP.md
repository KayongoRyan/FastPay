# Environment Variables Setup

Create a `.env.local` file in your project root with the following content:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key-here
```

## How to Create the File

### On Windows PowerShell:
```powershell
New-Item -Path .env.local -ItemType File
```

Then open it in your editor and add the values above.

### On Mac/Linux:
```bash
touch .env.local
```

Then open it in your editor and add the values above.

## Get Your Supabase Keys

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon public key** → Use for `VITE_SUPABASE_PUBLISHABLE_KEY`

## Important Notes

- Never commit `.env.local` to git (it's already in `.gitignore`)
- Restart your dev server after creating/updating `.env.local`
- All environment variables in Vite must start with `VITE_`












