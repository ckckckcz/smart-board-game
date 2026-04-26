-- Migration: add short_answer question type
-- Run this in Supabase SQL Editor (or your migration runner)

-- 1) Ensure the questions.type CHECK constraint includes short_answer
ALTER TABLE IF EXISTS public.questions
  DROP CONSTRAINT IF EXISTS questions_type_check;

ALTER TABLE IF EXISTS public.questions
  ADD CONSTRAINT questions_type_check
  CHECK (
    type IN (
      'multiple_choice',
      'true_false',
      'essay',
      'matching',
      'short_answer'
    )
  );

-- Note:
-- - No new columns are required.
-- - For short_answer, the app stores the key in `correct_answer` (text).
-- - Optional explanation is stored in `essay_answer`.
