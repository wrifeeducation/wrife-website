-- Fix resource_assignments.class_id column type: INTEGER → UUID
--
-- Root cause: the table was originally created with class_id INTEGER but
-- classes.id (and pupils.class_id) use UUID throughout the rest of the schema.
-- This caused a Postgres type-mismatch error (HTTP 500) whenever the pupil
-- dashboard called POST /api/pupil/resource-assignments with a UUID classId.
--
-- The table had 0 rows at time of migration so no data was lost.
-- Applied to gzmgjkbtsvezfclmreru on 2026-05-24 via Supabase MCP.
--
-- If re-running on a fresh DB: ensure the classes table exists first.

ALTER TABLE resource_assignments DROP COLUMN IF EXISTS class_id;
ALTER TABLE resource_assignments ADD COLUMN class_id UUID NOT NULL REFERENCES classes(id);

-- Recreate the index on the new UUID column
CREATE INDEX IF NOT EXISTS idx_resource_assignments_class_id ON resource_assignments (class_id);
