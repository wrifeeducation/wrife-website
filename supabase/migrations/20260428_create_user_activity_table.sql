-- Create user_activity table for platform analytics
-- This table was defined in db/schema.ts but never had a migration applied.

CREATE TABLE IF NOT EXISTS user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_role varchar,
  event_type varchar NOT NULL,
  event_data jsonb DEFAULT '{}',
  page_path varchar,
  session_id varchar,
  ip_address varchar,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_event_type ON user_activity(event_type);
