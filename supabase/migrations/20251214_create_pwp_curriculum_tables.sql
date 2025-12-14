-- PWP Curriculum Tables for L10-67 Rewriting Mechanic System
-- Created: December 2025
-- Purpose: Support progressive writing practice with formula-based sentence building

-- 1. curriculum_map - Maps lessons (L10-67) to grammar concepts taught
CREATE TABLE IF NOT EXISTS curriculum_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_number INTEGER UNIQUE NOT NULL CHECK (lesson_number BETWEEN 10 AND 67),
    lesson_name VARCHAR(255) NOT NULL,
    
    concepts_introduced TEXT[] NOT NULL,
    concepts_cumulative TEXT[] NOT NULL,
    
    pwp_stage VARCHAR(20) NOT NULL 
        CHECK (pwp_stage IN ('foundation', 'development', 'application', 'advanced')),
    pwp_duration_minutes INTEGER NOT NULL DEFAULT 5,
    pwp_formula_count_min INTEGER NOT NULL DEFAULT 2,
    pwp_formula_count_max INTEGER NOT NULL DEFAULT 4,
    paragraph_writing_enabled BOOLEAN DEFAULT false,
    
    subject_assignment_type VARCHAR(20) DEFAULT 'given'
        CHECK (subject_assignment_type IN ('given', 'free_choice', 'conditional')),
    subject_condition VARCHAR(255),
    subject_ideas TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_curriculum_lesson_number ON curriculum_map(lesson_number);
CREATE INDEX IF NOT EXISTS idx_curriculum_stage ON curriculum_map(pwp_stage);

-- 2. pwp_sessions - Individual PWP practice sessions
CREATE TABLE IF NOT EXISTS pwp_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pupil_id UUID NOT NULL,
    lesson_number INTEGER REFERENCES curriculum_map(lesson_number) NOT NULL,
    class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    subject_text VARCHAR(100) NOT NULL,
    subject_type VARCHAR(20) CHECK (subject_type IN ('person', 'animal', 'place', 'thing')),
    
    status VARCHAR(20) DEFAULT 'in_progress' 
        CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    formulas_completed INTEGER DEFAULT 0,
    formulas_total INTEGER NOT NULL,
    accuracy_percentage DECIMAL(5,2),
    
    word_repetition_stats JSONB DEFAULT '{}',
    mastery_scores JSONB DEFAULT '{}',
    
    UNIQUE(pupil_id, lesson_number, started_at)
);

CREATE INDEX IF NOT EXISTS idx_pwp_sessions_pupil ON pwp_sessions(pupil_id);
CREATE INDEX IF NOT EXISTS idx_pwp_sessions_lesson ON pwp_sessions(lesson_number);
CREATE INDEX IF NOT EXISTS idx_pwp_sessions_status ON pwp_sessions(status);
CREATE INDEX IF NOT EXISTS idx_pwp_sessions_class ON pwp_sessions(class_id);

-- 3. pwp_formulas - Individual formula attempts within sessions
CREATE TABLE IF NOT EXISTS pwp_formulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES pwp_sessions(id) ON DELETE CASCADE NOT NULL,
    
    formula_number INTEGER NOT NULL CHECK (formula_number >= 1),
    formula_structure TEXT NOT NULL,
    labelled_example TEXT NOT NULL,
    
    word_bank TEXT[] DEFAULT '{}',
    new_elements TEXT[] NOT NULL,
    hint_text TEXT,
    
    pupil_sentence TEXT,
    attempts INTEGER DEFAULT 0,
    
    is_correct BOOLEAN,
    errors_detected JSONB DEFAULT '[]',
    ai_feedback_given JSONB DEFAULT '[]',
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(session_id, formula_number)
);

CREATE INDEX IF NOT EXISTS idx_pwp_formulas_session ON pwp_formulas(session_id);
CREATE INDEX IF NOT EXISTS idx_pwp_formulas_correct ON pwp_formulas(is_correct);

-- 4. formula_attempts - Track multiple attempts at same formula
CREATE TABLE IF NOT EXISTS formula_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formula_id UUID REFERENCES pwp_formulas(id) ON DELETE CASCADE NOT NULL,
    
    attempt_number INTEGER NOT NULL,
    pupil_sentence TEXT NOT NULL,
    words_clicked TEXT[] DEFAULT '{}',
    words_typed TEXT[] DEFAULT '{}',
    
    errors_detected JSONB DEFAULT '[]',
    feedback_provided JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_formula_attempts_formula ON formula_attempts(formula_id);

-- 5. concept_mastery - Tracks individual concept mastery per pupil
CREATE TABLE IF NOT EXISTS concept_mastery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pupil_id UUID NOT NULL,
    concept VARCHAR(100) NOT NULL,
    
    lesson_introduced INTEGER NOT NULL,
    current_lesson INTEGER NOT NULL DEFAULT 10,
    
    total_uses INTEGER DEFAULT 0,
    correct_uses INTEGER DEFAULT 0,
    
    recent_uses INTEGER DEFAULT 0,
    recent_correct INTEGER DEFAULT 0,
    
    trend VARCHAR(20) CHECK (trend IN ('improving', 'stable', 'declining')),
    mastery_status VARCHAR(20) DEFAULT 'new'
        CHECK (mastery_status IN ('new', 'emerging', 'practicing', 'mastered', 'needs_support')),
    
    last_used TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(pupil_id, concept)
);

CREATE INDEX IF NOT EXISTS idx_concept_mastery_pupil ON concept_mastery(pupil_id);
CREATE INDEX IF NOT EXISTS idx_concept_mastery_concept ON concept_mastery(concept);
CREATE INDEX IF NOT EXISTS idx_concept_mastery_status ON concept_mastery(mastery_status);

-- 6. pwp_class_assignments - Teacher assigns PWP lessons to classes
CREATE TABLE IF NOT EXISTS pwp_class_assignments (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
    lesson_number INTEGER REFERENCES curriculum_map(lesson_number) NOT NULL,
    teacher_id UUID NOT NULL,
    
    assigned_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    is_active BOOLEAN DEFAULT true,
    
    custom_instructions TEXT,
    custom_subject TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(class_id, lesson_number, assigned_date)
);

CREATE INDEX IF NOT EXISTS idx_pwp_class_assignments_class ON pwp_class_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_pwp_class_assignments_active ON pwp_class_assignments(is_active);

-- Enable RLS for security
ALTER TABLE curriculum_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwp_formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE formula_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE concept_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwp_class_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for curriculum_map (read-only for all authenticated users)
CREATE POLICY "curriculum_map_read_all" ON curriculum_map
    FOR SELECT TO authenticated USING (true);

-- RLS Policies for pwp_sessions
CREATE POLICY "pwp_sessions_pupil_own" ON pwp_sessions
    FOR ALL TO authenticated
    USING (pupil_id = auth.uid());

CREATE POLICY "pwp_sessions_teacher_class" ON pwp_sessions
    FOR SELECT TO authenticated
    USING (
        class_id IN (
            SELECT id FROM classes WHERE teacher_id = auth.uid()
        )
    );

-- RLS Policies for pwp_formulas (through session access)
CREATE POLICY "pwp_formulas_session_access" ON pwp_formulas
    FOR ALL TO authenticated
    USING (
        session_id IN (
            SELECT id FROM pwp_sessions WHERE pupil_id = auth.uid()
        )
    );

-- RLS Policies for formula_attempts
CREATE POLICY "formula_attempts_access" ON formula_attempts
    FOR ALL TO authenticated
    USING (
        formula_id IN (
            SELECT pf.id FROM pwp_formulas pf
            JOIN pwp_sessions ps ON pf.session_id = ps.id
            WHERE ps.pupil_id = auth.uid()
        )
    );

-- RLS Policies for concept_mastery
CREATE POLICY "concept_mastery_own" ON concept_mastery
    FOR ALL TO authenticated
    USING (pupil_id = auth.uid());

CREATE POLICY "concept_mastery_teacher_view" ON concept_mastery
    FOR SELECT TO authenticated
    USING (
        pupil_id IN (
            SELECT cm.pupil_id FROM class_members cm
            JOIN classes c ON cm.class_id = c.id
            WHERE c.teacher_id = auth.uid()
        )
    );

-- RLS Policies for pwp_class_assignments
CREATE POLICY "pwp_class_assignments_teacher" ON pwp_class_assignments
    FOR ALL TO authenticated
    USING (teacher_id = auth.uid());

CREATE POLICY "pwp_class_assignments_pupil_view" ON pwp_class_assignments
    FOR SELECT TO authenticated
    USING (
        class_id IN (
            SELECT class_id FROM class_members WHERE pupil_id = auth.uid()
        )
    );

-- Service role bypass for admin operations
CREATE POLICY "service_role_all_curriculum_map" ON curriculum_map
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_pwp_sessions" ON pwp_sessions
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_pwp_formulas" ON pwp_formulas
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_formula_attempts" ON formula_attempts
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_concept_mastery" ON concept_mastery
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_pwp_class_assignments" ON pwp_class_assignments
    FOR ALL TO service_role USING (true) WITH CHECK (true);
