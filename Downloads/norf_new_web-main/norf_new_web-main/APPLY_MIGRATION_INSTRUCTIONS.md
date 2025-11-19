# How to Apply the Migration

## Option 1: Via Supabase Dashboard (EASIEST - Recommended)

1. **Open your Supabase Project Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Run the Migration**
   - Click "New Query" or open an existing query
   - Copy the contents of `apply_migration.sql`
   - Paste into the SQL editor
   - Click "Run" or press Ctrl+Enter

4. **Verify Success**
   - The query will run and show you the updated schema
   - You should see the new columns listed in the output

## Option 2: Via Supabase CLI (Advanced)

If you prefer using the CLI, you'll need to:

1. **Login to Supabase CLI**
   ```bash
   npx supabase login
   ```

2. **Link your project** (if not already linked)
   ```bash
   npx supabase link --project-ref uckavxqjivohibqyzbzl
   ```

3. **Push the migration**
   ```bash
   npx supabase db push
   ```

## What This Migration Does

This migration adds the following columns to the `work_projects` table:

- `year` (TEXT) - Project year
- `thumbnail` (TEXT) - Thumbnail image URL
- `media_type` (TEXT) - 'image' or 'video'
- `credits` (JSONB) - Array of credits with label/value pairs
- `images` (JSONB) - Array of image URLs
- `youtube_url` (TEXT) - YouTube embed URL
- `slug` (TEXT) - URL-friendly slug (unique)

It also creates an index on `slug` for faster lookups.

## After Running the Migration

1. Your app will now support all the new fields
2. Visit `/admin` to start adding projects with the new fields
3. The Work Projects Manager will have all the new form fields available
4. Projects will dynamically appear on the `/work` page

## Testing

After applying the migration, test by:

1. Going to `/admin` (if you have admin access)
2. Navigate to "Work Projects" tab
3. Click "Add Work Project" 
4. You should now see all the new fields (Year, Thumbnail, Media Type, Credits, Images, YouTube URL, Slug)

## Troubleshooting

If you get an error about a column already existing:
- That's normal if the migration has already been run
- The `IF NOT EXISTS` clause prevents errors on re-runs
- You can safely ignore the message

If you get an error about UNIQUE constraint on slug:
- This is expected - slugs must be unique
- Ensure each project has a different slug value












