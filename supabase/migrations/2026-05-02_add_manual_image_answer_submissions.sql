-- Migration: add manual image answer submissions for essay questions
-- Run this in Supabase SQL Editor (or your migration runner)

CREATE TABLE IF NOT EXISTS public.manual_image_answer_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  round_id UUID REFERENCES public.rounds(id) ON DELETE SET NULL,
  round_name TEXT,
  question_id TEXT,
  question_type TEXT NOT NULL CHECK (question_type IN ('short_answer', 'essay')),
  question_text TEXT NOT NULL,
  image_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  review_points INTEGER,
  score_applied BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_manual_image_answer_submissions_player_id
  ON public.manual_image_answer_submissions(player_id);

CREATE INDEX IF NOT EXISTS idx_manual_image_answer_submissions_round_id
  ON public.manual_image_answer_submissions(round_id);

CREATE INDEX IF NOT EXISTS idx_manual_image_answer_submissions_status
  ON public.manual_image_answer_submissions(status);