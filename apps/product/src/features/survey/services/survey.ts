import type {
  CreateSurveyInput,
  SubmitResponseInput,
  AIGenerateInput,
} from '../schema'
import type {
  Survey,
  SurveyWithQuestions,
  SurveyQuestion,
  SurveyResponse,
  SurveyAnalytics,
  SurveyQueryParams,
  AIGenerateResponse,
  QuestionType,
  SurveyStatus,
} from '../types'

// ---------------------------------------------------------------------------
// Backend raw shapes (snake_case)
// ---------------------------------------------------------------------------

type RawCondition = {
  depends_on_position: number
  operator: 'equals' | 'not_equals' | 'contains'
  value: string
}

type RawQuestion = {
  id: number
  question_text: string
  question_type: string
  is_required: boolean
  position: number
  conditions: RawCondition[]
  options: Array<{ id: number; option_text: string; position: number }>
}

type RawSurvey = {
  id: number
  external_id: string
  title: string
  description: string | null
  status: string
  is_anonymous: boolean
  max_responses: number | null
  tags: string[]
  cover_url: string | null
  created_by: number
  created_at: string
  updated_at: string
  questions: RawQuestion[]
}

type RawListItem = {
  id: number
  external_id: string
  title: string
  status: string
  is_anonymous: boolean
  tags: string[]
  created_at: string
  response_count: number
}

// ---------------------------------------------------------------------------
// Mapper functions: backend → frontend types
// ---------------------------------------------------------------------------

function mapQuestion(q: RawQuestion, allQuestions: RawQuestion[]): SurveyQuestion {
  return {
    id: String(q.id),
    surveyId: '',
    questionText: q.question_text,
    questionType: q.question_type as QuestionType,
    options: q.options.map(o => ({ id: o.id, label: o.option_text, order: o.position })),
    isRequired: q.is_required,
    conditions: (q.conditions ?? []).map(c => ({
      dependsOn: String(allQuestions.find(x => x.position === c.depends_on_position)?.id ?? ''),
      operator: c.operator,
      value: c.value,
      showQuestionId: String(q.id),
    })),
    aiMetadata: {},
    order: q.position,
    createdAt: '',
    updatedAt: '',
  }
}

function mapSurvey(raw: RawSurvey): SurveyWithQuestions {
  return {
    id: String(raw.id),
    shareId: raw.external_id,
    title: raw.title,
    description: raw.description ?? '',
    purpose: '',
    status: raw.status as SurveyStatus,
    createdBy: String(raw.created_by),
    coverUrl: raw.cover_url ?? undefined,
    config: {
      isAnonymous: raw.is_anonymous,
      isPublished: raw.status === 'active',
      maxResponses: raw.max_responses,
      deadlineAt: null,
      submitButtonText: '提交',
      successMessage: '感謝你的回應！',
      showProgressBar: true,
      oneResponsePerUser: false,
    },
    responseCount: 0,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    questions: raw.questions.map(q => ({ ...mapQuestion(q, raw.questions), surveyId: String(raw.id) })),
  }
}

function mapListItem(raw: RawListItem): Survey {
  return {
    id: String(raw.id),
    shareId: raw.external_id,
    title: raw.title,
    description: '',
    purpose: '',
    status: raw.status as SurveyStatus,
    createdBy: '',
    config: {
      isAnonymous: raw.is_anonymous,
      isPublished: raw.status === 'active',
      maxResponses: null,
      deadlineAt: null,
      submitButtonText: '提交',
      successMessage: '感謝你的回應！',
      showProgressBar: true,
      oneResponsePerUser: false,
    },
    responseCount: raw.response_count,
    createdAt: raw.created_at,
    updatedAt: raw.created_at,
  }
}

// ---------------------------------------------------------------------------
// Survey CRUD
// ---------------------------------------------------------------------------

export async function createSurvey(input: CreateSurveyInput): Promise<SurveyWithQuestions> {
  // Build a map from local question ID → position index for condition conversion
  const localIdToPosition = new Map(
    (input.questions as Array<typeof input.questions[number] & { id?: string }>)
      .map((q, i) => [q.id ?? String(i), i])
  )

  const body = {
    title: input.title,
    description: input.description,
    is_anonymous: input.config?.isAnonymous ?? false,
    max_responses: input.config?.maxResponses ?? undefined,
    cover_url: (input as { coverUrl?: string }).coverUrl ?? undefined,
    tags: [],
    questions: input.questions.map((q, i) => ({
      question_text: q.questionText,
      question_type: q.questionType,
      is_required: q.isRequired,
      position: i,
      options: q.options?.map((o, j) => ({ option_text: o.label, position: j })),
      conditions: (q.conditions ?? [])
        .filter(c => localIdToPosition.has(c.dependsOn))
        .map(c => ({
          depends_on_position: localIdToPosition.get(c.dependsOn)!,
          operator: c.operator,
          value: Array.isArray(c.value) ? c.value.join(',') : c.value,
        })),
    })),
  }
  const res = await api<{ success: true; data: RawSurvey }>('/surveys', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return mapSurvey(res.data)
}

export async function getSurveyById(id: string): Promise<SurveyWithQuestions> {
  const res = await api<{ success: true; data: RawSurvey }>(`/surveys/${id}`)
  return mapSurvey(res.data)
}

export async function getSurveyByShareId(shareId: string): Promise<SurveyWithQuestions> {
  const res = await api<{ success: true; data: RawSurvey }>(`/surveys/public/${shareId}`)
  return mapSurvey(res.data)
}

export async function listSurveys(_params?: SurveyQueryParams): Promise<{
  data: Survey[]
  pagination: { currentPage: number; totalPages: number; hasNext: boolean; total: number }
}> {
  const res = await api<{ success: true; data: RawListItem[] }>('/surveys')
  return {
    data: res.data.map(mapListItem),
    pagination: { currentPage: 1, totalPages: 1, hasNext: false, total: res.data.length },
  }
}

export async function updateSurvey(id: string, input: Partial<CreateSurveyInput> & { coverUrl?: string | null }): Promise<Survey> {
  const body: Record<string, unknown> = {}
  if (input.title !== undefined) body.title = input.title
  if (input.description !== undefined) body.description = input.description
  if (input.coverUrl !== undefined) body.cover_url = input.coverUrl
  const res = await api<{ success: true; data: RawSurvey }>(`/surveys/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  return mapSurvey(res.data)
}

export async function deleteSurvey(id: string): Promise<void> {
  await api(`/surveys/${id}`, { method: 'DELETE' })
}

export async function updateSurveyStatus(id: string, status: string): Promise<Survey> {
  const res = await api<{ success: true; data: RawSurvey }>(`/surveys/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  return mapSurvey(res.data)
}

// ---------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------

export async function submitResponse(input: SubmitResponseInput): Promise<{ response_id: number }> {
  const answers = input.answers.map(a => {
    const v = a.value
    if (typeof v === 'boolean') return { question_id: Number(a.questionId), boolean_value: v }
    if (typeof v === 'number') return { question_id: Number(a.questionId), rating_value: v }
    if (Array.isArray(v)) return { question_id: Number(a.questionId), selected_option_ids: v.map(Number) }
    return { question_id: Number(a.questionId), answer_text: v ?? undefined }
  })
  const body: Record<string, unknown> = { answers }
  if (input.startedAt) body.started_at = input.startedAt
  if (input.sessionKey) body.session_key = input.sessionKey
  const res = await api<{ success: true; data: { response_id: number } }>(
    `/surveys/public/${input.surveyId}/responses`,
    { method: 'POST', body: JSON.stringify(body) },
  )
  return res.data
}

export type ResponseListItem = {
  id: number
  survey_id: number
  user_id: number | null
  completed_at: string
  answer_count: number
}

export async function listResponses(
  surveyId: string,
  params?: { page?: number; limit?: number },
): Promise<{
  data: ResponseListItem[]
  pagination: { currentPage: number; totalPages: number; hasNext: boolean; total: number }
}> {
  const q = new URLSearchParams()
  if (params?.page) q.set('page', String(params.page))
  if (params?.limit) q.set('limit', String(params.limit))
  const qs = q.toString()
  const res = await api<{ success: true; data: ResponseListItem[] }>(
    `/surveys/${surveyId}/responses${qs ? `?${qs}` : ''}`,
  )
  return {
    data: res.data,
    pagination: { currentPage: 1, totalPages: 1, hasNext: false, total: res.data.length },
  }
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export async function getAnalytics(surveyId: string): Promise<SurveyAnalytics> {
  const res = await api<{
    success: true
    data: {
      survey_id: number
      response_count: number
      view_count: number
      avg_duration_seconds: number | null
      drop_off: Array<{ last_position: number; count: number }>
      per_question: Array<{
        question_id: number
        question_text: string
        question_type: string
        answer_count: number
        stats: Record<string, unknown>
      }>
    }
  }>(`/surveys/${surveyId}/analytics`)
  return {
    id: '',
    surveyId,
    summary: '',
    insights: [],
    responseCount: res.data.response_count,
    completionRate: res.data.view_count > 0 ? res.data.response_count / res.data.view_count : 0,
    avgDurationSeconds: res.data.avg_duration_seconds ?? 0,
    trendData: { dropOff: res.data.drop_off },
    perQuestionStats: res.data.per_question.map(q => ({
      questionId: String(q.question_id),
      questionType: q.question_type as QuestionType,
      questionText: q.question_text,
      stats: {
        responseCount: q.answer_count,
        distribution: (() => {
          const counts = Array.isArray(q.stats.option_counts)
            ? (q.stats.option_counts as Array<{ option_text: string; count: number }>)
            : undefined
          if (!counts) return undefined
          const total = counts.reduce((s, x) => s + x.count, 0) || 1
          return counts.map((o) => ({ label: o.option_text, count: o.count, percentage: (o.count / total) * 100 }))
        })(),
        averageScore: q.stats.avg as number | undefined,
      },
    })),
    generatedAt: new Date().toISOString(),
  }
}

export async function generateAnalytics(surveyId: string): Promise<SurveyAnalytics> {
  await api(`/surveys/${surveyId}/analytics/generate`, { method: 'POST' })
  return getAnalytics(surveyId)
}

export async function trackView(shareId: string): Promise<void> {
  await api(`/surveys/public/${shareId}/views`, { method: 'POST' }).catch(() => {})
}

export async function trackPartial(shareId: string, sessionKey: string, lastPosition: number): Promise<void> {
  await api(`/surveys/public/${shareId}/partial`, {
    method: 'POST',
    body: JSON.stringify({ session_key: sessionKey, last_position: lastPosition }),
  }).catch(() => {})
}

export async function deleteResponse(surveyId: string, responseId: string): Promise<void> {
  await api(`/surveys/${surveyId}/responses/${responseId}`, { method: 'DELETE' })
}

export type ResponseDetail = {
  id: number
  survey_id: number
  user_id: number | null
  completed_at: string
  answers: Array<{
    question_id: number
    question_type: string
    answer_text: string | null
    selected_option_ids: number[]
    rating_value: number | null
    boolean_value: boolean | null
  }>
}

export async function getResponse(surveyId: string, responseId: string): Promise<ResponseDetail> {
  const res = await api<{ success: true; data: ResponseDetail }>(
    `/surveys/${surveyId}/responses/${responseId}`
  )
  return res.data
}

// ---------------------------------------------------------------------------
// AI Generation
// ---------------------------------------------------------------------------

export async function generateSurveyQuestions(input: AIGenerateInput): Promise<AIGenerateResponse> {
  const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL ?? ''
  const res = await fetch(`${workerUrl}/survey/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(`Worker API ${res.status}`)
  return res.json() as Promise<AIGenerateResponse>
}

// ---------------------------------------------------------------------------
// Fetch client
// ---------------------------------------------------------------------------

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '/api'
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Survey API ${res.status}: ${body}`)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
