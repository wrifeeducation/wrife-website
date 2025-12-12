-- RUN THIS SQL IN YOUR SUPABASE SQL EDITOR
-- Dashboard -> SQL Editor -> New Query -> Paste this and Run

-- TABLE: writing_levels - All level definitions
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
  rubric JSONB NOT NULL DEFAULT '{}'::jsonb,
  passing_threshold INTEGER NOT NULL DEFAULT 80,
  expected_time_minutes INTEGER,
  difficulty_level TEXT,
  age_range TEXT,
  tier_finale BOOLEAN DEFAULT FALSE,
  programme_finale BOOLEAN DEFAULT FALSE,
  milestone BOOLEAN DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: dwp_assignments - Teacher assigns levels to classes
CREATE TABLE IF NOT EXISTS dwp_assignments (
  id SERIAL PRIMARY KEY,
  level_id TEXT NOT NULL REFERENCES writing_levels(level_id) ON DELETE CASCADE,
  class_id TEXT NOT NULL,
  teacher_id UUID NOT NULL,
  instructions TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: writing_attempts - Every pupil writing submission
CREATE TABLE IF NOT EXISTS writing_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pupil_id UUID NOT NULL,
  dwp_assignment_id INTEGER REFERENCES dwp_assignments(id) ON DELETE CASCADE,
  level_id TEXT NOT NULL REFERENCES writing_levels(level_id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  pupil_writing TEXT NOT NULL DEFAULT '',
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

-- TABLE: writing_progress - Track pupil progress
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
  total_words_written INTEGER DEFAULT 0,
  average_score NUMERIC(5,2),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_writing_levels_tier ON writing_levels(tier_number);
CREATE INDEX IF NOT EXISTS idx_writing_levels_number ON writing_levels(level_number);
CREATE INDEX IF NOT EXISTS idx_dwp_assignments_class ON dwp_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_dwp_assignments_level ON dwp_assignments(level_id);
CREATE INDEX IF NOT EXISTS idx_attempts_pupil ON writing_attempts(pupil_id);
CREATE INDEX IF NOT EXISTS idx_attempts_assignment ON writing_attempts(dwp_assignment_id);
CREATE INDEX IF NOT EXISTS idx_progress_pupil ON writing_progress(pupil_id);

-- Enable RLS
ALTER TABLE writing_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE dwp_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow all reads/writes (adjust as needed)
CREATE POLICY "Anyone can read writing_levels" ON writing_levels FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage dwp_assignments" ON dwp_assignments FOR ALL USING (true);
CREATE POLICY "Authenticated can read writing_attempts" ON writing_attempts FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert writing_attempts" ON writing_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update writing_attempts" ON writing_attempts FOR UPDATE USING (true);
CREATE POLICY "Authenticated can read writing_progress" ON writing_progress FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert writing_progress" ON writing_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update writing_progress" ON writing_progress FOR UPDATE USING (true);

-- SEED: Add 5 sample writing levels for testing
INSERT INTO writing_levels (level_number, tier_number, level_id, activity_name, activity_type, learning_objective, prompt_title, prompt_instructions, rubric, passing_threshold, display_order, expected_time_minutes)
VALUES 
(1, 1, 'writing_level_1', 'Word Sorting', 'word_sorting', 'Sort words into correct categories', 'Sort These Words', 'Sort the following words into two groups: naming words (nouns) and doing words (verbs).', '{"criteria": ["accuracy", "completion"], "bands": {"mastery": 90, "secure": 80, "developing": 60, "emerging": 0}}', 80, 1, 5),
(2, 1, 'writing_level_2', 'Sentence Completion', 'sentence_completion', 'Complete sentences with appropriate words', 'Finish the Sentence', 'Complete each sentence by choosing the best word from the word bank.', '{"criteria": ["accuracy", "sense"], "bands": {"mastery": 90, "secure": 80, "developing": 60, "emerging": 0}}', 80, 2, 5),
(3, 1, 'writing_level_3', 'Simple Sentences', 'sentence_writing', 'Write complete simple sentences', 'Write a Simple Sentence', 'Look at the picture. Write a simple sentence about what you see. Remember: capital letter at the start, full stop at the end.', '{"criteria": ["capital_letter", "full_stop", "makes_sense"], "bands": {"mastery": 90, "secure": 80, "developing": 60, "emerging": 0}}', 80, 3, 7),
(4, 1, 'writing_level_4', 'Adding Detail', 'sentence_expansion', 'Add adjectives to make sentences more interesting', 'Make It Better', 'Rewrite each sentence by adding a describing word (adjective) to make it more interesting.', '{"criteria": ["adjective_used", "makes_sense", "punctuation"], "bands": {"mastery": 90, "secure": 80, "developing": 60, "emerging": 0}}', 80, 4, 7),
(5, 1, 'writing_level_5', 'Tier 1 Challenge', 'paragraph_writing', 'Write a short paragraph using simple sentences', 'My Favourite Thing', 'Write 3-4 sentences about your favourite toy, food, or place. Use capital letters and full stops correctly.', '{"criteria": ["sentence_count", "capital_letters", "full_stops", "topic_focus"], "bands": {"mastery": 90, "secure": 80, "developing": 60, "emerging": 0}}', 80, 5, 10)
ON CONFLICT (level_id) DO NOTHING;
