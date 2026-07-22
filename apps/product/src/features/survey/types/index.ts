// ============================================================================
// Survey Type Definitions
// ============================================================================

export type SurveyStatus = "draft" | "active" | "closed" | "archived";

export type QuestionType =
  | "multiple_choice"
  | "single_choice"
  | "rating"
  | "text"
  | "yesno"
  | "scale"
  | "ranking";

export interface Survey {
  id: string;
  shareId: string;
  title: string;
  description: string;
  purpose: string;
  status: SurveyStatus;
  createdBy: string;
  config: SurveyConfig;
  responseCount: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface SurveyConfig {
  isAnonymous: boolean;
  isPublished: boolean;
  maxResponses: number | null;
  deadlineAt: string | null;
  submitButtonText: string;
  successMessage: string;
  showProgressBar: boolean;
  oneResponsePerUser: boolean;
}

export interface SurveyWithQuestions extends Survey {
  questions: SurveyQuestion[];
  coverUrl?: string;
}

export interface SurveyQuestion {
  id: string;
  surveyId: string;
  questionText: string;
  questionType: QuestionType;
  options: QuestionOption[];
  isRequired: boolean;
  conditions: Condition[];
  aiMetadata: Record<string, unknown>;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionOption {
  id?: number;
  label: string;
  order: number;
}

export interface Condition {
  dependsOn: string;
  operator: "equals" | "not_equals" | "contains";
  value: string | string[];
  showQuestionId: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  userId: string | null;
  sessionId: string | null;
  answers: Answer[];
  aiEnriched: Record<string, unknown>;
  startedAt: string;
  submittedAt: string | null;
  createdAt: string;
}

export interface Answer {
  questionId: string;
  value: string | string[] | number | number[] | boolean | null;
  answeredAt?: string;
}

export interface SurveyAnalytics {
  id: string;
  surveyId: string;
  summary: string;
  insights: Insight[];
  responseCount: number;
  completionRate: number;
  avgDurationSeconds: number;
  trendData: TrendData;
  perQuestionStats: PerQuestionStat[];
  generatedAt: string;
}

export interface Insight {
  type: "strength" | "weakness" | "suggestion" | "trend" | "sentiment";
  text: string;
  confidence: number;
  suggestions?: string[];
}

export interface TrendData {
  daily?: { date: string; count: number }[];
  hourly?: { hour: string; count: number }[];
  dropOff?: { last_position: number; count: number }[];
}

export interface PerQuestionStat {
  questionId: string;
  questionType: QuestionType;
  questionText: string;
  stats: {
    responseCount?: number;
    skipRate?: number;
    distribution?: { label: string; count: number; percentage: number }[];
    averageScore?: number;
    medianScore?: number;
    sentiment?: { positive: number; negative: number; neutral: number };
  };
}

export interface AIGeneratedQuestion {
  questionText: string;
  questionType: QuestionType;
  options?: QuestionOption[];
  rationale?: string;
}

export interface AIGenerateResponse {
  success: boolean;
  data: {
    questions: AIGeneratedQuestion[];
    sessionId: string;
    model: string;
    tokenUsage: { prompt: number; completion: number };
  };
  error?: string;
}

export type { AIGenerateInput } from "../schema";

export interface SurveyQueryParams {
  status?: SurveyStatus;
  page?: number;
  limit?: number;
  search?: string;
  isPublished?: boolean;
}
