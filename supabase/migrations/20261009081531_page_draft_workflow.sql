-- Store unpublished page edits separately from the content served to visitors.
BEGIN;

CREATE TABLE IF NOT EXISTS public.page_drafts (
  page_id TEXT PRIMARY KEY REFERENCES public.pages(id) ON DELETE CASCADE,
  page_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.page_drafts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Full access for all on page_drafts" ON public.page_drafts;
CREATE POLICY "Full access for all on page_drafts" ON public.page_drafts
  FOR ALL USING (true) WITH CHECK (true);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_drafts TO anon, authenticated;

-- Apply a page draft and its section list atomically when Publish is clicked.
CREATE OR REPLACE FUNCTION public.publish_page_draft(p_page_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  draft public.page_drafts%ROWTYPE;
BEGIN
  SELECT * INTO draft
  FROM public.page_drafts
  WHERE page_id = p_page_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No draft found for page %', p_page_id;
  END IF;

  UPDATE public.pages
  SET title = COALESCE(draft.page_data->>'title', title),
      slug = COALESCE(draft.page_data->>'slug', slug),
      status = 'published',
      is_home = COALESCE((draft.page_data->>'is_home')::BOOLEAN, is_home),
      sort_order = COALESCE((draft.page_data->>'sort_order')::INTEGER, sort_order),
      seo = COALESCE(draft.page_data->'seo', seo),
      updated_at = NOW(),
      published_at = NOW()
  WHERE id = p_page_id;

  DELETE FROM public.page_sections WHERE page_id = p_page_id;

  INSERT INTO public.page_sections (
    id, page_id, section_type, content, settings, sort_order,
    is_visible, created_at, updated_at
  )
  SELECT section->>'id',
         p_page_id,
         section->>'section_type',
         COALESCE(section->'content', '{}'::jsonb),
         COALESCE(section->'settings', '{}'::jsonb),
         COALESCE((section->>'sort_order')::INTEGER, 0),
         COALESCE((section->>'is_visible')::BOOLEAN, true),
         COALESCE((section->>'created_at')::TIMESTAMPTZ, NOW()),
         NOW()
  FROM jsonb_array_elements(draft.sections) AS section;

  DELETE FROM public.page_drafts WHERE page_id = p_page_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.publish_page_draft(TEXT) TO anon, authenticated;

COMMIT;
