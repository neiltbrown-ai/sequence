-- Replace the old FK-based bookmarks table with a slug-based one.
-- Content lives in MDX files, not the library_content table,
-- so we store content_type + slug instead of a content_id FK.

DROP TABLE IF EXISTS public.bookmarks CASCADE;

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('structure', 'case_study', 'article')),
  slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_type, slug)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookmarks' AND policyname = 'Users manage own bookmarks'
  ) THEN
    CREATE POLICY "Users manage own bookmarks"
      ON public.bookmarks FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
