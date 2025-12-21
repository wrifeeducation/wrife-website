import { pgTable, serial, integer, text, varchar, boolean, timestamp, date, uuid, jsonb, numeric } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const schools = pgTable('schools', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name').notNull(),
  domain: varchar('domain'),
  subscriptionTier: varchar('subscription_tier').notNull().default('trial'),
  teacherLimit: integer('teacher_limit').notNull().default(5),
  pupilLimit: integer('pupil_limit').notNull().default(100),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`now()`),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  email: text('email'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  displayName: text('display_name'),
  role: text('role').notNull().default('teacher'),
  membershipTier: text('membership_tier').notNull().default('free'),
  schoolId: uuid('school_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`now()`),
});

export const classes = pgTable('classes', {
  id: serial('id').primaryKey(),
  teacherId: uuid('teacher_id').notNull(),
  name: varchar('name').notNull(),
  yearGroup: integer('year_group').notNull(),
  classCode: varchar('class_code').notNull(),
  schoolName: varchar('school_name'),
  schoolId: uuid('school_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`now()`),
});

export const classMembers = pgTable('class_members', {
  id: serial('id').primaryKey(),
  classId: integer('class_id').notNull(),
  pupilName: varchar('pupil_name').notNull(),
  pupilEmail: varchar('pupil_email'),
  pupilId: uuid('pupil_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`now()`),
});

export const pupils = pgTable('pupils', {
  id: uuid('id').primaryKey(),
  firstName: varchar('first_name').notNull(),
  lastName: varchar('last_name'),
  displayName: varchar('display_name'),
  yearGroup: integer('year_group').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`now()`),
});

export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  lessonNumber: integer('lesson_number').notNull(),
  title: varchar('title').notNull(),
  hasParts: boolean('has_parts').default(false),
  part: varchar('part'),
  chapter: integer('chapter'),
  unit: integer('unit'),
  summary: text('summary'),
  durationMinutes: integer('duration_minutes').default(45),
  yearGroupMin: integer('year_group_min').default(2),
  yearGroupMax: integer('year_group_max').default(6),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`now()`),
});

export const lessonFiles = pgTable('lesson_files', {
  id: serial('id').primaryKey(),
  lessonId: integer('lesson_id'),
  fileType: varchar('file_type').notNull(),
  fileName: varchar('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
});

export const curriculumMap = pgTable('curriculum_map', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  lessonNumber: integer('lesson_number').notNull(),
  lessonName: varchar('lesson_name').notNull(),
  conceptsIntroduced: text('concepts_introduced').array().notNull(),
  conceptsCumulative: text('concepts_cumulative').array().notNull(),
  pwpStage: varchar('pwp_stage').notNull(),
  pwpDurationMinutes: integer('pwp_duration_minutes').notNull().default(5),
  pwpFormulaCountMin: integer('pwp_formula_count_min').notNull().default(2),
  pwpFormulaCountMax: integer('pwp_formula_count_max').notNull().default(4),
  paragraphWritingEnabled: boolean('paragraph_writing_enabled').default(false),
  subjectAssignmentType: varchar('subject_assignment_type').default('given'),
  subjectCondition: varchar('subject_condition'),
  subjectIdeas: text('subject_ideas').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
});

export const assignments = pgTable('assignments', {
  id: serial('id').primaryKey(),
  lessonId: integer('lesson_id').notNull(),
  classId: integer('class_id').notNull(),
  teacherId: uuid('teacher_id').notNull(),
  title: varchar('title').notNull(),
  instructions: text('instructions'),
  dueDate: date('due_date'),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`now()`),
});

export const submissions = pgTable('submissions', {
  id: serial('id').primaryKey(),
  assignmentId: integer('assignment_id'),
  pupilId: uuid('pupil_id').notNull(),
  content: text('content'),
  status: varchar('status').default('draft'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`now()`),
});

export const aiAssessments = pgTable('ai_assessments', {
  id: serial('id').primaryKey(),
  submissionId: integer('submission_id'),
  teacherId: uuid('teacher_id').notNull(),
  strengths: text('strengths'),
  improvements: text('improvements'),
  improvedExample: text('improved_example'),
  mechanicalEdits: text('mechanical_edits'),
  bandingScore: integer('banding_score'),
  rawResponse: jsonb('raw_response'),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
});

export const progressRecords = pgTable('progress_records', {
  id: serial('id').primaryKey(),
  pupilId: uuid('pupil_id').notNull(),
  lessonId: integer('lesson_id'),
  classId: integer('class_id'),
  status: varchar('status').default('not_started'),
  score: numeric('score'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  progressPayload: jsonb('progress_payload'),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`now()`),
});

export const progressiveActivities = pgTable('progressive_activities', {
  id: serial('id').primaryKey(),
  level: integer('level').notNull(),
  levelName: varchar('level_name').notNull(),
  grammarFocus: varchar('grammar_focus').notNull(),
  sentenceStructure: varchar('sentence_structure').notNull(),
  instructions: text('instructions').notNull(),
  examples: jsonb('examples').notNull().default([]),
  practicePrompts: jsonb('practice_prompts').notNull().default([]),
  yearGroupMin: integer('year_group_min').default(2),
  yearGroupMax: integer('year_group_max').default(6),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`now()`),
});

export const pwpAssignments = pgTable('pwp_assignments', {
  id: serial('id').primaryKey(),
  activityId: integer('activity_id').notNull(),
  classId: varchar('class_id').notNull(),
  teacherId: uuid('teacher_id').notNull(),
  instructions: text('instructions'),
  dueDate: date('due_date'),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`now()`),
});

export const pwpClassAssignments = pgTable('pwp_class_assignments', {
  id: serial('id').primaryKey(),
  classId: integer('class_id').notNull(),
  lessonNumber: integer('lesson_number').notNull(),
  teacherId: uuid('teacher_id').notNull(),
  assignedDate: date('assigned_date').default(sql`CURRENT_DATE`),
  dueDate: date('due_date'),
  isActive: boolean('is_active').default(true),
  customInstructions: text('custom_instructions'),
  customSubject: text('custom_subject'),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
});

export const pwpSubmissions = pgTable('pwp_submissions', {
  id: serial('id').primaryKey(),
  pwpAssignmentId: integer('pwp_assignment_id').notNull(),
  pupilId: uuid('pupil_id').notNull(),
  content: text('content'),
  status: varchar('status').default('draft'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`now()`),
});

export const pwpAssessments = pgTable('pwp_assessments', {
  id: serial('id').primaryKey(),
  pwpSubmissionId: integer('pwp_submission_id').notNull(),
  teacherId: uuid('teacher_id').notNull(),
  grammarAccuracy: integer('grammar_accuracy'),
  structureCorrectness: integer('structure_correctness'),
  feedback: text('feedback'),
  corrections: jsonb('corrections').default([]),
  improvedExample: text('improved_example'),
  rawResponse: jsonb('raw_response'),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
});

export const pwpSessions = pgTable('pwp_sessions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  pupilId: uuid('pupil_id').notNull(),
  lessonNumber: integer('lesson_number').notNull(),
  classId: integer('class_id'),
  startedAt: timestamp('started_at', { withTimezone: true }).default(sql`now()`),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  durationSeconds: integer('duration_seconds'),
  subjectText: varchar('subject_text').notNull(),
  subjectType: varchar('subject_type'),
  status: varchar('status').default('in_progress'),
  formulasCompleted: integer('formulas_completed').default(0),
  formulasTotal: integer('formulas_total').notNull(),
  accuracyPercentage: numeric('accuracy_percentage'),
  wordRepetitionStats: jsonb('word_repetition_stats').default({}),
  masteryScores: jsonb('mastery_scores').default({}),
});

export const pwpFormulas = pgTable('pwp_formulas', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid('session_id').notNull(),
  formulaNumber: integer('formula_number').notNull(),
  formulaStructure: text('formula_structure').notNull(),
  labelledExample: text('labelled_example').notNull(),
  wordBank: text('word_bank').array().default([]),
  newElements: text('new_elements').array().notNull(),
  hintText: text('hint_text'),
  pupilSentence: text('pupil_sentence'),
  attempts: integer('attempts').default(0),
  isCorrect: boolean('is_correct'),
  errorsDetected: jsonb('errors_detected').default([]),
  aiFeedbackGiven: jsonb('ai_feedback_given').default([]),
  startedAt: timestamp('started_at', { withTimezone: true }).default(sql`now()`),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

export const formulaAttempts = pgTable('formula_attempts', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  formulaId: uuid('formula_id').notNull(),
  attemptNumber: integer('attempt_number').notNull(),
  pupilSentence: text('pupil_sentence').notNull(),
  wordsClicked: text('words_clicked').array().default([]),
  wordsTyped: text('words_typed').array().default([]),
  errorsDetected: jsonb('errors_detected').default([]),
  feedbackProvided: jsonb('feedback_provided').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
});

export const conceptMastery = pgTable('concept_mastery', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  pupilId: uuid('pupil_id').notNull(),
  concept: varchar('concept').notNull(),
  lessonIntroduced: integer('lesson_introduced').notNull(),
  currentLesson: integer('current_lesson').notNull().default(10),
  totalUses: integer('total_uses').default(0),
  correctUses: integer('correct_uses').default(0),
  recentUses: integer('recent_uses').default(0),
  recentCorrect: integer('recent_correct').default(0),
  trend: varchar('trend'),
  masteryStatus: varchar('mastery_status').default('new'),
  lastUsed: timestamp('last_used', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`now()`),
});

export const dwpAssignments = pgTable('dwp_assignments', {
  id: serial('id').primaryKey(),
  levelId: text('level_id').notNull(),
  classId: integer('class_id').notNull(),
  teacherId: uuid('teacher_id').notNull(),
  instructions: text('instructions'),
  dueDate: timestamp('due_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`now()`),
});

export const writingLevels = pgTable('writing_levels', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  levelNumber: integer('level_number').notNull(),
  tierNumber: integer('tier_number').notNull(),
  levelId: text('level_id').notNull(),
  activityName: text('activity_name').notNull(),
  activityType: text('activity_type').notNull(),
  learningObjective: text('learning_objective').notNull(),
  promptTitle: text('prompt_title').notNull(),
  promptInstructions: text('prompt_instructions').notNull(),
  promptExample: text('prompt_example'),
  wordBank: jsonb('word_bank'),
  rubric: jsonb('rubric').notNull(),
  passingThreshold: integer('passing_threshold').notNull().default(80),
  expectedTimeMinutes: integer('expected_time_minutes'),
  difficultyLevel: text('difficulty_level'),
  ageRange: text('age_range'),
  tierFinale: boolean('tier_finale').default(false),
  programmeFinale: boolean('programme_finale').default(false),
  milestone: boolean('milestone').default(false),
  displayOrder: integer('display_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`now()`),
});

export const writingAttempts = pgTable('writing_attempts', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  pupilId: uuid('pupil_id').notNull(),
  dwpAssignmentId: integer('dwp_assignment_id'),
  levelId: text('level_id').notNull(),
  attemptNumber: integer('attempt_number').notNull().default(1),
  pupilWriting: text('pupil_writing').notNull(),
  wordCount: integer('word_count'),
  score: integer('score'),
  totalItems: integer('total_items'),
  percentage: integer('percentage'),
  passed: boolean('passed'),
  performanceBand: text('performance_band'),
  aiAssessment: jsonb('ai_assessment'),
  errorPatterns: text('error_patterns').array(),
  primaryErrorPattern: text('primary_error_pattern'),
  primaryStrength: text('primary_strength'),
  primaryGrowthArea: text('primary_growth_area'),
  badgeEarned: text('badge_earned'),
  certificateEarned: text('certificate_earned'),
  unlockedNextLevel: boolean('unlocked_next_level').default(false),
  nextLevelId: text('next_level_id'),
  interventionFlagged: boolean('intervention_flagged').default(false),
  teacherReviewed: boolean('teacher_reviewed').default(false),
  teacherNotes: text('teacher_notes'),
  flaggedForReview: boolean('flagged_for_review').default(false),
  flagReason: text('flag_reason'),
  timeStarted: timestamp('time_started', { withTimezone: true }),
  timeSubmitted: timestamp('time_submitted', { withTimezone: true }).default(sql`now()`),
  timeElapsedSeconds: integer('time_elapsed_seconds'),
  status: text('status').default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
});

export const writingProgress = pgTable('writing_progress', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  pupilId: uuid('pupil_id').notNull(),
  currentLevelId: text('current_level_id').notNull().default('writing_level_1'),
  currentLevelNumber: integer('current_level_number').notNull().default(1),
  currentTierNumber: integer('current_tier_number').notNull().default(1),
  levelsCompleted: text('levels_completed').array().default([]),
  tiersCompleted: integer('tiers_completed').array().default([]),
  programmeCompleted: boolean('programme_completed').default(false),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`now()`),
});

export const rubrics = pgTable('rubrics', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  description: text('description'),
  criteria: jsonb('criteria').notNull(),
  yearGroupMin: integer('year_group_min').default(2),
  yearGroupMax: integer('year_group_max').default(6),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`now()`),
});

export const teacherInvites = pgTable('teacher_invites', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  email: varchar('email').notNull(),
  schoolId: uuid('school_id').notNull(),
  inviteCode: varchar('invite_code').notNull(),
  invitedBy: uuid('invited_by').notNull(),
  status: varchar('status').default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
  expiresAt: timestamp('expires_at', { withTimezone: true }).default(sql`now() + interval '7 days'`),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
});

export const userActivity = pgTable('user_activity', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id'),
  userRole: varchar('user_role'),
  eventType: varchar('event_type').notNull(),
  eventData: jsonb('event_data').default({}),
  pagePath: varchar('page_path'),
  sessionId: varchar('session_id'),
  ipAddress: varchar('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`),
});
