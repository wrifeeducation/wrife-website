# WriFe Writing Activity Bank
## DATABASE SCHEMA & SQL IMPLEMENTATION

**Complete Database Structure for 40-Level Writing Programme**

---

## SCHEMA OVERVIEW

### Core Tables

1. **writing_levels** - All 40 level definitions
2. **writing_attempts** - Every pupil submission
3. **writing_progress** - Pupil progress tracking
4. **writing_badges** - Badge system
5. **writing_certificates** - Tier/programme certificates

### Integration with Existing System

- Links to existing `users` table
- Links to existing `progress` table (for Duolingo-style activities)
- Shares authentication system
- Unified pupil dashboard

---

## TABLE: writing_levels

**Purpose:** Store all 40 level definitions with prompts and rubrics

```sql
CREATE TABLE writing_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_number INTEGER NOT NULL UNIQUE CHECK (level_number BETWEEN 1 AND 40),
  tier_number INTEGER NOT NULL CHECK (tier_number BETWEEN 1 AND 8),
  level_id TEXT NOT NULL UNIQUE, -- e.g., 'writing_level_1'
  activity_name TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- 'word_sorting', 'open_writing', etc.
  learning_objective TEXT NOT NULL,
  
  -- Prompt content
  prompt_title TEXT NOT NULL,
  prompt_instructions TEXT NOT NULL,
  prompt_example TEXT, -- Optional example
  word_bank JSONB, -- Array of words if needed
  
  -- Assessment criteria
  rubric JSONB NOT NULL, -- Full JSON rubric
  passing_threshold INTEGER NOT NULL DEFAULT 80,
  
  -- Metadata
  expected_time_minutes INTEGER,
  difficulty_level TEXT, -- 'foundation', 'developing', 'advanced'
  age_range TEXT, -- '6-7', '7-9', etc.
  
  -- Flags
  tier_finale BOOLEAN DEFAULT FALSE,
  programme_finale BOOLEAN DEFAULT FALSE,
  milestone BOOLEAN DEFAULT FALSE,
  
  -- Ordering
  display_order INTEGER NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_writing_levels_tier ON writing_levels(tier_number);
CREATE INDEX idx_writing_levels_order ON writing_levels(display_order);
CREATE INDEX idx_writing_levels_number ON writing_levels(level_number);
```

---

## TABLE: writing_attempts

**Purpose:** Store every pupil writing submission and AI assessment

```sql
CREATE TABLE writing_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Who and what
  pupil_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level_id TEXT NOT NULL REFERENCES writing_levels(level_id),
  attempt_number INTEGER NOT NULL, -- 1st, 2nd, 3rd attempt at this level
  
  -- Pupil's work
  pupil_writing TEXT NOT NULL, -- The actual text they wrote
  word_count INTEGER,
  
  -- Assessment
  score INTEGER NOT NULL,
  total_items INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  performance_band TEXT NOT NULL, -- 'mastery', 'secure', 'developing', 'emerging'
  
  -- AI feedback (full JSON from Claude)
  ai_assessment JSONB NOT NULL,
  
  -- Error tracking
  error_patterns TEXT[], -- Array of detected error patterns
  primary_error_pattern TEXT,
  primary_strength TEXT,
  primary_growth_area TEXT,
  
  -- Badges and rewards
  badge_earned TEXT,
  certificate_earned TEXT,
  
  -- Progression
  unlocked_next_level BOOLEAN DEFAULT FALSE,
  next_level_id TEXT,
  
  -- Flags
  intervention_flagged BOOLEAN DEFAULT FALSE,
  teacher_reviewed BOOLEAN DEFAULT FALSE,
  teacher_notes TEXT,
  flagged_for_review BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  
  -- Timing
  time_started TIMESTAMP WITH TIME ZONE,
  time_submitted TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_elapsed_seconds INTEGER,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_attempts_pupil ON writing_attempts(pupil_id);
CREATE INDEX idx_attempts_level ON writing_attempts(level_id);
CREATE INDEX idx_attempts_passed ON writing_attempts(passed);
CREATE INDEX idx_attempts_flagged ON writing_attempts(flagged_for_review);
CREATE INDEX idx_attempts_intervention ON writing_attempts(intervention_flagged);
CREATE INDEX idx_attempts_pupil_level ON writing_attempts(pupil_id, level_id);

-- Unique constraint: pupil + level + attempt_number
CREATE UNIQUE INDEX idx_unique_attempt ON writing_attempts(pupil_id, level_id, attempt_number);
```

---

## TABLE: writing_progress

**Purpose:** Track pupil overall progress through writing programme

```sql
CREATE TABLE writing_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pupil_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Current position
  current_level_id TEXT NOT NULL REFERENCES writing_levels(level_id),
  current_level_number INTEGER NOT NULL,
  current_tier_number INTEGER NOT NULL,
  
  -- Completion tracking
  levels_completed TEXT[], -- Array of level_ids
  tiers_completed INTEGER[], -- Array of tier numbers
  programme_completed BOOLEAN DEFAULT FALSE,
  
  -- Badges and certificates
  badges_earned JSONB DEFAULT '[]'::JSONB, -- Array of badge objects
  certificates_earned TEXT[], -- Array of certificate names
  
  -- Statistics
  total_attempts INTEGER DEFAULT 0,
  total_levels_passed INTEGER DEFAULT 0,
  total_levels_failed INTEGER DEFAULT 0,
  total_time_minutes INTEGER DEFAULT 0,
  average_score NUMERIC(5,2),
  
  -- Tier progress
  tier1_completed BOOLEAN DEFAULT FALSE,
  tier2_completed BOOLEAN DEFAULT FALSE,
  tier3_completed BOOLEAN DEFAULT FALSE,
  tier4_completed BOOLEAN DEFAULT FALSE,
  tier5_completed BOOLEAN DEFAULT FALSE,
  tier6_completed BOOLEAN DEFAULT FALSE,
  tier7_completed BOOLEAN DEFAULT FALSE,
  tier8_completed BOOLEAN DEFAULT FALSE,
  
  -- Performance tracking
  mastery_count INTEGER DEFAULT 0,
  secure_count INTEGER DEFAULT 0,
  developing_count INTEGER DEFAULT 0,
  emerging_count INTEGER DEFAULT 0,
  
  -- Streak tracking
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  
  -- Flags
  needs_support BOOLEAN DEFAULT FALSE,
  support_reason TEXT,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_progress_pupil ON writing_progress(pupil_id);
CREATE INDEX idx_progress_current_level ON writing_progress(current_level_number);
CREATE INDEX idx_progress_completed ON writing_progress(programme_completed);
CREATE INDEX idx_progress_needs_support ON writing_progress(needs_support);
```

---

## TABLE: writing_badges

**Purpose:** Define all available badges

```sql
CREATE TABLE writing_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge_id TEXT NOT NULL UNIQUE,
  badge_name TEXT NOT NULL,
  badge_icon TEXT NOT NULL, -- Emoji or icon code
  badge_description TEXT NOT NULL,
  
  -- Earning criteria
  level_id TEXT REFERENCES writing_levels(level_id), -- If level-specific
  tier_number INTEGER, -- If tier-specific
  performance_band TEXT, -- Required band to earn
  
  -- Badge type
  badge_type TEXT NOT NULL, -- 'level', 'tier', 'programme', 'special'
  rarity TEXT, -- 'common', 'uncommon', 'rare', 'legendary'
  
  -- Display
  display_order INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_badges_type ON writing_badges(badge_type);
CREATE INDEX idx_badges_level ON writing_badges(level_id);
```

---

## TABLE: writing_certificates

**Purpose:** Store certificate awards

```sql
CREATE TABLE writing_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certificate_id TEXT NOT NULL UNIQUE,
  certificate_name TEXT NOT NULL,
  certificate_type TEXT NOT NULL, -- 'tier', 'programme'
  
  -- Award criteria
  tier_number INTEGER,
  requires_level_id TEXT REFERENCES writing_levels(level_id),
  minimum_performance_band TEXT,
  
  -- Certificate content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Display
  template TEXT, -- HTML/design template
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_certificates_type ON writing_certificates(certificate_type);
```

---

## TABLE: pupil_certificates_earned

**Purpose:** Track which pupils earned which certificates

```sql
CREATE TABLE pupil_certificates_earned (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pupil_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  certificate_id TEXT NOT NULL REFERENCES writing_certificates(certificate_id),
  
  -- Award details
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  level_completed TEXT REFERENCES writing_levels(level_id),
  final_score INTEGER,
  
  -- Certificate personalization
  pupil_name TEXT NOT NULL,
  teacher_name TEXT,
  school_name TEXT,
  
  UNIQUE(pupil_id, certificate_id)
);

CREATE INDEX idx_pupil_certs_pupil ON pupil_certificates_earned(pupil_id);
CREATE INDEX idx_pupil_certs_cert ON pupil_certificates_earned(certificate_id);
```

---

## SAMPLE DATA: Insert First 5 Levels

```sql
-- LEVEL 1: Sort Your Story Words
INSERT INTO writing_levels (
  level_number,
  tier_number,
  level_id,
  activity_name,
  activity_type,
  learning_objective,
  prompt_title,
  prompt_instructions,
  word_bank,
  rubric,
  passing_threshold,
  expected_time_minutes,
  difficulty_level,
  age_range,
  display_order
) VALUES (
  1,
  1,
  'writing_level_1',
  'Sort Your Story Words',
  'word_sorting',
  'Pupils can categorize words into PEOPLE, PLACES, THINGS',
  'Word Sorting Activity',
  'Copy these 10 words into three groups:

Words: grandmother, park, football, teacher, London, bicycle, doctor, school, book, friend

Write your answers below:

PEOPLE (who?):
_________________________________

PLACES (where?):
_________________________________

THINGS (what objects?):
_________________________________',
  '["grandmother", "park", "football", "teacher", "London", "bicycle", "doctor", "school", "book", "friend"]'::JSONB,
  '{
    "task_completion": {"weight": 30},
    "technical_accuracy": {"weight": 40},
    "understanding": {"weight": 30},
    "scoring_bands": {
      "mastery": {"range": [9, 10], "badge": "🏆 Word Sorting Champion!"},
      "secure": {"range": [8, 8], "badge": "⭐ Word Sorter!"},
      "developing": {"range": [6, 7], "badge": "💪 Learning to Sort!"},
      "emerging": {"range": [0, 5], "badge": "🌱 Starting to Learn!"}
    },
    "error_patterns": {
      "people_place_confusion": "Marks people as places or vice versa",
      "thing_confusion": "Marks people/places as things",
      "random_sorting": "No clear pattern in sorting"
    },
    "correct_answers": {
      "people": ["grandmother", "teacher", "doctor", "friend"],
      "places": ["park", "London", "school"],
      "things": ["football", "bicycle", "book"]
    }
  }'::JSONB,
  80,
  7,
  'foundation',
  '6-7',
  1
);

-- Continue for Levels 2-5...
-- (Similar INSERT statements for each level with full rubrics)
```

---

## FUNCTIONS & TRIGGERS

### Function: Auto-increment attempt_number

```sql
CREATE OR REPLACE FUNCTION set_attempt_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.attempt_number := (
    SELECT COALESCE(MAX(attempt_number), 0) + 1
    FROM writing_attempts
    WHERE pupil_id = NEW.pupil_id
      AND level_id = NEW.level_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_writing_attempt
  BEFORE INSERT ON writing_attempts
  FOR EACH ROW
  EXECUTE FUNCTION set_attempt_number();
```

### Function: Update progress on pass

```sql
CREATE OR REPLACE FUNCTION update_writing_progress()
RETURNS TRIGGER AS $$
DECLARE
  next_level_num INTEGER;
  next_level_tid TEXT;
BEGIN
  IF NEW.passed THEN
    -- Update progress record
    UPDATE writing_progress
    SET
      levels_completed = array_append(levels_completed, NEW.level_id),
      total_levels_passed = total_levels_passed + 1,
      total_attempts = total_attempts + 1,
      total_time_minutes = total_time_minutes + (NEW.time_elapsed_seconds / 60),
      updated_at = NOW()
    WHERE pupil_id = NEW.pupil_id;
    
    -- Increment performance band counter
    UPDATE writing_progress
    SET
      mastery_count = CASE WHEN NEW.performance_band = 'mastery' 
                      THEN mastery_count + 1 ELSE mastery_count END,
      secure_count = CASE WHEN NEW.performance_band = 'secure' 
                     THEN secure_count + 1 ELSE secure_count END,
      developing_count = CASE WHEN NEW.performance_band = 'developing' 
                         THEN developing_count + 1 ELSE developing_count END,
      emerging_count = CASE WHEN NEW.performance_band = 'emerging' 
                       THEN emerging_count + 1 ELSE emerging_count END
    WHERE pupil_id = NEW.pupil_id;
    
    -- Unlock next level
    SELECT level_number + 1, level_id INTO next_level_num, next_level_tid
    FROM writing_levels
    WHERE level_id = NEW.level_id;
    
    IF next_level_num <= 40 THEN
      UPDATE writing_progress
      SET
        current_level_number = next_level_num,
        current_level_id = (
          SELECT level_id FROM writing_levels WHERE level_number = next_level_num
        )
      WHERE pupil_id = NEW.pupil_id;
    END IF;
    
  ELSE
    -- Failed attempt
    UPDATE writing_progress
    SET
      total_levels_failed = total_levels_failed + 1,
      total_attempts = total_attempts + 1,
      total_time_minutes = total_time_minutes + (NEW.time_elapsed_seconds / 60),
      updated_at = NOW()
    WHERE pupil_id = NEW.pupil_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_insert_writing_attempt
  AFTER INSERT ON writing_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_writing_progress();
```

### Function: Mark tier completion

```sql
CREATE OR REPLACE FUNCTION check_tier_completion()
RETURNS TRIGGER AS $$
DECLARE
  tier_num INTEGER;
  tier_complete BOOLEAN;
BEGIN
  -- Get tier number for completed level
  SELECT tier_number INTO tier_num
  FROM writing_levels
  WHERE level_id = NEW.level_id;
  
  -- Check if all levels in tier completed
  SELECT 
    NOT EXISTS (
      SELECT 1 
      FROM writing_levels wl
      WHERE wl.tier_number = tier_num
        AND wl.level_id != ALL(NEW.levels_completed)
    ) INTO tier_complete;
  
  IF tier_complete THEN
    UPDATE writing_progress
    SET
      tiers_completed = array_append(tiers_completed, tier_num)
    WHERE pupil_id = NEW.pupil_id
      AND NOT (tier_num = ANY(tiers_completed));
    
    -- Update tier-specific completion flag
    EXECUTE format('
      UPDATE writing_progress
      SET tier%s_completed = TRUE
      WHERE pupil_id = $1
    ', tier_num)
    USING NEW.pupil_id;
  END IF;
  
  -- Check programme completion (all 40 levels)
  IF array_length(NEW.levels_completed, 1) = 40 THEN
    UPDATE writing_progress
    SET
      programme_completed = TRUE,
      completed_at = NOW()
    WHERE pupil_id = NEW.pupil_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_update_writing_progress
  AFTER UPDATE OF levels_completed ON writing_progress
  FOR EACH ROW
  EXECUTE FUNCTION check_tier_completion();
```

### Function: Calculate average score

```sql
CREATE OR REPLACE FUNCTION calculate_average_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE writing_progress
  SET average_score = (
    SELECT AVG(percentage)::NUMERIC(5,2)
    FROM writing_attempts
    WHERE pupil_id = NEW.pupil_id
  )
  WHERE pupil_id = NEW.pupil_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_insert_attempt_update_avg
  AFTER INSERT ON writing_attempts
  FOR EACH ROW
  EXECUTE FUNCTION calculate_average_score();
```

---

## QUERIES FOR TEACHER DASHBOARD

### Get pupil progress overview

```sql
-- Individual pupil summary
SELECT 
  u.name AS pupil_name,
  wp.current_level_number,
  wl.activity_name AS current_activity,
  wp.total_levels_passed,
  wp.average_score,
  ROUND((wp.total_levels_passed::NUMERIC / 40 * 100), 1) AS completion_percentage,
  wp.mastery_count,
  wp.secure_count,
  wp.current_streak,
  wp.needs_support,
  wp.support_reason
FROM writing_progress wp
JOIN users u ON wp.pupil_id = u.id
JOIN writing_levels wl ON wp.current_level_id = wl.level_id
WHERE wp.pupil_id = $1;
```

### Get class overview

```sql
-- Class writing progress
SELECT 
  wp.current_level_number AS level,
  COUNT(*) AS pupils_at_level
FROM writing_progress wp
JOIN users u ON wp.pupil_id = u.id
WHERE u.class_id = $1
GROUP BY wp.current_level_number
ORDER BY wp.current_level_number;
```

### Get recent attempts for review

```sql
-- Recent attempts flagged for review
SELECT 
  u.name AS pupil_name,
  wl.activity_name,
  wa.percentage AS score,
  wa.performance_band,
  wa.flag_reason,
  wa.time_submitted,
  wa.pupil_writing,
  wa.ai_assessment
FROM writing_attempts wa
JOIN users u ON wa.pupil_id = u.id
JOIN writing_levels wl ON wa.level_id = wl.level_id
WHERE wa.flagged_for_review = TRUE
  AND wa.teacher_reviewed = FALSE
  AND u.class_id = $1
ORDER BY wa.time_submitted DESC;
```

### Get error patterns for class

```sql
-- Most common error patterns in class
SELECT 
  unnest(wa.error_patterns) AS error_pattern,
  COUNT(*) AS frequency,
  wl.tier_number
FROM writing_attempts wa
JOIN users u ON wa.pupil_id = u.id
JOIN writing_levels wl ON wa.level_id = wl.level_id
WHERE u.class_id = $1
  AND wa.time_submitted > NOW() - INTERVAL '7 days'
GROUP BY error_pattern, wl.tier_number
ORDER BY frequency DESC
LIMIT 10;
```

### Get pupils needing intervention

```sql
-- Pupils who need support
SELECT 
  u.name AS pupil_name,
  wp.current_level_number,
  wp.average_score,
  wp.total_levels_failed,
  wp.support_reason,
  (
    SELECT COUNT(*)
    FROM writing_attempts wa
    WHERE wa.pupil_id = u.id
      AND wa.passed = FALSE
      AND wa.time_submitted > NOW() - INTERVAL '7 days'
  ) AS recent_failures
FROM writing_progress wp
JOIN users u ON wp.pupil_id = u.id
WHERE wp.needs_support = TRUE
  AND u.class_id = $1
ORDER BY recent_failures DESC;
```

---

## ROW LEVEL SECURITY (RLS)

### Enable RLS on all tables

```sql
ALTER TABLE writing_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pupil_certificates_earned ENABLE ROW LEVEL SECURITY;
```

### Policies for pupils

```sql
-- Pupils can read all level definitions
CREATE POLICY "Pupils can view all levels"
  ON writing_levels FOR SELECT
  TO authenticated
  USING (true);

-- Pupils can only see their own attempts
CREATE POLICY "Pupils see own attempts"
  ON writing_attempts FOR SELECT
  TO authenticated
  USING (pupil_id = auth.uid());

-- Pupils can insert their own attempts
CREATE POLICY "Pupils create own attempts"
  ON writing_attempts FOR INSERT
  TO authenticated
  WITH CHECK (pupil_id = auth.uid());

-- Pupils see only their progress
CREATE POLICY "Pupils see own progress"
  ON writing_progress FOR SELECT
  TO authenticated
  USING (pupil_id = auth.uid());

-- Pupils can update their own progress
CREATE POLICY "Pupils update own progress"
  ON writing_progress FOR UPDATE
  TO authenticated
  USING (pupil_id = auth.uid());
```

### Policies for teachers

```sql
-- Teachers can see all attempts for their classes
CREATE POLICY "Teachers see class attempts"
  ON writing_attempts FOR SELECT
  TO authenticated
  USING (
    pupil_id IN (
      SELECT id FROM users 
      WHERE class_id IN (
        SELECT class_id FROM users WHERE id = auth.uid() AND role = 'teacher'
      )
    )
  );

-- Teachers can update attempts (for review)
CREATE POLICY "Teachers review attempts"
  ON writing_attempts FOR UPDATE
  TO authenticated
  USING (
    pupil_id IN (
      SELECT id FROM users 
      WHERE class_id IN (
        SELECT class_id FROM users WHERE id = auth.uid() AND role = 'teacher'
      )
    )
  );

-- Teachers see progress for their classes
CREATE POLICY "Teachers see class progress"
  ON writing_progress FOR SELECT
  TO authenticated
  USING (
    pupil_id IN (
      SELECT id FROM users 
      WHERE class_id IN (
        SELECT class_id FROM users WHERE id = auth.uid() AND role = 'teacher'
      )
    )
  );
```

---

## INITIALIZATION SCRIPT

```sql
-- Run this after creating all tables

-- Insert all 40 levels (you'll need to run full INSERT for each)
-- See separate SQL file: writing_levels_all_40_INSERT.sql

-- Create initial badges
INSERT INTO writing_badges (badge_id, badge_name, badge_icon, badge_description, badge_type, rarity) VALUES
('tier1_gold', 'Tier 1 Champion', '🏆', 'Mastered word awareness', 'tier', 'uncommon'),
('tier2_gold', 'Tier 2 Champion', '🏆', 'Mastered word combinations', 'tier', 'uncommon'),
('tier3_gold', 'Tier 3 Champion', '🏆', 'Mastered simple sentences', 'tier', 'rare'),
('tier4_gold', 'Tier 4 Champion', '🏆', 'Mastered sentence expansion', 'tier', 'rare'),
('tier5_gold', 'Tier 5 Champion', '🏆', 'Mastered sequencing', 'tier', 'rare'),
('tier6_gold', 'Tier 6 Champion', '🏆', 'Mastered story structure', 'tier', 'rare'),
('tier7_gold', 'Tier 7 Champion', '🏆', 'Mastered enhanced sentences', 'tier', 'rare'),
('tier8_gold', 'Tier 8 Champion', '🏆', 'Mastered narratives', 'tier', 'legendary'),
('programme_complete', 'WriFe Writing Master', '🏆📚', 'Completed entire programme', 'programme', 'legendary'),
('first_story', 'Story Writer', '📚', 'Wrote first complete story', 'special', 'uncommon'),
('perfect_score', 'Perfectionist', '💯', 'Achieved 100% on a level', 'special', 'common');

-- Create certificates
INSERT INTO writing_certificates (certificate_id, certificate_name, certificate_type, tier_number, title, description) VALUES
('tier1_completion', 'Tier 1 Completion', 'tier', 1, 'Word Awareness Mastery', 'Successfully completed Tier 1'),
('tier2_completion', 'Tier 2 Completion', 'tier', 2, 'Word Combinations Mastery', 'Successfully completed Tier 2'),
('tier3_completion', 'Tier 3 Completion', 'tier', 3, 'Simple Sentences Mastery', 'Successfully completed Tier 3'),
('tier4_completion', 'Tier 4 Completion', 'tier', 4, 'Sentence Expansion Mastery', 'Successfully completed Tier 4'),
('tier5_completion', 'Tier 5 Completion', 'tier', 5, 'Sequencing Mastery', 'Successfully completed Tier 5'),
('tier6_completion', 'Tier 6 Completion', 'tier', 6, 'Story Structure Mastery', 'Successfully completed Tier 6'),
('tier7_completion', 'Tier 7 Completion', 'tier', 7, 'Enhanced Sentences Mastery', 'Successfully completed Tier 7'),
('tier8_completion', 'Tier 8 Completion', 'tier', 8, 'Narrative Writing Mastery', 'Successfully completed Tier 8'),
('programme_completion', 'Programme Completion', 'programme', NULL, 'WriFe Writing Master Certificate', 'Successfully completed all 40 levels of WriFe Writing Programme');
```

---

**DATABASE SCHEMA COMPLETE: Ready for implementation!**
