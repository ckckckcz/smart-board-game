-- Migration: add essay image max count to questions

ALTER TABLE IF EXISTS public.questions
  ADD COLUMN IF NOT EXISTS essay_image_max_count INTEGER NOT NULL DEFAULT 3;

UPDATE public.questions
SET essay_image_max_count = 3
WHERE essay_image_max_count IS NULL;