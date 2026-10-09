-- Use the CMS normal vertical spacing preset for all existing page sections.
BEGIN;

UPDATE public.page_sections
SET settings = jsonb_set(
  COALESCE(settings, '{}'::jsonb),
  '{padding_y}',
  '"normal"'::jsonb,
  true
),
updated_at = NOW()
WHERE COALESCE(settings->>'padding_y', '') <> 'normal';

COMMIT;
