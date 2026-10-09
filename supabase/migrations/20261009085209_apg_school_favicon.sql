-- Point the public school's dynamic favicon setting to the shared GJ logo icon.
UPDATE public.site_settings
SET general = jsonb_set(
  COALESCE(general, '{}'::jsonb),
  '{favicon_url}',
  '"/gj-logo.ico"'::jsonb,
  true
),
updated_at = NOW()
WHERE id = 'default';
