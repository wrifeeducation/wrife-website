-- Daily Writing Practice (DWP) Tables
-- 40-Level Progressive Writing System with AI Assessment

-- TABLE: writing_levels - All 40 level definitions
CREATE TABLE IF NOT EXISTS writing_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_number INTEGER NOT NULL UNIQUE CHECK (level_number BETWEEN 1 AND 40),
  tier_number INTEGER NOT NULL CHECK (tier_number BETWEEN 1 AND 8),
  level_id TEXT NOT NULL UNIQUE,
  activity_name TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  learning_objective TEXT NOT NULL,
  
  prompt_title TEXT NOT NULL,
  prompt_instructions TEXT NOT NULL,
  prompt_example TEXT,
  word_bank JSONB,
  
  rubric JSONB NOT NULL,
  passing_threshold INTEGER NOT NULL DEFAULT 80,
  
  expected_time_minutes INTEGER,
  difficulty_level TEXT,
  age_range TEXT,
  
  tier_finale BOOLEAN DEFAULT FALSE,
  programme_finale BOOLEAN DEFAULT FALSE,
  milestone BOOLEAN DEFAULT FALSE,
  
  display_order INTEGER NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_writing_levels_tier ON writing_levels(tier_number);
CREATE INDEX IF NOT EXISTS idx_writing_levels_order ON writing_levels(display_order);
CREATE INDEX IF NOT EXISTS idx_writing_levels_number ON writing_levels(level_number);

-- TABLE: dwp_assignments - Teacher assigns levels to classes
CREATE TABLE IF NOT EXISTS dwp_assignments (
  id SERIAL PRIMARY KEY,
  level_id TEXT NOT NULL REFERENCES writing_levels(level_id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  instructions TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dwp_assignments_class ON dwp_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_dwp_assignments_level ON dwp_assignments(level_id);
CREATE INDEX IF NOT EXISTS idx_dwp_assignments_teacher ON dwp_assignments(teacher_id);

-- TABLE: writing_attempts - Every pupil writing submission and AI assessment
CREATE TABLE IF NOT EXISTS writing_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  pupil_id UUID NOT NULL,
  dwp_assignment_id INTEGER REFERENCES dwp_assignments(id) ON DELETE CASCADE,
  level_id TEXT NOT NULL REFERENCES writing_levels(level_id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  
  pupil_writing TEXT NOT NULL,
  word_count INTEGER,
  
  score INTEGER,
  total_items INTEGER,
  percentage INTEGER,
  passed BOOLEAN,
  performance_band TEXT,
  
  ai_assessment JSONB,
  
  error_patterns TEXT[],
  primary_error_pattern TEXT,
  primary_strength TEXT,
  primary_growth_area TEXT,
  
  badge_earned TEXT,
  certificate_earned TEXT,
  
  unlocked_next_level BOOLEAN DEFAULT FALSE,
  next_level_id TEXT,
  
  intervention_flagged BOOLEAN DEFAULT FALSE,
  teacher_reviewed BOOLEAN DEFAULT FALSE,
  teacher_notes TEXT,
  flagged_for_review BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  
  time_started TIMESTAMP WITH TIME ZONE,
  time_submitted TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_elapsed_seconds INTEGER,
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'assessed')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attempts_pupil ON writing_attempts(pupil_id);
CREATE INDEX IF NOT EXISTS idx_attempts_level ON writing_attempts(level_id);
CREATE INDEX IF NOT EXISTS idx_attempts_assignment ON writing_attempts(dwp_assignment_id);
CREATE INDEX IF NOT EXISTS idx_attempts_passed ON writing_attempts(passed);
CREATE INDEX IF NOT EXISTS idx_attempts_status ON writing_attempts(status);

-- TABLE: writing_progress - Track pupil overall progress through writing programme
CREATE TABLE IF NOT EXISTS writing_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pupil_id UUID NOT NULL UNIQUE,
  
  current_level_id TEXT NOT NULL DEFAULT 'writing_level_1',
  current_level_number INTEGER NOT NULL DEFAULT 1,
  current_tier_number INTEGER NOT NULL DEFAULT 1,
  
  levels_completed TEXT[] DEFAULT '{}',
  tiers_completed INTEGER[] DEFAULT '{}',
  programme_completed BOOLEAN DEFAULT FALSE,
  
  badges_earned JSONB DEFAULT '[]'::JSONB,
  certificates_earned TEXT[] DEFAULT '{}',
  
  total_attempts INTEGER DEFAULT 0,
  total_levels_passed INTEGER DEFAULT 0,
  total_levels_failed INTEGER DEFAULT 0,
  total_time_minutes INTEGER DEFAULT 0,
  average_score NUMERIC(5,2),
  
  tier1_completed BOOLEAN DEFAULT FALSE,
  tier2_completed BOOLEAN DEFAULT FALSE,
  tier3_completed BOOLEAN DEFAULT FALSE,
  tier4_completed BOOLEAN DEFAULT FALSE,
  tier5_completed BOOLEAN DEFAULT FALSE,
  tier6_completed BOOLEAN DEFAULT FALSE,
  tier7_completed BOOLEAN DEFAULT FALSE,
  tier8_completed BOOLEAN DEFAULT FALSE,
  
  mastery_count INTEGER DEFAULT 0,
  secure_count INTEGER DEFAULT 0,
  developing_count INTEGER DEFAULT 0,
  emerging_count INTEGER DEFAULT 0,
  
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  
  needs_support BOOLEAN DEFAULT FALSE,
  support_reason TEXT,
  
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_progress_pupil ON writing_progress(pupil_id);
CREATE INDEX IF NOT EXISTS idx_progress_current_level ON writing_progress(current_level_number);

-- TABLE: writing_badges - Define all available badges
CREATE TABLE IF NOT EXISTS writing_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_id TEXT NOT NULL UNIQUE,
  badge_name TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  badge_description TEXT NOT NULL,
  
  level_id TEXT,
  tier_number INTEGER,
  performance_band TEXT,
  
  badge_type TEXT NOT NULL,
  rarity TEXT,
  
  display_order INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_badges_type ON writing_badges(badge_type);

-- TABLE: writing_certificates - Store certificate definitions
CREATE TABLE IF NOT EXISTS writing_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id TEXT NOT NULL UNIQUE,
  certificate_name TEXT NOT NULL,
  certificate_type TEXT NOT NULL,
  
  tier_number INTEGER,
  requires_level_id TEXT,
  minimum_performance_band TEXT,
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  template TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificates_type ON writing_certificates(certificate_type);

-- TABLE: pupil_certificates_earned - Track which pupils earned which certificates  
CREATE TABLE IF NOT EXISTS pupil_certificates_earned (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pupil_id UUID NOT NULL,
  certificate_id TEXT NOT NULL,
  
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  level_completed TEXT,
  final_score INTEGER,
  
  pupil_name TEXT NOT NULL,
  teacher_name TEXT,
  school_name TEXT,
  
  UNIQUE(pupil_id, certificate_id)
);

CREATE INDEX IF NOT EXISTS idx_pupil_certs_pupil ON pupil_certificates_earned(pupil_id);

-- Enable Row Level Security
ALTER TABLE writing_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE dwp_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pupil_certificates_earned ENABLE ROW LEVEL SECURITY;

-- Policies: Everyone can view level definitions (read-only)
CREATE POLICY "Anyone can view writing levels" ON writing_levels
  FOR SELECT TO authenticated USING (true);

-- Policies: Everyone can view badges (read-only)
CREATE POLICY "Anyone can view writing badges" ON writing_badges
  FOR SELECT TO authenticated USING (true);

-- Policies: Everyone can view certificates (read-only)
CREATE POLICY "Anyone can view writing certificates" ON writing_certificates
  FOR SELECT TO authenticated USING (true);

-- Policies for dwp_assignments: Teachers can manage their own assignments
CREATE POLICY "Teachers can view assignments for their classes" ON dwp_assignments
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM classes WHERE classes.id = dwp_assignments.class_id 
      AND classes.teacher_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM class_members WHERE class_members.class_id = dwp_assignments.class_id 
      AND class_members.pupil_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can insert assignments for their classes" ON dwp_assignments
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes WHERE classes.id = dwp_assignments.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update assignments for their classes" ON dwp_assignments
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM classes WHERE classes.id = dwp_assignments.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete assignments for their classes" ON dwp_assignments
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM classes WHERE classes.id = dwp_assignments.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

-- Policies for writing_attempts: Pupils can manage their own attempts, teachers can view their class attempts
CREATE POLICY "Pupils can view their own attempts" ON writing_attempts
  FOR SELECT TO authenticated USING (
    pupil_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM dwp_assignments da 
      JOIN classes c ON c.id = da.class_id 
      WHERE da.id = writing_attempts.dwp_assignment_id 
      AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Pupils can insert their own attempts" ON writing_attempts
  FOR INSERT TO authenticated WITH CHECK (
    pupil_id = auth.uid()
  );

CREATE POLICY "Pupils can update their own attempts" ON writing_attempts
  FOR UPDATE TO authenticated USING (
    pupil_id = auth.uid()
  );

-- Policies for writing_progress: Pupils can manage their own progress, teachers can view
CREATE POLICY "Pupils can view their own progress" ON writing_progress
  FOR SELECT TO authenticated USING (
    pupil_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM class_members cm
      JOIN classes c ON c.id = cm.class_id
      WHERE cm.pupil_id = writing_progress.pupil_id
      AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Pupils can insert their own progress" ON writing_progress
  FOR INSERT TO authenticated WITH CHECK (
    pupil_id = auth.uid()
  );

CREATE POLICY "Pupils can update their own progress" ON writing_progress
  FOR UPDATE TO authenticated USING (
    pupil_id = auth.uid()
  );

-- Policies for pupil_certificates_earned: Pupils can view their own, teachers can view their class
CREATE POLICY "Pupils can view their own certificates" ON pupil_certificates_earned
  FOR SELECT TO authenticated USING (
    pupil_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM class_members cm
      JOIN classes c ON c.id = cm.class_id
      WHERE cm.pupil_id = pupil_certificates_earned.pupil_id
      AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Pupils can insert their own certificates" ON pupil_certificates_earned
  FOR INSERT TO authenticated WITH CHECK (
    pupil_id = auth.uid()
  );

-- Insert initial badges
INSERT INTO writing_badges (badge_id, badge_name, badge_icon, badge_description, badge_type, rarity, display_order) VALUES
('tier1_champion', 'Tier 1 Champion', '🏆', 'Mastered word awareness', 'tier', 'uncommon', 1),
('tier2_champion', 'Tier 2 Champion', '🏆', 'Mastered word combinations', 'tier', 'uncommon', 2),
('tier3_champion', 'Tier 3 Champion', '🏆', 'Mastered simple sentences', 'tier', 'rare', 3),
('tier4_champion', 'Tier 4 Champion', '🏆', 'Mastered sentence expansion', 'tier', 'rare', 4),
('tier5_champion', 'Tier 5 Champion', '🏆', 'Mastered sequencing', 'tier', 'rare', 5),
('tier6_champion', 'Tier 6 Champion', '🏆', 'Mastered story structure', 'tier', 'rare', 6),
('tier7_champion', 'Tier 7 Champion', '🏆', 'Mastered enhanced sentences', 'tier', 'rare', 7),
('tier8_champion', 'Tier 8 Champion', '🏆', 'Mastered narratives', 'tier', 'legendary', 8),
('programme_complete', 'WriFe Writing Master', '📚🏆', 'Completed entire DWP programme', 'programme', 'legendary', 9),
('first_story', 'Story Writer', '📚', 'Wrote first complete story', 'special', 'uncommon', 10),
('perfect_score', 'Perfect Score', '💯', 'Achieved 100% on a level', 'special', 'rare', 11),
('streak_5', '5-Day Streak', '🔥', 'Practiced 5 days in a row', 'streak', 'common', 12),
('streak_10', '10-Day Streak', '🔥🔥', 'Practiced 10 days in a row', 'streak', 'uncommon', 13),
('streak_30', '30-Day Streak', '🔥🔥🔥', 'Practiced 30 days in a row', 'streak', 'rare', 14)
ON CONFLICT (badge_id) DO NOTHING;

-- Insert tier completion certificates
INSERT INTO writing_certificates (certificate_id, certificate_name, certificate_type, tier_number, title, description) VALUES
('tier1_complete', 'Tier 1 Completion', 'tier', 1, 'Word Awareness Certificate', 'For mastering word categories and sorting'),
('tier2_complete', 'Tier 2 Completion', 'tier', 2, 'Word Combinations Certificate', 'For mastering word pairing and phrases'),
('tier3_complete', 'Tier 3 Completion', 'tier', 3, 'Simple Sentences Certificate', 'For mastering complete sentences'),
('tier4_complete', 'Tier 4 Completion', 'tier', 4, 'Sentence Expansion Certificate', 'For mastering sentence details and conjunctions'),
('tier5_complete', 'Tier 5 Completion', 'tier', 5, 'Basic Sequencing Certificate', 'For mastering story sequencing'),
('tier6_complete', 'Tier 6 Completion', 'tier', 6, 'Story Structure Certificate', 'For mastering Beginning-Middle-End'),
('tier7_complete', 'Tier 7 Completion', 'tier', 7, 'Enhanced Sentences Certificate', 'For mastering complex sentence structures'),
('tier8_complete', 'Tier 8 Completion', 'tier', 8, 'Short Narratives Certificate', 'For mastering complete narrative writing'),
('programme_complete', 'DWP Programme Completion', 'programme', NULL, 'WriFe Writing Master Certificate', 'For completing all 40 levels of the Daily Writing Practice programme')
ON CONFLICT (certificate_id) DO NOTHING;
