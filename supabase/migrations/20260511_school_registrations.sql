-- School registration requests — submitted by schools interested in WriFe
-- No auth required for INSERT (anon key + RLS); admin-only for SELECT/UPDATE/DELETE.

CREATE TABLE IF NOT EXISTS school_registrations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name  TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT,
  website      TEXT,
  num_pupils   INTEGER,
  num_teachers INTEGER,
  year_groups  TEXT[],
  message      TEXT,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  school_id    UUID REFERENCES schools(id) ON DELETE SET NULL,
  admin_notes  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Only authenticated admins can read/update; anyone (anon) can INSERT
ALTER TABLE school_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can submit registrations"
  ON school_registrations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage registrations"
  ON school_registrations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
