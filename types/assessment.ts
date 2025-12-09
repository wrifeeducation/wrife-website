export type RubricCriterionId =
  | "audience_purpose"
  | "structure"
  | "sentence_control"
  | "cohesion"
  | "vocabulary"
  | "mechanics"
  | "genre_features"
  | "project_skills";

export interface RubricCriterion {
  id: RubricCriterionId;
  label: string;
  description: string;
  weight: number;
}

export interface Rubric {
  id: string;
  name: string;
  lessonNumbers: number[];
  stage: "FOUNDATION" | "APPLICATION" | "MASTERY";
  criteria: RubricCriterion[];
  bandLabels: ["Emerging", "Developing", "Secure", "Greater Depth"];
}

export type Band = "Emerging" | "Developing" | "Secure" | "Greater Depth";

export interface CriterionScore {
  score: 1 | 2 | 3 | 4 | null;
  rationale: string;
}

export interface MechanicalEdit {
  orig: string;
  fix: string;
  loc?: { para?: number; charIndex?: number; snippet?: string };
}

export interface StudentFeedbackItem {
  type: "Praise" | "NextStep" | "Practice";
  text: string;
}

export interface ConfidenceInfo {
  score: number;
  notes: string;
}

export interface AiAssessmentResult {
  overallScore: number;
  band: Band;
  criterionScores: Record<RubricCriterionId, CriterionScore>;
  teacherRationale: string;
  studentFeedback: StudentFeedbackItem[];
  mechanicalEdits: {
    spelling: MechanicalEdit[];
    punctuation: MechanicalEdit[];
    grammarSuggestions: MechanicalEdit[];
  };
  improvedParagraphExample: string;
  confidence: ConfidenceInfo;
  explainability: string;
  modelVersion: string;
  promptVersion: string;
}

export interface AssessmentRequest {
  submissionId: string;
  rubricId: string;
  mode?: "full" | "feedback-only";
}
