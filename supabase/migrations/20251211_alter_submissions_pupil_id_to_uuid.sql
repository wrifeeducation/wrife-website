-- Migration: Change submissions.pupil_id from integer to uuid
-- This aligns with class_members.pupil_id which is uuid type
-- Run this migration on new environments where the column is still integer

-- Only run if column is still integer type
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'submissions' 
    AND column_name = 'pupil_id' 
    AND data_type = 'integer'
  ) THEN
    ALTER TABLE submissions ALTER COLUMN pupil_id TYPE uuid USING pupil_id::text::uuid;
  END IF;
END $$;
