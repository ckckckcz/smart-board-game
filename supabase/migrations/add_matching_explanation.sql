-- =====================================================
-- MIGRATION: Add matching_explanation column to questions
-- =====================================================
-- Safe to run multiple times (IF NOT EXISTS guard via DO block)
-- Does NOT delete or modify any existing data.
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'questions'
      AND column_name = 'matching_explanation'
  ) THEN
    ALTER TABLE questions
      ADD COLUMN matching_explanation TEXT;

    RAISE NOTICE 'Column matching_explanation added to questions table.';
  ELSE
    RAISE NOTICE 'Column matching_explanation already exists, skipping.';
  END IF;
END
$$;
