-- ============================================================
-- WriFe Direct Sign-Up Framework Migration
-- Date: 2026-05-07
-- Repo: wrife-website
-- Purpose: Establish placeholder schema for Route C (parent/home
--          learner) and Route D (independent teacher) direct sign-ups
--          on PWP Studio and Interactive Practice.
--          Required before Google Play Store submission.
-- ============================================================

-- ── 1. home_accounts ────────────────────────────────────────
-- Stores parents and independent teachers who sign up directly
-- on pwp-studio.wrife.co.uk or practice.wrife.co.uk (not via school).
-- One row per purchaser. Children/pupils are still in the `pupils`
-- table, linked via a home class.

CREATE TABLE IF NOT EXISTS home_accounts (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_type           TEXT NOT NULL
                           CHECK (account_type IN ('parent', 'independent_teacher')),
  email                  TEXT NOT NULL UNIQUE,
  display_name           TEXT,
  auth_user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  subscription_tier      TEXT DEFAULT 'free'
                           CHECK (subscription_tier IN ('free', 'starter', 'pro')),
  subscription_status    TEXT DEFAULT 'inactive'
                           CHECK (subscription_status IN
                             ('inactive', 'active', 'cancelled', 'past_due', 'trialing')),
  app_origin             TEXT CHECK (app_origin IN ('pwp', 'ip')),
  -- which sub-app they originally signed up through
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE home_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "home_accounts_owner_all"
  ON home_accounts FOR ALL
  USING (auth_user_id = auth.uid());

CREATE INDEX IF NOT EXISTS home_accounts_auth_user_id_idx
  ON home_accounts (auth_user_id);

CREATE INDEX IF NOT EXISTS home_accounts_email_idx
  ON home_accounts (email);

-- ── 2. Extend classes with account_type ─────────────────────
-- school        — standard teacher-managed class on wrife.co.uk
-- home          — auto-created for each parent; class_code = parent code
-- independent_teacher — class created by a Route D teacher on sub-app

ALTER TABLE classes
  ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'school'
    CHECK (account_type IN ('school', 'home', 'independent_teacher')),
  ADD COLUMN IF NOT EXISTS home_account_id UUID
    REFERENCES home_accounts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS classes_account_type_idx
  ON classes (account_type);

CREATE INDEX IF NOT EXISTS classes_home_account_id_idx
  ON classes (home_account_id)
  WHERE home_account_id IS NOT NULL;

-- ── 3. learning_events ──────────────────────────────────────
-- Shared progress bridge. Sub-apps INSERT; wrife.co.uk reads.
-- Sub-apps never ALTER this table — it is owned by wrife-website.
-- This keeps sub-app internal tables private while giving the
-- teacher dashboard and parent view a single clean read surface.

CREATE TABLE IF NOT EXISTS learning_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pupil_id    UUID NOT NULL,
  -- = auth.uid() = pupils.id — no FK to avoid cross-app lock-in
  app         TEXT NOT NULL CHECK (app IN ('pwp', 'ip', 'dwp')),
  event_type  TEXT NOT NULL,
  -- PWP:  formula_completed | chain_session_completed |
  --       free_practice_session | pwp_level_advanced
  -- IP:   lesson_completed | world_completed |
  --       badge_earned | streak_milestone
  -- DWP:  writing_submitted | writing_approved | writing_reviewed
  event_data  JSONB DEFAULT '{}',
  -- PWP formula_completed: { level, score, attempts }
  -- IP lesson_completed:   { lesson_id, stars, xp_earned }
  -- etc. — see ecosystem skill for full payload reference
  class_id    UUID REFERENCES classes(id) ON DELETE SET NULL,
  -- nullable — home learners have a home class; standalone pupils may be null
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE learning_events ENABLE ROW LEVEL SECURITY;

-- Sub-apps can insert their own pupils' events
CREATE POLICY "learning_events_pupil_insert"
  ON learning_events FOR INSERT
  WITH CHECK (pupil_id = auth.uid());

-- Pupils can read their own events
CREATE POLICY "learning_events_pupil_read"
  ON learning_events FOR SELECT
  USING (pupil_id = auth.uid());

-- Teachers can read events for pupils in their classes
CREATE POLICY "learning_events_teacher_read"
  ON learning_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      JOIN profiles p ON p.id = auth.uid()
      WHERE c.id = learning_events.class_id
        AND c.teacher_id = auth.uid()
        AND p.role IN ('teacher', 'school_admin', 'admin')
    )
  );

-- Home account owners can read their child's events
CREATE POLICY "learning_events_home_account_read"
  ON learning_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pupils pu
      JOIN classes cl ON cl.id = pu.class_id
      JOIN home_accounts ha ON ha.id = cl.home_account_id
      WHERE pu.id = learning_events.pupil_id
        AND ha.auth_user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS learning_events_pupil_id_idx
  ON learning_events (pupil_id, created_at DESC);

CREATE INDEX IF NOT EXISTS learning_events_class_id_idx
  ON learning_events (class_id, created_at DESC)
  WHERE class_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS learning_events_app_type_idx
  ON learning_events (app, event_type, created_at DESC);

-- ── 4. pupil_parent_links ────────────────────────────────────
-- Allows a school teacher to grant a parent read access to their
-- child's progress on wrife.co.uk. Separate from Route C —
-- this is for school-enrolled pupils whose teacher opts in.
-- Parent receives an access_code, enters it on wrife.co.uk/parent/claim,
-- and gains a read-only progress view.

CREATE TABLE IF NOT EXISTS pupil_parent_links (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pupil_id         UUID NOT NULL,
  -- school pupil — references pupils.id
  parent_email     TEXT NOT NULL,
  access_code      TEXT NOT NULL UNIQUE,
  -- teacher-generated short code (e.g. LINK-XXXX-YYYY)
  claimed_at       TIMESTAMPTZ,
  parent_auth_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- set when parent creates an account and claims the link
  created_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  -- teacher who created this link
  expires_at       TIMESTAMPTZ,
  -- optional expiry; NULL = never expires
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (pupil_id, parent_email)
);

ALTER TABLE pupil_parent_links ENABLE ROW LEVEL SECURITY;

-- Teachers can manage links for their own class pupils
CREATE POLICY "ppl_teacher_manage"
  ON pupil_parent_links FOR ALL
  USING (created_by = auth.uid());

-- Parents can read and claim their own link
CREATE POLICY "ppl_parent_read"
  ON pupil_parent_links FOR SELECT
  USING (
    parent_auth_id = auth.uid()
    OR parent_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "ppl_parent_claim"
  ON pupil_parent_links FOR UPDATE
  USING (
    parent_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  )
  WITH CHECK (parent_auth_id = auth.uid());

CREATE INDEX IF NOT EXISTS ppl_pupil_id_idx
  ON pupil_parent_links (pupil_id);

CREATE INDEX IF NOT EXISTS ppl_parent_auth_id_idx
  ON pupil_parent_links (parent_auth_id)
  WHERE parent_auth_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS ppl_access_code_idx
  ON pupil_parent_links (access_code);

-- ── 5. Extend pupils for home learners ──────────────────────
-- Home learner pupils may not have a year_group or a real last_name.
-- Ensure these columns are already nullable (they should be).
-- Also add a flag so reporting can distinguish home from school pupils.

ALTER TABLE pupils
  ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'school'
    CHECK (account_type IN ('school', 'home', 'independent_teacher'));

CREATE INDEX IF NOT EXISTS pupils_account_type_idx
  ON pupils (account_type)
  WHERE account_type != 'school';

-- ── 6. Helper function — auto-updated_at trigger ─────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER home_accounts_updated_at
  BEFORE UPDATE ON home_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── END OF MIGRATION ─────────────────────────────────────────
-- Tables created (empty, ready for data):
--   home_accounts          — Route C/D purchasers
--   learning_events        — shared progress bridge (sub-apps write, wrife reads)
--   pupil_parent_links     — school teacher → parent progress sharing
-- Tables extended:
--   classes                — +account_type, +home_account_id
--   pupils                 — +account_type
