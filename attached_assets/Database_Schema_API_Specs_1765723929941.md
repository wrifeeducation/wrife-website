# Database Schema & API Specifications
## WriFe PWP Digital Platform - Technical Architecture

**Version:** 1.0  
**Created:** December 2025  
**Technology Stack:** Supabase (PostgreSQL) + Next.js + Vercel  
**Purpose:** Complete backend architecture for PWP independent practice system

---

# ARCHITECTURE OVERVIEW

## System Components

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                   │
│  - Pupil PWP Interface                                  │
│  - Teacher Dashboard                                    │
│  - Word Bank UI                                         │
│  - Progress Visualization                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ API Calls
                     ↓
┌─────────────────────────────────────────────────────────┐
│              API LAYER (Next.js API Routes)             │
│  - Formula Generation                                   │
│  - Feedback Engine                                      │
│  - Mastery Calculation                                  │
│  - Analytics                                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Database Queries
                     ↓
┌─────────────────────────────────────────────────────────┐
│           DATABASE (Supabase PostgreSQL)                │
│  - Users & Classes                                      │
│  - PWP Sessions & Formulas                              │
│  - Mastery Tracking                                     │
│  - Curriculum Map                                       │
└─────────────────────────────────────────────────────────┘
```

---

# DATABASE SCHEMA

## Core Tables

### 1. users
Stores pupil and teacher accounts

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('pupil', 'teacher', 'admin')),
    class_id UUID REFERENCES classes(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    preferences JSONB DEFAULT '{}',
    
    -- User settings
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_users_class ON users(class_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
```

---

### 2. classes
Teacher's class groups

```sql
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    teacher_id UUID REFERENCES users(id) NOT NULL,
    year_group INTEGER NOT NULL CHECK (year_group BETWEEN 3 AND 6),
    school_id UUID REFERENCES schools(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    -- Class settings
    settings JSONB DEFAULT '{
        "pwp_enabled": true,
        "default_duration": 10,
        "require_paragraph_writing": true
    }'
);

CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_classes_school ON classes(school_id);
```

---

### 3. schools
School organizations

```sql
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    postcode VARCHAR(10),
    subscription_tier VARCHAR(20) DEFAULT 'basic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settings JSONB DEFAULT '{}'
);
```

---

### 4. curriculum_map
Maps lessons to concepts taught

```sql
CREATE TABLE curriculum_map (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_number INTEGER UNIQUE NOT NULL CHECK (lesson_number BETWEEN 1 AND 67),
    lesson_name VARCHAR(255) NOT NULL,
    
    -- Concepts introduced in this lesson
    concepts_introduced TEXT[] NOT NULL,
    
    -- All concepts pupils should know by this lesson (cumulative)
    concepts_cumulative TEXT[] NOT NULL,
    
    -- PWP specific info
    pwp_stage VARCHAR(20) NOT NULL 
        CHECK (pwp_stage IN ('foundation', 'development', 'application', 'advanced')),
    pwp_duration_minutes INTEGER NOT NULL,
    pwp_formula_count_min INTEGER NOT NULL,
    pwp_formula_count_max INTEGER NOT NULL,
    paragraph_writing_enabled BOOLEAN DEFAULT false,
    
    -- Subject selection for this lesson
    subject_assignment_type VARCHAR(20) 
        CHECK (subject_assignment_type IN ('given', 'free_choice', 'conditional')),
    subject_condition VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed data example
INSERT INTO curriculum_map (
    lesson_number, lesson_name, 
    concepts_introduced, concepts_cumulative,
    pwp_stage, pwp_duration_minutes,
    pwp_formula_count_min, pwp_formula_count_max,
    paragraph_writing_enabled,
    subject_assignment_type, subject_condition
) VALUES (
    23, 'Fronted Adverbials',
    ARRAY['fronted_adverbial'],
    ARRAY['noun', 'verb', 'determiner', 'adjective', 'adverb', 
          'preposition', 'prepositional_phrase', 'fronted_adverbial'],
    'development', 10, 5, 7, true,
    'conditional', 'Choose a PLACE (not person/animal/thing)'
);

CREATE INDEX idx_curriculum_lesson_number ON curriculum_map(lesson_number);
```

---

### 5. pwp_sessions
Individual PWP session instances

```sql
CREATE TABLE pwp_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pupil_id UUID REFERENCES users(id) NOT NULL,
    lesson_number INTEGER REFERENCES curriculum_map(lesson_number) NOT NULL,
    
    -- Session metadata
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Subject chosen
    subject_text VARCHAR(100) NOT NULL,
    subject_type VARCHAR(20) CHECK (subject_type IN ('person', 'animal', 'place', 'thing')),
    
    -- Session outcomes
    status VARCHAR(20) DEFAULT 'in_progress' 
        CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    formulas_completed INTEGER DEFAULT 0,
    formulas_total INTEGER NOT NULL,
    accuracy_percentage DECIMAL(5,2),
    paragraph_completed BOOLEAN DEFAULT false,
    
    -- Performance data
    mastery_scores JSONB DEFAULT '{}',
    
    UNIQUE(pupil_id, lesson_number, started_at)
);

CREATE INDEX idx_pwp_sessions_pupil ON pwp_sessions(pupil_id);
CREATE INDEX idx_pwp_sessions_lesson ON pwp_sessions(lesson_number);
CREATE INDEX idx_pwp_sessions_status ON pwp_sessions(status);
CREATE INDEX idx_pwp_sessions_completed ON pwp_sessions(completed_at);
```

---

### 6. pwp_formulas
Individual formula attempts within sessions

```sql
CREATE TABLE pwp_formulas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES pwp_sessions(id) ON DELETE CASCADE NOT NULL,
    
    -- Formula identification
    formula_number INTEGER NOT NULL CHECK (formula_number >= 1),
    formula_structure TEXT NOT NULL, -- e.g., "det + adj + noun + adverb + verb"
    
    -- Formula specification
    labelled_example TEXT NOT NULL,
    word_bank TEXT[], -- Previous words for clicking
    new_elements TEXT[], -- Word classes being added
    
    -- Pupil's work
    pupil_sentence TEXT,
    attempts INTEGER DEFAULT 0,
    
    -- Evaluation
    is_correct BOOLEAN,
    errors_detected JSONB DEFAULT '[]',
    ai_feedback_given JSONB DEFAULT '[]',
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(session_id, formula_number)
);

CREATE INDEX idx_pwp_formulas_session ON pwp_formulas(session_id);
CREATE INDEX idx_pwp_formulas_correct ON pwp_formulas(is_correct);
```

---

### 7. formula_attempts
Tracks multiple attempts at same formula

```sql
CREATE TABLE formula_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    formula_id UUID REFERENCES pwp_formulas(id) ON DELETE CASCADE NOT NULL,
    
    attempt_number INTEGER NOT NULL,
    pupil_sentence TEXT NOT NULL,
    
    -- Analysis
    errors_detected JSONB DEFAULT '[]',
    feedback_provided JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_formula_attempts_formula ON formula_attempts(formula_id);
```

---

### 8. paragraph_writing
Paragraph composition for sessions

```sql
CREATE TABLE paragraph_writing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES pwp_sessions(id) ON DELETE CASCADE NOT NULL,
    
    -- Topic sentence (from final formula)
    topic_sentence TEXT NOT NULL,
    
    -- Prompting
    prompt_questions JSONB NOT NULL,
    prompt_type VARCHAR(50) NOT NULL 
        CHECK (prompt_type IN ('before_after', 'sensory', 'character', 'thematic')),
    
    -- Pupil's paragraph
    paragraph_text TEXT,
    word_count INTEGER,
    sentence_count INTEGER,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(session_id)
);

CREATE INDEX idx_paragraph_session ON paragraph_writing(session_id);
```

---

### 9. concept_mastery
Tracks individual concept mastery per pupil

```sql
CREATE TABLE concept_mastery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pupil_id UUID REFERENCES users(id) NOT NULL,
    concept VARCHAR(100) NOT NULL,
    
    -- Mastery calculation inputs
    lesson_introduced INTEGER NOT NULL,
    current_lesson INTEGER NOT NULL,
    lessons_since_intro INTEGER GENERATED ALWAYS AS (current_lesson - lesson_introduced) STORED,
    
    -- Accuracy tracking
    total_uses INTEGER DEFAULT 0,
    correct_uses INTEGER DEFAULT 0,
    overall_accuracy DECIMAL(5,2) GENERATED ALWAYS AS 
        (CASE WHEN total_uses > 0 THEN (correct_uses::DECIMAL / total_uses * 100) ELSE 0 END) STORED,
    
    -- Recent performance (last 5 sessions)
    recent_uses INTEGER DEFAULT 0,
    recent_correct INTEGER DEFAULT 0,
    recent_accuracy DECIMAL(5,2) GENERATED ALWAYS AS
        (CASE WHEN recent_uses > 0 THEN (recent_correct::DECIMAL / recent_uses * 100) ELSE 0 END) STORED,
    
    -- Trend
    trend VARCHAR(20) CHECK (trend IN ('improving', 'stable', 'declining')),
    
    -- Mastery status
    mastery_score INTEGER, -- Calculated by API
    mastery_status VARCHAR(20) 
        CHECK (mastery_status IN ('new', 'emerging', 'practicing', 'mastered', 'needs_support')),
    
    -- Timestamps
    last_used TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(pupil_id, concept)
);

CREATE INDEX idx_concept_mastery_pupil ON concept_mastery(pupil_id);
CREATE INDEX idx_concept_mastery_concept ON concept_mastery(concept);
CREATE INDEX idx_concept_mastery_status ON concept_mastery(mastery_status);
```

---

### 10. remedial_sessions
Automatic remedial micro-sessions

```sql
CREATE TABLE remedial_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pupil_id UUID REFERENCES users(id) NOT NULL,
    
    -- What triggered remediation
    trigger_session_id UUID REFERENCES pwp_sessions(id),
    trigger_concept VARCHAR(100) NOT NULL,
    trigger_reason TEXT,
    
    -- Remedial practice
    practice_formulas JSONB NOT NULL, -- Array of remedial formulas
    
    -- Completion
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    performance_improvement BOOLEAN,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_remedial_pupil ON remedial_sessions(pupil_id);
CREATE INDEX idx_remedial_completed ON remedial_sessions(completed);
```

---

### 11. teacher_interventions
Records of teacher actions based on dashboard data

```sql
CREATE TABLE teacher_interventions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES users(id) NOT NULL,
    
    -- What prompted intervention
    trigger_type VARCHAR(50) NOT NULL 
        CHECK (trigger_type IN ('individual_persistent', 'small_group', 'whole_class', 'pattern_alert')),
    
    -- Who/what affected
    affected_pupils UUID[], -- Array of pupil IDs
    affected_concept VARCHAR(100),
    
    -- Intervention details
    intervention_type VARCHAR(50) NOT NULL
        CHECK (intervention_type IN ('one_to_one', 'small_group_lesson', 
                                      'main_lesson_adjustment', 'conference', 'other')),
    notes TEXT,
    
    -- Timing
    planned_for DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interventions_teacher ON teacher_interventions(teacher_id);
CREATE INDEX idx_interventions_planned ON teacher_interventions(planned_for);
```

---

### 12. dashboard_alerts
Pattern recognition alerts for teachers

```sql
CREATE TABLE dashboard_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) NOT NULL,
    teacher_id UUID REFERENCES users(id) NOT NULL,
    
    -- Alert details
    alert_type VARCHAR(50) NOT NULL
        CHECK (alert_type IN ('widespread_error', 'individual_stuck', 
                              'concept_confusion', 'time_overrun')),
    severity VARCHAR(20) NOT NULL 
        CHECK (severity IN ('info', 'warning', 'critical')),
    
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Associated data
    affected_pupils UUID[],
    lesson_number INTEGER,
    concept VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    
    -- Status
    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alerts_class ON dashboard_alerts(class_id);
CREATE INDEX idx_alerts_teacher ON dashboard_alerts(teacher_id);
CREATE INDEX idx_alerts_status ON dashboard_alerts(status);
CREATE INDEX idx_alerts_created ON dashboard_alerts(created_at);
```

---

# API ENDPOINTS

## Authentication

### POST /api/auth/login
```typescript
Request:
{
  email: string;
  password: string;
}

Response:
{
  user: {
    id: string;
    email: string;
    full_name: string;
    role: 'pupil' | 'teacher' | 'admin';
    class_id?: string;
  };
  token: string;
}
```

---

## PWP Session Management

### POST /api/pwp/start-session
Start a new PWP session

```typescript
Request:
{
  pupil_id: string;
  lesson_number: number;
  subject_text: string;
  subject_type: 'person' | 'animal' | 'place' | 'thing';
}

Response:
{
  session_id: string;
  lesson_number: number;
  subject: string;
  formulas: Array<{
    formula_number: number;
    formula_structure: string;
    labelled_example: string;
    word_bank: string[];
    new_elements: string[];
    hints: string[];
  }>;
  paragraph_writing_enabled: boolean;
  expected_duration_minutes: number;
}
```

**Logic:**
1. Query curriculum_map for lesson details
2. Get pupil's concept_mastery data
3. Generate formulas using mastery-adaptive algorithm
4. Create pwp_sessions record
5. Create pwp_formulas records for each formula
6. Return session configuration

---

### POST /api/pwp/submit-formula
Submit a formula attempt

```typescript
Request:
{
  session_id: string;
  formula_number: number;
  pupil_sentence: string;
}

Response:
{
  is_correct: boolean;
  feedback?: {
    type: 'success' | 'error';
    message: string;
    socratic_questions?: string[];
    hints?: string[];
  };
  word_bank_updated: string[]; // For next formula
  repetition_count?: {
    [word: string]: number;
  };
  next_formula?: {
    formula_number: number;
    formula_structure: string;
    labelled_example: string;
    word_bank: string[];
  };
}
```

**Logic:**
1. Parse pupil_sentence
2. Compare to formula_structure requirements
3. Identify errors (word class, order, missing elements)
4. Generate Socratic feedback if errors
5. Update pwp_formulas record
6. Create formula_attempts record
7. Update concept_mastery for used concepts
8. If correct, prepare next formula
9. Return appropriate response

---

### POST /api/pwp/complete-session
Complete a PWP session

```typescript
Request:
{
  session_id: string;
  paragraph_text?: string;
}

Response:
{
  session_summary: {
    formulas_completed: number;
    formulas_total: number;
    accuracy_percentage: number;
    duration_minutes: number;
    repetition_stats: {
      [word: string]: number;
    };
    achievements: string[];
  };
  mastery_updates: Array<{
    concept: string;
    previous_status: string;
    new_status: string;
  }>;
  remedial_triggered: boolean;
  remedial_concepts?: string[];
}
```

**Logic:**
1. Update pwp_sessions with completion data
2. Calculate session accuracy
3. Update concept_mastery for all concepts used
4. Check if remediation needed (mastery_score < 70)
5. Create remedial_sessions if needed
6. Return summary with achievements

---

## Formula Generation

### POST /api/formula/generate-adaptive
Generate formulas based on pupil mastery

```typescript
Request:
{
  pupil_id: string;
  lesson_number: number;
  subject_text: string;
  formula_count: number;
}

Response:
{
  formulas: Array<{
    formula_number: number;
    formula_structure: string;
    concepts_used: string[];
    difficulty_level: 'foundation' | 'developing' | 'challenge';
    labelled_example: string;
    word_bank: string[]; // Empty for F1, populated for F2+
    new_elements: string[];
  }>;
}
```

**Algorithm:**
```typescript
function generateAdaptiveFormulas(
  pupilId: string,
  lessonNumber: number,
  subject: string,
  count: number
): Formula[] {
  // 1. Get curriculum baseline
  const baseline = getCurriculumConcepts(lessonNumber);
  
  // 2. Get pupil mastery data
  const mastery = getPupilMastery(pupilId, baseline);
  
  // 3. Generate progression
  const formulas = [];
  let currentFormula = `${subject} + verb`; // F1 always starts simple
  
  formulas.push({
    formula_number: 1,
    formula_structure: currentFormula,
    concepts_used: ['noun', 'verb'],
    word_bank: [],
    new_elements: ['noun', 'verb']
  });
  
  // 4. Build subsequent formulas
  for (let i = 2; i <= count; i++) {
    // Early formulas: use MASTERED concepts
    if (i <= Math.floor(count * 0.5)) {
      const masteredConcepts = mastery.filter(m => m.status === 'MASTERED');
      const nextConcept = selectConcept(masteredConcepts);
      currentFormula = addElement(currentFormula, nextConcept);
    }
    // Middle formulas: use PRACTICING concepts
    else if (i <= Math.floor(count * 0.8)) {
      const practicingConcepts = mastery.filter(m => m.status === 'PRACTICING');
      const nextConcept = selectConcept(practicingConcepts);
      currentFormula = addElement(currentFormula, nextConcept);
    }
    // Late formulas: challenge with NEW/NEEDS_SUPPORT
    else {
      const challengeConcepts = mastery.filter(m => 
        m.status === 'NEW' || m.status === 'NEEDS_SUPPORT'
      );
      const nextConcept = selectConcept(challengeConcepts);
      currentFormula = addElement(currentFormula, nextConcept);
    }
    
    formulas.push({
      formula_number: i,
      formula_structure: currentFormula,
      concepts_used: extractConcepts(currentFormula),
      word_bank: extractWords(formulas[i-2].example), // Previous formula words
      new_elements: [nextConcept]
    });
  }
  
  return formulas;
}
```

---

## Feedback Engine

### POST /api/feedback/generate-socratic
Generate Socratic feedback for error

```typescript
Request:
{
  pupil_sentence: string;
  expected_formula: string;
  errors_detected: Array<{
    error_type: 'wrong_word_class' | 'missing_element' | 'wrong_order' | 'tense_mismatch';
    location: string;
    expected: string;
    actual: string;
  }>;
}

Response:
{
  feedback: {
    type: 'socratic';
    questions: string[];
    hints: string[];
    progressive: {
      attempt_1: string[];
      attempt_2: string[];
      attempt_3: string;
    };
  };
}
```

**Logic:**
```typescript
function generateSocraticFeedback(errors: Error[]): Feedback {
  const primaryError = errors[0]; // Focus on first error
  
  switch(primaryError.error_type) {
    case 'wrong_word_class':
      return {
        questions: [
          `Look at "${primaryError.actual}" - what word class is it?`,
          `You're describing ${getDescriptionTarget(primaryError)}, right?`,
          `What word class should we use to describe ${getDescriptionTarget(primaryError)}?`,
          `Can you change "${primaryError.actual}" to the ${primaryError.expected} form?`
        ],
        hints: [
          `Think about whether this describes a noun or a verb`,
          `Most adverbs end in "-ly"`
        ]
      };
    
    case 'missing_element':
      return {
        questions: [
          `The formula needs: ${getFormula()}`,
          `You have: ${getActualStructure()}`,
          `What's missing?`,
          `A ${primaryError.expected} tells us ${getFunction(primaryError.expected)}`,
          `Which ${primaryError.expected} fits your sentence?`
        ],
        hints: [
          `Look at the labelled example for guidance`
        ]
      };
    
    // ... other error types
  }
}
```

---

## Mastery Calculation

### POST /api/mastery/calculate
Calculate mastery score for concept

```typescript
Request:
{
  pupil_id: string;
  concept: string;
  current_lesson: number;
}

Response:
{
  concept: string;
  mastery_score: number; // 0-100
  mastery_status: 'new' | 'emerging' | 'practicing' | 'mastered' | 'needs_support';
  factors: {
    time_weight: number;
    accuracy_weight: number;
    trend_weight: number;
  };
  recommendation: string;
}
```

**Algorithm:**
```typescript
function calculateMasteryScore(
  pupilId: string,
  concept: string,
  currentLesson: number
): MasteryScore {
  const data = getConceptMastery(pupilId, concept);
  
  // PRIMARY FACTOR: Time since introduction (60% weight)
  const lessonsSince = currentLesson - data.lesson_introduced;
  let timeWeight = 0;
  if (lessonsSince >= 10) timeWeight = 60;
  else if (lessonsSince >= 5) timeWeight = 40;
  else if (lessonsSince >= 3) timeWeight = 25;
  else timeWeight = 10;
  
  // SECONDARY FACTOR: Overall accuracy (30% weight)
  let accuracyWeight = 0;
  if (data.overall_accuracy >= 80) accuracyWeight = 30;
  else if (data.overall_accuracy >= 70) accuracyWeight = 22;
  else if (data.overall_accuracy >= 60) accuracyWeight = 15;
  else accuracyWeight = 8;
  
  // TERTIARY FACTOR: Recent trend (10% weight)
  let trendWeight = 0;
  if (data.trend === 'improving') trendWeight = 10;
  else if (data.trend === 'stable') trendWeight = 7;
  else trendWeight = 3;
  
  const totalScore = timeWeight + accuracyWeight + trendWeight;
  
  // Determine status
  let status;
  if (totalScore >= 85) status = 'MASTERED';
  else if (totalScore >= 70) status = 'PRACTICING';
  else if (totalScore >= 50) status = 'EMERGING';
  else if (lessonsSince < 3) status = 'NEW';
  else status = 'NEEDS_SUPPORT';
  
  return {
    concept,
    mastery_score: totalScore,
    mastery_status: status,
    factors: { timeWeight, accuracyWeight, trendWeight }
  };
}
```

---

### POST /api/mastery/batch-update
Update mastery for multiple concepts after session

```typescript
Request:
{
  session_id: string;
  concept_performances: Array<{
    concept: string;
    uses: number;
    correct: number;
  }>;
}

Response:
{
  updated_concepts: Array<{
    concept: string;
    previous_status: string;
    new_status: string;
    status_changed: boolean;
  }>;
  remediation_needed: string[];
}
```

---

## Paragraph Generation

### POST /api/paragraph/generate-questions
Generate contextual paragraph questions

```typescript
Request:
{
  topic_sentence: string;
  prompt_type: 'before_after' | 'sensory' | 'character' | 'thematic';
  theme?: string; // For thematic type
}

Response:
{
  questions: string[];
  prompt_guidance: string;
}
```

**Algorithm:**
```typescript
function generateParagraphQuestions(
  topicSentence: string,
  promptType: string,
  theme?: string
): Questions {
  // Analyze sentence semantically
  const analysis = analyzeSentence(topicSentence);
  // {
  //   subject: { text: 'library', type: 'place' },
  //   action: { text: 'opens', tense: 'present', type: 'state' },
  //   modifiers: ['quietly', 'in the morning'],
  //   sentiment: 'neutral'
  // }
  
  switch(promptType) {
    case 'before_after':
      if (analysis.action.type === 'action') {
        return {
          questions: [
            `Where was ${analysis.subject.text} before ${analysis.action.text}?`,
            `Why did ${analysis.subject.text} ${analysis.action.text}?`,
            `What happened after ${analysis.subject.text} ${analysis.action.past_tense}?`
          ]
        };
      } else if (analysis.subject.type === 'place') {
        return {
          questions: [
            `What was happening at ${analysis.subject.text} before it ${analysis.action.text}?`,
            `Why does ${analysis.subject.text} ${analysis.action.text} ${analysis.modifiers.join(' ')}?`,
            `Who arrives when ${analysis.subject.text} ${analysis.action.text}?`
          ]
        };
      }
      break;
    
    case 'sensory':
      return {
        questions: [
          `What does ${analysis.subject.text} look like?`,
          `What sounds can you hear ${detectLocation(analysis)}?`,
          `How does it feel to be ${detectLocation(analysis)}?`,
          `Who is there? What are they doing?`
        ]
      };
    
    case 'character':
      if (analysis.subject.type === 'person') {
        return {
          questions: [
            `How is ${analysis.subject.text} feeling in this moment?`,
            `Why ${analysis.action.text === analysis.subject.text} feeling this way?`,
            `What is ${analysis.subject.text} thinking about?`,
            `What might ${analysis.subject.text} do next?`
          ]
        };
      }
      break;
    
    case 'thematic':
      return generateThematicQuestions(analysis, theme);
  }
}
```

---

## Teacher Dashboard

### GET /api/dashboard/live-session
Get live PWP session data for class

```typescript
Request:
{
  class_id: string;
  lesson_number: number;
}

Response:
{
  session_active: boolean;
  pupils: Array<{
    pupil_id: string;
    pupil_name: string;
    current_formula: number;
    total_formulas: number;
    progress_percentage: number;
    formulas_status: boolean[]; // ✓ or ✗ for each
    accuracy: number;
    status: 'on_track' | 'struggling' | 'stuck' | 'completed';
    time_elapsed_minutes: number;
  }>;
  class_stats: {
    average_progress: number;
    average_accuracy: number;
    completion_rate: number;
  };
  alerts: Array<{
    type: string;
    severity: string;
    message: string;
    affected_pupils: string[];
  }>;
}
```

---

### GET /api/dashboard/pupil-detail
Drill down into individual pupil

```typescript
Request:
{
  session_id: string;
}

Response:
{
  pupil: {
    id: string;
    name: string;
  };
  session: {
    lesson_number: number;
    subject: string;
    started_at: string;
    time_elapsed: number;
  };
  formulas: Array<{
    formula_number: number;
    pupil_sentence: string;
    is_correct: boolean;
    attempts: number;
    ai_feedback: object[];
    time_spent_seconds: number;
  }>;
  mastery_snapshot: Array<{
    concept: string;
    status: string;
    accuracy: number;
  }>;
  recommendations: string[];
}
```

---

### POST /api/dashboard/create-alert
System creates alert for teacher

```typescript
Request:
{
  class_id: string;
  alert_type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  affected_pupils?: string[];
  lesson_number?: number;
  concept?: string;
}

Response:
{
  alert_id: string;
  created_at: string;
}
```

---

## Analytics

### GET /api/analytics/pupil-progress
Individual pupil progress over time

```typescript
Request:
{
  pupil_id: string;
  date_from?: string;
  date_to?: string;
}

Response:
{
  pupil: {
    id: string;
    name: string;
    current_pwp_level: number;
  };
  sessions: Array<{
    date: string;
    lesson_number: number;
    accuracy: number;
    duration_minutes: number;
    formulas_completed: number;
  }>;
  mastery_progression: Array<{
    concept: string;
    timeline: Array<{
      date: string;
      status: string;
      accuracy: number;
    }>;
  }>;
  sentence_evolution: {
    first_session: { words: number; example: string };
    latest_session: { words: number; example: string };
    growth_percentage: number;
  };
}
```

---

### GET /api/analytics/class-overview
Class-wide analytics

```typescript
Request:
{
  class_id: string;
  date_from?: string;
  date_to?: string;
}

Response:
{
  class: {
    id: string;
    name: string;
    pupil_count: number;
  };
  distribution: {
    pwp_levels: { [level: number]: number };
    mastery_statuses: {
      mastered: number;
      practicing: number;
      needs_support: number;
    };
  };
  trends: {
    average_accuracy_over_time: Array<{ date: string; accuracy: number }>;
    completion_rates: Array<{ date: string; rate: number }>;
  };
  common_struggles: Array<{
    concept: string;
    pupil_count: number;
    average_accuracy: number;
  }>;
  recommendations: string[];
}
```

---

# DATABASE FUNCTIONS

## Automatic Trend Detection

```sql
CREATE OR REPLACE FUNCTION update_mastery_trend()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate trend based on last 5 sessions vs previous 5
  WITH recent AS (
    SELECT AVG(
      CASE WHEN is_correct THEN 100 ELSE 0 END
    ) as avg_recent
    FROM (
      SELECT pf.is_correct
      FROM pwp_formulas pf
      JOIN pwp_sessions ps ON pf.session_id = ps.id
      WHERE ps.pupil_id = NEW.pupil_id
        AND pf.formula_structure LIKE '%' || NEW.concept || '%'
      ORDER BY ps.completed_at DESC
      LIMIT 5
    ) recent_data
  ),
  previous AS (
    SELECT AVG(
      CASE WHEN is_correct THEN 100 ELSE 0 END
    ) as avg_previous
    FROM (
      SELECT pf.is_correct
      FROM pwp_formulas pf
      JOIN pwp_sessions ps ON pf.session_id = ps.id
      WHERE ps.pupil_id = NEW.pupil_id
        AND pf.formula_structure LIKE '%' || NEW.concept || '%'
      ORDER BY ps.completed_at DESC
      LIMIT 10
      OFFSET 5
    ) previous_data
  )
  UPDATE concept_mastery
  SET trend = CASE
    WHEN recent.avg_recent > previous.avg_previous + 10 THEN 'improving'
    WHEN recent.avg_recent < previous.avg_previous - 10 THEN 'declining'
    ELSE 'stable'
  END
  FROM recent, previous
  WHERE concept_mastery.id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_trend
  AFTER UPDATE ON concept_mastery
  FOR EACH ROW
  EXECUTE FUNCTION update_mastery_trend();
```

---

## Automatic Alert Generation

```sql
CREATE OR REPLACE FUNCTION check_pattern_alerts()
RETURNS TRIGGER AS $$
DECLARE
  error_count INTEGER;
  class_id_var UUID;
  teacher_id_var UUID;
BEGIN
  -- Check if this formula error is part of a pattern
  SELECT COUNT(DISTINCT pf.id)
  INTO error_count
  FROM pwp_formulas pf
  JOIN pwp_sessions ps ON pf.session_id = ps.id
  JOIN users u ON ps.pupil_id = u.id
  WHERE u.class_id = (
    SELECT class_id FROM users WHERE id = (
      SELECT pupil_id FROM pwp_sessions WHERE id = NEW.session_id
    )
  )
  AND pf.formula_number = NEW.formula_number
  AND pf.is_correct = false
  AND pf.completed_at > NOW() - INTERVAL '30 minutes';
  
  -- If 8+ pupils struggling with same formula, create alert
  IF error_count >= 8 THEN
    SELECT u.class_id, c.teacher_id
    INTO class_id_var, teacher_id_var
    FROM users u
    JOIN classes c ON u.class_id = c.id
    WHERE u.id = (SELECT pupil_id FROM pwp_sessions WHERE id = NEW.session_id);
    
    INSERT INTO dashboard_alerts (
      class_id, teacher_id, alert_type, severity, title, description,
      lesson_number, metadata
    ) VALUES (
      class_id_var,
      teacher_id_var,
      'widespread_error',
      'warning',
      format('%s pupils struggling with Formula %s', error_count, NEW.formula_number),
      format('Multiple pupils showing errors on the same formula. This may indicate a concept that needs reinforcement in the main lesson.'),
      (SELECT lesson_number FROM pwp_sessions WHERE id = NEW.session_id),
      jsonb_build_object(
        'formula_number', NEW.formula_number,
        'error_count', error_count
      )
    )
    ON CONFLICT DO NOTHING; -- Prevent duplicate alerts
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_alerts
  AFTER UPDATE ON pwp_formulas
  FOR EACH ROW
  WHEN (NEW.is_correct = false AND NEW.completed_at IS NOT NULL)
  EXECUTE FUNCTION check_pattern_alerts();
```

---

# PERFORMANCE OPTIMIZATION

## Indexes

```sql
-- Composite indexes for common queries
CREATE INDEX idx_sessions_pupil_lesson ON pwp_sessions(pupil_id, lesson_number);
CREATE INDEX idx_formulas_session_number ON pwp_formulas(session_id, formula_number);
CREATE INDEX idx_mastery_pupil_concept ON concept_mastery(pupil_id, concept);

-- Partial indexes for active data
CREATE INDEX idx_sessions_active 
  ON pwp_sessions(pupil_id, started_at) 
  WHERE status = 'in_progress';

CREATE INDEX idx_alerts_active 
  ON dashboard_alerts(teacher_id, created_at) 
  WHERE status = 'active';

-- JSON indexes for metadata queries
CREATE INDEX idx_formula_errors ON pwp_formulas USING GIN (errors_detected);
CREATE INDEX idx_session_mastery ON pwp_sessions USING GIN (mastery_scores);
```

---

## Caching Strategy

```typescript
// Redis cache for frequently accessed data
const cacheStrategy = {
  // Cache curriculum map (rarely changes)
  curriculum: {
    key: `curriculum:${lessonNumber}`,
    ttl: 86400, // 24 hours
  },
  
  // Cache pupil mastery (updates after each session)
  mastery: {
    key: `mastery:${pupilId}`,
    ttl: 3600, // 1 hour
  },
  
  // Cache live dashboard data (very frequent access)
  liveSession: {
    key: `live:${classId}:${lessonNumber}`,
    ttl: 60, // 1 minute
  },
  
  // Cache analytics (expensive queries)
  analytics: {
    key: `analytics:${pupilId}:${dateRange}`,
    ttl: 7200, // 2 hours
  }
};
```

---

# DEPLOYMENT CONFIGURATION

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/wrife_pwp
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# API Configuration
API_RATE_LIMIT=100 # requests per minute
SESSION_TIMEOUT_MINUTES=30

# Feature Flags
ENABLE_REMEDIATION=true
ENABLE_PARAGRAPH_WRITING=true
ENABLE_TEACHER_DASHBOARD=true
```

---

## Database Migrations

Using Supabase migrations:

```bash
# Create migration
supabase migration new create_pwp_tables

# Apply migration
supabase db push

# Rollback if needed
supabase db reset
```

---

# SECURITY CONSIDERATIONS

## Row Level Security (RLS)

```sql
-- Pupils can only see their own data
CREATE POLICY pupil_own_sessions ON pwp_sessions
  FOR SELECT
  USING (auth.uid() = pupil_id);

-- Teachers can see their class data
CREATE POLICY teacher_class_sessions ON pwp_sessions
  FOR SELECT
  USING (
    pupil_id IN (
      SELECT id FROM users 
      WHERE class_id IN (
        SELECT id FROM classes WHERE teacher_id = auth.uid()
      )
    )
  );

-- Admin can see all
CREATE POLICY admin_all_access ON pwp_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## Data Privacy

- Pupil names stored but never exposed in API responses to other pupils
- Session data tied to authenticated user ID
- Teacher dashboard only shows data for their assigned classes
- No cross-class data visibility
- Audit logging for all data access

---

# TESTING STRATEGY

## Unit Tests

```typescript
describe('Mastery Calculation', () => {
  it('should calculate MASTERED status for concept used 10+ lessons ago with 85%+ accuracy', () => {
    const result = calculateMasteryScore({
      lessonIntroduced: 10,
      currentLesson: 25,
      overallAccuracy: 90,
      recentAccuracy: 88,
      trend: 'stable'
    });
    
    expect(result.mastery_status).toBe('MASTERED');
    expect(result.mastery_score).toBeGreaterThanOrEqual(85);
  });
});

describe('Formula Generation', () => {
  it('should generate formulas with one new element each', () => {
    const formulas = generateAdaptiveFormulas(
      pupilId,
      23,
      'library',
      7
    );
    
    formulas.forEach((formula, idx) => {
      if (idx > 0) {
        const previousConcepts = formulas[idx - 1].concepts_used.length;
        const currentConcepts = formula.concepts_used.length;
        expect(currentConcepts - previousConcepts).toBe(1);
      }
    });
  });
});
```

---

## Integration Tests

```typescript
describe('PWP Session Flow', () => {
  it('should complete full session with formula submission and mastery updates', async () => {
    // Start session
    const session = await startSession({
      pupilId: testPupil.id,
      lessonNumber: 23,
      subject: 'library',
      subjectType: 'place'
    });
    
    // Submit formulas
    for (const formula of session.formulas) {
      const result = await submitFormula({
        sessionId: session.id,
        formulaNumber: formula.formula_number,
        sentence: generateTestSentence(formula)
      });
      
      expect(result.is_correct).toBe(true);
    }
    
    // Complete session
    const summary = await completeSession({
      sessionId: session.id
    });
    
    expect(summary.formulas_completed).toBe(session.formulas.length);
    expect(summary.accuracy_percentage).toBe(100);
    
    // Verify mastery updates
    const mastery = await getMasteryData(testPupil.id);
    expect(mastery.some(m => m.status_changed)).toBe(true);
  });
});
```

---

# MONITORING & LOGGING

## Key Metrics to Track

```typescript
const metrics = {
  // Performance
  api_response_time: 'Average API response time',
  database_query_time: 'Database query execution time',
  formula_generation_time: 'Time to generate adaptive formulas',
  
  // Usage
  active_sessions: 'Number of concurrent PWP sessions',
  daily_active_pupils: 'Unique pupils using PWP daily',
  completion_rate: 'Percentage of sessions completed',
  
  // Quality
  average_accuracy: 'Overall pupil accuracy',
  remediation_trigger_rate: 'Frequency of remedial sessions',
  teacher_intervention_rate: 'How often teachers intervene',
  
  // Errors
  api_error_rate: 'Percentage of failed API calls',
  timeout_rate: 'Sessions abandoned due to timeout',
  validation_errors: 'Invalid formula submissions'
};
```

---

## Logging Configuration

```typescript
// Structured logging
logger.info('PWP session started', {
  pupil_id: pupilId,
  lesson_number: lessonNumber,
  subject: subject,
  formula_count: formulas.length,
  timestamp: new Date().toISOString()
});

logger.warn('Mastery score below threshold', {
  pupil_id: pupilId,
  concept: concept,
  score: masteryScore,
  remediation_triggered: true
});

logger.error('Formula generation failed', {
  pupil_id: pupilId,
  lesson_number: lessonNumber,
  error: error.message,
  stack: error.stack
});
```

---

**END OF DATABASE SCHEMA & API SPECIFICATIONS**

This provides complete backend architecture for PWP platform development.
