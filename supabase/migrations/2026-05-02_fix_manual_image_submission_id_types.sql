-- Migration: make manual image answer submission ids compatible with local app ids

ALTER TABLE IF EXISTS public.manual_image_answer_submissions
  ALTER COLUMN player_id TYPE TEXT USING player_id::text;

ALTER TABLE IF EXISTS public.manual_image_answer_submissions
  DROP CONSTRAINT IF EXISTS manual_image_answer_submissions_question_id_fkey;

ALTER TABLE IF EXISTS public.manual_image_answer_submissions
  ALTER COLUMN question_id TYPE TEXT USING question_id::text;