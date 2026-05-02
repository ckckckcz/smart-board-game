-- Migration: add round-level allowed question types

ALTER TABLE IF EXISTS public.rounds
  ADD COLUMN IF NOT EXISTS allowed_question_types JSONB NOT NULL DEFAULT '["multiple_choice", "true_false", "matching", "short_answer", "essay"]'::jsonb;

UPDATE public.rounds
SET allowed_question_types = '["multiple_choice", "true_false", "matching", "short_answer", "essay"]'::jsonb
WHERE allowed_question_types IS NULL;