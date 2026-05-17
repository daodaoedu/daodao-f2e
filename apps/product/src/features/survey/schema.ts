import { z } from 'zod'

export const QuestionTypeSchema = z.enum([
  'multiple_choice', 'single_choice', 'rating', 'text', 'yesno', 'scale', 'ranking',
])

export const SurveyConfigSchema = z.object({
  isAnonymous: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  maxResponses: z.number().nullable().default(null),
  deadlineAt: z.string().nullable().default(null),
  submitButtonText: z.string().default('提交'),
  successMessage: z.string().default('感謝你的回應！'),
  showProgressBar: z.boolean().default(true),
  oneResponsePerUser: z.boolean().default(true),
})

export const CreateSurveySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  purpose: z.string().max(500).optional(),
  tone: z.enum(['formal', 'casual', 'friendly', 'professional']).default('friendly'),
  audience: z.string().max(100).default('一般受眾'),
  questionCount: z.number().int().min(3).max(20).default(10),
  questions: z.array(z.object({
    questionText: z.string().min(1),
    questionType: QuestionTypeSchema,
    options: z.array(z.object({ label: z.string(), order: z.number() })).optional(),
    isRequired: z.boolean().default(true),
    conditions: z.array(z.any()).default([]),
  })).default([]),
  config: SurveyConfigSchema.partial().default({}),
})

export const SubmitResponseSchema = z.object({
  surveyId: z.string(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  answers: z.array(z.object({
    questionId: z.string(),
    value: z.union([z.string(), z.array(z.string()), z.number(), z.boolean(), z.null()]),
    answeredAt: z.string().optional(),
  })),
  startedAt: z.string().optional(),
  sessionKey: z.string().optional(),
})

export const AIGenerateSchema = z.object({
  purpose: z.string().min(5).max(500),
  context: z.string().max(500).optional(),
  questionCount: z.number().int().min(3).max(20).default(10),
  questionTypes: z.array(QuestionTypeSchema).optional(),
  audience: z.string().max(100).default('一般受眾'),
  tone: z.enum(['formal', 'casual', 'friendly', 'professional']).default('friendly'),
})

export type CreateSurveyInput = z.infer<typeof CreateSurveySchema>
export type SubmitResponseInput = z.infer<typeof SubmitResponseSchema>
export type AIGenerateInput = z.infer<typeof AIGenerateSchema>
