-- Multi-category support and switch to thumbnail-only images for work_projects

-- 1) Add categories array column
ALTER TABLE public.work_projects
  ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}'::text[] NOT NULL;

-- 2) Backfill categories from legacy category
UPDATE public.work_projects
SET categories = CASE
  WHEN category IS NOT NULL AND category <> '' THEN ARRAY[category]
  ELSE categories
END
WHERE (categories IS NULL OR array_length(categories, 1) IS NULL);

-- 3) Ensure thumbnail is populated from legacy image_url if missing
UPDATE public.work_projects
SET thumbnail = COALESCE(thumbnail, image_url)
WHERE thumbnail IS NULL AND image_url IS NOT NULL;

-- 4) Make thumbnail required going forward
ALTER TABLE public.work_projects
  ALTER COLUMN thumbnail SET NOT NULL;

-- 5) Drop legacy single category and image_url columns (safe if no dependencies)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'work_projects' AND column_name = 'category'
  ) THEN
    ALTER TABLE public.work_projects DROP COLUMN category;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'work_projects' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.work_projects DROP COLUMN image_url;
  END IF;
END $$;

-- 6) Optional: index for searching/filtering by categories (GIN for arrays)
CREATE INDEX IF NOT EXISTS idx_work_projects_categories ON public.work_projects USING GIN (categories);







