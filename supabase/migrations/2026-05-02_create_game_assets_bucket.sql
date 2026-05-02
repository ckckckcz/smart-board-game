-- Migration: create missing Storage bucket for uploaded question and answer images

INSERT INTO storage.buckets (id, name, public)
VALUES ('game-assets', 'game-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read for game-assets" ON storage.objects;
CREATE POLICY "Public read for game-assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'game-assets');

DROP POLICY IF EXISTS "Public upload for game-assets" ON storage.objects;
CREATE POLICY "Public upload for game-assets"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'game-assets');

DROP POLICY IF EXISTS "Public update for game-assets" ON storage.objects;
CREATE POLICY "Public update for game-assets"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'game-assets')
WITH CHECK (bucket_id = 'game-assets');

DROP POLICY IF EXISTS "Public delete for game-assets" ON storage.objects;
CREATE POLICY "Public delete for game-assets"
ON storage.objects
FOR DELETE
USING (bucket_id = 'game-assets');