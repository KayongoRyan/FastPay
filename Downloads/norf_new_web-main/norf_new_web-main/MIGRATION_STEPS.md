# Database Migration Steps

## Apply the Database Migration

The migration file `supabase/migrations/20250120000000_update_work_projects_schema.sql` needs to be applied to your Supabase database.

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/20250120000000_update_work_projects_schema.sql`
4. Execute the migration

### Option 2: Via Supabase CLI

```bash
# Link your project (if not already linked)
npx supabase link --project-ref uckavxqjivohibqyzbzl

# Push the migration
npx supabase db push
```

## Verify Migration

After running the migration, you can verify the schema by running:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'work_projects';
```

Expected columns:
- `id`, `title`, `description`, `category`, `image_url`, `display_order`
- `year`, `thumbnail`, `media_type`, `credits`, `images`, `youtube_url`, `slug`
- `created_at`, `updated_at`

## Using the CRUD Functionality

### For Work Projects:
1. Navigate to `/admin` (requires admin authentication)
2. Go to the "Work Projects" tab
3. Fill out all fields:
   - **Title**: Project title
   - **Category**: Project category
   - **Description**: Full description
   - **Image URL**: Main image
   - **Year**: Project year (optional)
   - **Thumbnail URL**: Optional different thumbnail
   - **Media Type**: Image or Video
   - **Credits**: JSON array of credits (e.g., `[{"label":"Director","value":"John Doe"}]`)
   - **Images Array**: JSON array of image URLs (e.g., `["url1.jpg", "url2.jpg"]`)
   - **YouTube URL**: Embedded YouTube URL (for video projects)
   - **Slug**: URL-friendly slug for routing
   - **Display Order**: Order of display (higher = first)

### For Team Members:
1. Navigate to `/admin`
2. Go to the "Team Members" tab
3. Fill out fields:
   - **Name**: Full name
   - **Role**: Job title
   - **Bio**: Biography text
   - **Image URL**: Profile image
   - **Display Order**: Order of display

## Testing Dynamic Content

### Work Page (`/work`):
- Projects are fetched dynamically from the database
- Filter by category
- Click project to view details with all media

### About Page (`/about`):
- Team members are fetched dynamically from the database
- Displays in grid layout with loading states

## Notes

- All CRUD operations require admin authentication
- The migration adds new fields without breaking existing data
- Empty/optional fields are handled gracefully in the UI
- JSON fields (credits, images) should be formatted as proper JSON arrays












