// ── API 回應外殼 ──────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: null | { code: string; message: string };
  pagination: null | OffsetPagination;
  cacheHit: boolean;
  processingTime: number;
  timestamp: string;
  requestId: string;
}

// ── Lighthouse Organization ────────────────────────────────────────────────
export interface Organization {
  id: number;
  name: string;
  bio: string | null;
  externalLink: string | null;
  status: "active" | "suspended";
  approvedBy: number | null;
  approvedAt: string | null;
  createdAt: string;
}

export interface OrganizationMember {
  id: number;
  userId: number;
  nickname: string | null;
  /** 只有 admin 端點會回傳；組織自己的成員清單不含 email */
  email: string | null;
  role: "owner";
  createdAt: string;
}

export interface OrganizationCreate {
  name: string;
  bio?: string | null;
  externalLink?: string | null;
  ownerEmail: string;
}

export interface OrganizationInvitationRequest {
  id: number;
  userId: number;
  email: string | null;
  nickname: string | null;
  createdAt: string;
}

export interface OrganizationInvitation {
  id: number;
  organizationId: number;
  email: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  expiresAt: string;
  createdAt: string;
  deliveryStatus: "pending" | "sent" | "failed";
  requests: OrganizationInvitationRequest[];
}

export interface OrganizationUpdate {
  name?: string;
  bio?: string | null;
  externalLink?: string | null;
  status?: Organization["status"];
}

export interface OffsetPagination {
  total_count: number;
  limit: number;
  offset: number;
  has_next: boolean;
}

// ── Auth ────────────────────────────────────────────────────────
export interface AdminPingData {
  status: string;
  admin_id: number;
  admin_mongo_id: string | null;
  nickname: string | null;
}

export interface AuthMeUser {
  id: string;
  nickname?: string;
  email: string | null;
  name: string | null;
  photo_url: string | null;
  is_active: boolean;
  email_verified: boolean;
  email_verified_at: string | null;
  roles: string[];
  permissions: string[];
}

export interface AuthMeData {
  user: AuthMeUser;
  isTemporary: boolean;
}

// ── Dashboard ─────────────────────────────────────────────────────
export interface BackendStat {
  backend: string;
  query_count: number;
  cost_usd: string;
  total_tokens: number;
}

export interface DailyStatPoint {
  date: string;
  cost_usd: string;
  query_count: number;
  total_tokens: number;
}

export interface DashboardStats {
  total_cost_usd: string;
  total_queries: number;
  total_input_tokens: number;
  total_output_tokens: number;
  by_backend: BackendStat[];
  daily_series: DailyStatPoint[];
}

// ── System Prompts ────────────────────────────────────────────────
export interface SystemPrompt {
  id: number;
  name: string;
  content: string;
  is_active: boolean;
  version: number;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string | null;
}

export interface SystemPromptCreate {
  name: string;
  content: string;
  is_active?: boolean;
}

export interface SystemPromptUpdate {
  name?: string;
  content?: string;
  is_active?: boolean;
}

// ── LLM Models ─────────────────────────────────────────────────────
export interface LLMModel {
  id: number;
  provider: string;
  model_name: string;
  display_name: string | null;
  is_active: boolean;
  input_cost_per_1m: string;
  output_cost_per_1m: string;
  cached_input_cost_per_1m: string;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface LLMModelCreate {
  provider: string;
  model_name: string;
  display_name?: string;
  is_active?: boolean;
  input_cost_per_1m?: string;
  output_cost_per_1m?: string;
  cached_input_cost_per_1m?: string;
  notes?: string;
}

// ── AI Query Logs ───────────────────────────────────────────────────
export interface AIQueryLog {
  id: number;
  request_id: string;
  backend: string;
  model_name: string | null;
  context: string | null;
  user_id: number | null;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  cost_usd: string | null;
  latency_ms: number | null;
  status: string;
  error_message: string | null;
  prompt_chars: number | null;
  output_chars: number | null;
  finish_reason: string | null;
  http_status_code: number | null;
  retry_count: number | null;
  is_stream: boolean | null;
  service_config_id: number | null;
  created_at: string;
  usage_detail?: Record<string, unknown>;
}

// ── Playground ────────────────────────────────────────────────────
export interface PlaygroundChatRequest {
  model_id: number;
  system_prompt_id?: number | null;
  message: string;
  max_tokens?: number | null;
  temperature?: number | null;
  top_p?: number | null;
  top_k?: number | null;
}

export interface PlaygroundChatResponse {
  response: string;
  model_used: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  latency_ms: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta?: {
    input_tokens: number;
    output_tokens: number;
    cost_usd: number;
    latency_ms: number;
    model_used: string;
  };
}

// ── AI Query Log Filters ───────────────────────────────────────────
export interface QueryLogFilters {
  backend?: string;
  context?: string;
  user_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

// ── User Quotas ─────────────────────────────────────────────────────
export interface UserQuota {
  id: number;
  user_id: number;
  monthly_token_limit: number;
  daily_token_limit: number | null;
  quota_month: number | null;
  created_at: string;
  updated_at: string | null;
}

export interface UserWithQuota {
  id: number;
  mongo_id: string | null;
  nickname: string | null;
  external_id: string | null;
  role_id: number | null;
  current_month_tokens_used: number;
  quota: UserQuota | null;
}

// ── Insight Playground ────────────────────────────────────────────
export interface InsightUser {
  id: number;
  nickname: string | null;
}

export interface InsightPractice {
  id: number;
  title: string;
  has_insight: boolean;
}

export interface PlaygroundInsightRequest {
  practice_id: number;
  model_id: number;
  save?: boolean;
  system_prompt_id?: number | null;
  system_prompt_override?: string | null;
  include_user_profile?: boolean;
  include_practice_info?: boolean;
  include_checkin_stats?: boolean;
  include_notable_notes?: boolean;
  max_tokens?: number | null;
  temperature?: number | null;
  top_p?: number | null;
  top_k?: number | null;
}

export interface InsightCheckinStats {
  total: number;
  max_streak: number;
  top_weekdays: string[];
  mood_summary: string;
}

export interface PlaygroundInsightResponse {
  insight: string;
  thinking?: string | null;
  prompt_used: string;
  checkin_stats: InsightCheckinStats;
  user_profile_used: Record<string, unknown>;
  model_used: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  latency_ms: number;
  saved: boolean;
}

export interface ModelSyncResult {
  provider: string;
  added: number;
  existing: number;
}

// ── AI Service Configs ──────────────────────────────────────
export interface AIServiceConfig {
  id: number;
  service: string;
  name: string;
  model_id: number;
  system_prompt_id: number | null;
  max_tokens: number | null;
  temperature: string | null;
  top_p: string | null;
  top_k: number | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface AIServiceConfigCreate {
  service: string;
  name: string;
  model_id: number;
  system_prompt_id?: number | null;
  max_tokens?: number | null;
  temperature?: number | null;
  top_p?: number | null;
  top_k?: number | null;
  is_active?: boolean;
  notes?: string | null;
}

export interface AIServiceConfigUpdate {
  name?: string;
  model_id?: number;
  system_prompt_id?: number | null;
  max_tokens?: number | null;
  temperature?: number | null;
  top_p?: number | null;
  top_k?: number | null;
  is_active?: boolean;
  notes?: string | null;
}

// ── Feed Ranking Configs ────────────────────────────────────
export interface FeedRankingConfig {
  id: number;
  name: string;
  w_social: string;
  w_engagement: string;
  w_content: string;
  w_decay: string;
  w_freshness: string;
  freshness_window_hours: number;
  w_featured: string;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface FeedRankingConfigCreate {
  name: string;
  w_social: number;
  w_engagement: number;
  w_content: number;
  w_decay: number;
  w_freshness: number;
  freshness_window_hours: number;
  w_featured: number;
  is_active?: boolean;
  notes?: string | null;
}

export interface FeedRankingConfigUpdate {
  name?: string;
  w_social?: number;
  w_engagement?: number;
  w_content?: number;
  w_decay?: number;
  w_freshness?: number;
  freshness_window_hours?: number;
  w_featured?: number;
  is_active?: boolean;
  notes?: string | null;
}

// ── Roles & Permissions (daodao-server) ────────────────────────────────
export interface Role {
  id: number;
  name: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: number;
  name: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface UserRoleInfo {
  userId: number;
  role: Role | null;
}

export interface AdminUserListItem {
  id: string;
  internalId: number;
  customId: string | null;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  isActive: boolean;
  roles: Array<{ id: number; name: string }>;
  permissions: string[];
  createdAt: string;
  lastLoginAt: string | null;
  personaType: "L" | "C" | "A" | "D" | "O" | null;
  tags: Array<{ id: number; name: string; color: string }>;
  entityTags: Array<{ id: number; name: string }>;
  lastActiveAt: string | null;
}

// ── Admin User Detail ─────────────────────────────────────────────────
export interface AdminUserDetail {
  id: string;
  internalId: number;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  isActive: boolean;
  roles: Array<{ id: number; name: string }>;
  permissions: string[];
  createdAt: string;
  lastLoginAt: string | null;
  personaType: "L" | "C" | "A" | "D" | "O" | null;
  referralSource: string | null;
  tags: Array<{ id: number; name: string; color: string }>;
  entityTags: Array<{ id: number; name: string }>;
  activityStats?: {
    totalCheckins: number;
    totalPosts: number;
    totalComments: number;
    lastActiveAt: string | null;
  };
}

export interface AdminLoginHistoryItem {
  id: number;
  loginAt: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface AdminActivityStats {
  lastLoginAt: string | null;
  lastActiveAt: string | null;
  loginCount: number;
  recentLoginCount: number;
  totalPractices: number;
  totalCheckins: number;
  totalPosts: number;
  totalReactions: number;
}

export interface ActivityTimelineEvent {
  id: string;
  type: "login" | "checkin" | "post" | "practice" | "persona" | "view" | "reaction" | "comment";
  description: string;
  timestamp: string;
  url?: string;
}

export interface PracticeStats {
  total: number;
  active: number;
  completed: number;
  totalCheckIns: number;
  avgCheckInsPerPractice?: number;
  averageCompletionRate?: number;
  practicesByCategory?: Array<{
    category: string;
    count: number;
  }>;
  practicesByStatus?: Array<{
    status: string;
    count: number;
  }>;
}

export interface PagePagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: PagePagination;
  timestamp: string;
  meta?: Record<string, unknown>;
}

export type PracticeStatus = "draft" | "not_started" | "active" | "completed" | "archived";

export interface PracticeUserInfo {
  id: string;
  name: string;
  photoURL: string | null;
  roleList: string[];
}

export interface PracticeEntity {
  id: string;
  title: string;
  practiceAction?: string;
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  frequencyMinDays?: number;
  frequencyMaxDays?: number;
  sessionDurationMinutes?: number;
  practiceTimePeriods: string[];
  otherContext?: string;
  status: PracticeStatus;
  hasResources: boolean;
  progressPercentage?: number;
  firstCheckinAt?: string;
  lastCheckinAt?: string;
  checkInCount: number;
  themeColor?: string;
  createdAt: string;
  updatedAt?: string;
  user: PracticeUserInfo;
  tags: string[];
  privacyStatus: string;
  stats: {
    likeCount: number;
    viewCount: number;
    favoriteCount: number;
    shareCount: number;
    commentCount: number;
  };
}

export interface ActiveUsersTrendPoint {
  date: string;
  dau: number;
  wau: number;
  mau: number;
}

export interface ActiveUsersTrendResponse {
  data: ActiveUsersTrendPoint[];
  summary: {
    currentDau: number;
    currentWau: number;
    currentMau: number;
    dauChangePercent: number;
    wauChangePercent: number;
    mauChangePercent: number;
  };
}

export interface ActiveUserListItem {
  id: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  lastActiveAt: string | null;
}

export interface ActiveUsersFunnelStep {
  label: string;
  value: number;
}

export interface ActiveUsersFunnelResponse {
  steps: ActiveUsersFunnelStep[];
}

export interface UserCohortRow {
  label: string;
  day1: number;
  day7: number;
  day14: number;
  day30: number;
  day60: number;
  day90: number;
}

export interface UserCohortResponse {
  rows: UserCohortRow[];
}

export interface EmailHistoryItem {
  id: number;
  recipient: string;
  recipientName: string | null;
  subject: string;
  status: string;
  sentAt: string;
  type: string;
}

export interface EmailHistoryResponse {
  items: EmailHistoryItem[];
  summary: {
    totalSent: number;
    successCount: number;
    failedCount: number;
    /** 略過：後台停用模板、沒有真的寄出（daodao#294） */
    skippedCount: number;
    successRate: number;
  };
  pagination: OffsetPagination;
}

// ── Wish Pool / Roadmap ──────────────────────────────────────────────
export type WishCategory =
  | "operation"
  | "practice"
  | "social"
  | "explore"
  | "challenge"
  | "ai"
  | "profile"
  | "other";

export type WishStatus = "pending" | "linked" | "archived";

export type RoadmapStatus =
  | "collected"
  | "discussing"
  | "planned"
  | "in_progress"
  | "done"
  | "parked";

/** 游標分頁（許願池端點，與 OffsetPagination 不同） */
export interface CursorPagination {
  hasMore: boolean;
  nextCursor: string | null;
  count: number;
  limit: number;
}

export interface CursorResponse<T> {
  success: boolean;
  data: T[];
  pagination: CursorPagination;
  timestamp: string;
}

export interface AdminWishItem {
  id: number;
  category: WishCategory;
  situation: string;
  desire: string;
  status: WishStatus;
  contact_email: string | null;
  internal_module_tag: string | null;
  source: "web" | "app";
  linked_roadmap_item_id: number | null;
  created_at: string;
  submitter: {
    external_id: string | null;
    nickname: string | null;
    email: string | null;
  };
}

export interface AdminRoadmapItem {
  id: number;
  external_id: string;
  title: string;
  description: string;
  category: WishCategory;
  status: RoadmapStatus;
  support_count: number;
  is_public: boolean;
  pinned: boolean;
  sort_order: number;
  shipped_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LinkWishPayload {
  roadmap_item_id: number;
  internal_module_tag?: string;
}

export interface PromoteWishPayload {
  title: string;
  description: string;
  category: WishCategory;
  status?: RoadmapStatus;
  internal_module_tag?: string;
}

export interface CreateRoadmapItemPayload {
  title: string;
  description: string;
  category: WishCategory;
  status?: RoadmapStatus;
  is_public?: boolean;
  pinned?: boolean;
  sort_order?: number;
}

export interface UpdateRoadmapItemPayload {
  title?: string;
  description?: string;
  category?: WishCategory;
  status?: RoadmapStatus;
  is_public?: boolean;
  pinned?: boolean;
  sort_order?: number;
}

export interface RoadmapReport {
  popularCategories: Array<{ category: WishCategory; count: number }>;
  popularItems: Array<{
    external_id: string;
    title: string;
    status: RoadmapStatus;
    support_count: number;
  }>;
  wishTrend: Array<{ period: string; count: number }>;
  backlog: {
    pendingCount: number;
    oldestPendingWaitingHours: number | null;
  };
}

// ── Survey (問卷) ─────────────────────────────────────────────────
export type SurveyStatus = "draft" | "active" | "closed" | "archived";

export interface AdminSurveyListItem {
  id: number;
  external_id: string;
  title: string;
  status: SurveyStatus;
  audience?: "public" | "members";
  is_anonymous: boolean;
  tags: string[];
  view_count: number;
  created_at: string;
  response_count: number;
  creator: {
    id: number | null;
    email: string | null;
    nickname: string | null;
  };
}

export interface AdminSurveyDetail extends AdminSurveyListItem {
  description: string | null;
  thank_you_message: string | null;
  max_responses: number | null;
  cover_url: string | null;
  logo_url?: string | null;
  use_default_logo?: boolean;
  use_default_banner?: boolean;
  updated_at: string;
  questions: Array<{
    id: number;
    question_text: string;
    question_type: string;
    is_required: boolean;
    position: number;
    text_response_length?: "short" | "long";
    scale_min?: number;
    scale_max?: number;
    scale_min_label?: string;
    scale_max_label?: string;
    options: Array<{ id: number; option_text: string; position: number }>;
  }>;
}

export interface AdminSurveyResponse {
  id: number;
  user_id: number | null;
  respondent_name?: string | null;
  completed_at: string;
  answer_count: number;
}

export interface AdminSurveyQuestionForm {
  question_text: string;
  question_type: string;
  is_required: boolean;
  position: number;
  text_response_length?: "short" | "long";
  scale_min?: number;
  scale_max?: number;
  scale_min_label?: string;
  scale_max_label?: string;
  options: Array<{ option_text: string; position: number }>;
}

export interface AdminSurveyCreatePayload {
  title: string;
  description?: string;
  thank_you_message?: string;
  cover_url?: string | null;
  logo_url?: string | null;
  use_default_logo?: boolean;
  use_default_banner?: boolean;
  audience?: "public" | "members";
  is_anonymous?: boolean;
  tags?: string[];
  max_responses?: number | null;
  start_time?: string | null;
  end_time?: string | null;
  questions?: AdminSurveyQuestionForm[];
}

export type AdminSurveyUpdatePayload = Partial<AdminSurveyCreatePayload>;

export interface AdminSurveyAnswerItem {
  question_id: number;
  question_text: string;
  question_type: string;
  answer_text: string | null;
  ranking_order?: string[];
  selected_option_ids: number[];
  selected_options: string[];
  rating_value: number | null;
  boolean_value: boolean | null;
}

export interface AdminSurveyResponseDetail {
  id: number;
  user_id: number | null;
  completed_at: string;
  answers: AdminSurveyAnswerItem[];
}

export interface AdminSurveyQuestionStats {
  avg?: number | null;
  min?: number | null;
  max?: number | null;
  true?: number;
  false?: number;
  option_counts?: Array<{ option_id: number; option_text: string; count: number }>;
  ranking_option_stats?: Array<{
    option_text: string;
    rank_counts: number[];
    avg_rank?: number | null;
  }>;
  sample_answers?: Array<string | null>;
}

export interface AdminSurveyPerQuestion {
  question_id: number;
  question_text: string;
  question_type: string;
  answer_count: number;
  stats: AdminSurveyQuestionStats;
}

export interface AdminSurveyAnalytics {
  survey_id: number;
  response_count: number;
  view_count: number;
  avg_duration_seconds: number | null;
  drop_off: Array<{ last_position: number; count: number }>;
  per_question: AdminSurveyPerQuestion[];
}

// ── Email Templates ──────────────────────────────────────────────────────────
export interface EmailTemplate {
  id: number;
  name: string;
  slug: string | null;
  subject: string;
  preheader: string | null;
  body: string;
  variables: string[];
  dataSource: "user" | "practice" | "event" | "none";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplateCreate {
  name: string;
  subject: string;
  preheader?: string;
  body: string;
  variables?: string[];
  dataSource?: "user" | "practice" | "event" | "none";
  isActive?: boolean;
  slug?: string;
}

export interface EmailTemplateUpdate {
  name?: string;
  subject?: string;
  preheader?: string;
  body?: string;
  variables?: string[];
  dataSource?: "user" | "practice" | "event" | "none";
  isActive?: boolean;
}

// ── Quiz / Persona / Engagement Analytics ───────────────────────────────────
export type LearningStyleType = "L" | "C" | "A" | "D" | "O";

export interface QuizStats {
  totalUsers: number;
  quizCompletedCount: number;
  quizCompletedRate: number;
  byRole: Record<LearningStyleType, { count: number; rate: number }>;
}

export interface PersonaStats {
  totalUsers: number;
  anyAnswerCount: number;
  anyAnswerRate: number;
  unlockedCount: number;
  unlockedRate: number;
  avgAnswerCount: number;
  answerCountDistribution: Array<{ answerCount: number; userCount: number }>;
  topQuestions: Array<{ questionId: number; prompt: string; answerCount: number }>;
}

export interface EngagementStats {
  practiceStats: {
    avgPracticeCount: number;
    avgActivePracticeCount: number;
    abandonmentRate: number;
  };
  checkinStats: {
    avgMaxStreak: number;
    usersWithStreak7Plus: number;
    usersWithStreak30Plus: number;
  };
  retentionByDay: Array<{ day: number; retentionRate: number }>;
}

export interface PersonaProfileAnswer {
  id: number;
  selectedValue: string | null;
  textAnswer: string | null;
  resonanceCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface PersonaProfileQuestion {
  id: number;
  prompt: string;
  questionType: "choice" | "sentence_completion" | "scenario";
  options: string[] | null;
  isNewUserPriority: boolean;
  isPlaceholder: boolean;
  answer: PersonaProfileAnswer | null;
}

export interface PersonaUserProfile {
  questions: PersonaProfileQuestion[];
  viewerIsLocked?: boolean;
  answersNeeded?: number;
}

export interface PersonaUser {
  userId: number;
  externalId: string;
  name: string;
  photoUrl: string | null;
  personaType: "D" | "A" | "O" | "L" | "C" | null;
  answerCount: number;
  lastAnsweredAt: string | null;
}

export interface PersonaQuestionAnswerItem {
  answerId: number;
  userId: string;
  name: string;
  photoURL: string | null;
  selectedValue: string | null;
  textAnswer: string | null;
  resonanceCount: number;
  answeredAt: string;
}

export interface PersonaQuestionAnswers {
  question: {
    id: number;
    prompt: string;
    questionType: string;
    options: string[] | null;
    totalAnswerCount: number;
  };
  answers: PersonaQuestionAnswerItem[];
  hasMore: boolean;
  nextCursor: string | null;
}

// ── Persona Question Admin ────────────────────────────────────────────────────
export type PersonaQuestionType = "choice" | "sentence_completion" | "scenario";

export interface AdminPersonaQuestionTranslation {
  locale: string;
  prompt: string;
  options: string[] | null;
}

export interface AdminPersonaQuestion {
  id: number;
  questionType: PersonaQuestionType;
  isNewUserPriority: boolean;
  createdAt: string;
  translations: AdminPersonaQuestionTranslation[];
}

export interface AdminPersonaQuestionCreate {
  questionType: PersonaQuestionType;
  isNewUserPriority?: boolean;
  translations: Array<{
    locale: string;
    prompt: string;
    options?: string[] | null;
  }>;
}

export interface AdminPersonaQuestionUpdate {
  questionType?: PersonaQuestionType;
  isNewUserPriority?: boolean;
}

export interface AdminPersonaTranslationUpsert {
  prompt: string;
  options?: string[] | null;
}

// ── Group Challenge（共同挑戰管理，daodao-server /api/v1/admin/challenges）──────
export type ChallengeRunStatus = "upcoming" | "ongoing" | "ended";
export type ChallengeEditStatus = "draft" | "published" | "archived";

export interface ChallengeProgram {
  id: number;
  organizationId: number;
  organizationName: string;
  name: string;
  description: string | null;
  cohortCount: number;
  publishedCohortCount: number;
  createdAt: string;
  updatedAt: string | null;
}

/** 共同挑戰只屬於島島阿學，所屬組織由 server 決定，不由前端指定 */
export interface ChallengeProgramCreate {
  name: string;
  description?: string | null;
}

export interface ChallengeProgramUpdate {
  name?: string;
  description?: string | null;
}

export interface ChallengeCohort {
  id: number;
  programId: number;
  slug: string;
  displayName: string;
  startDate: string;
  endDate: string;
  joinDeadline: string | null;
  capacity: number | null;
  status: ChallengeEditStatus;
  runStatus: ChallengeRunStatus;
  participantCount: number;
  template: { id: number; title: string; durationDays: number | null } | null;
  decks: Array<{ id: number; name: string }>;
  createdAt: string;
  updatedAt: string | null;
}

export interface ChallengeCohortCreate {
  displayName: string;
  startDate: string;
  endDate?: string;
  joinDeadline?: string | null;
  capacity?: number | null;
  templateId?: number | null;
}

export type ChallengeCohortUpdate = Partial<ChallengeCohortCreate>;

export interface ChallengeParticipant {
  enrollmentId: number;
  userId: number;
  nickname: string | null;
  joinedAt: string | null;
  practiceId: string | null;
  checkinCount: number;
}

export type PracticeTimePeriod = "morning" | "afternoon" | "evening" | "night" | "commute";

export interface ChallengeTemplate {
  id: number;
  externalId: string;
  organizationId: number;
  title: string;
  practiceAction: string | null;
  durationDays: number | null;
  frequencyMinDays: number | null;
  frequencyMaxDays: number | null;
  sessionDurationMinutes: number | null;
  practiceTimePeriods: PracticeTimePeriod[];
  boundCohortIds: number[];
  bindings: Array<{ cohortId: number; startDate: string | null }>;
  resources: Array<{ id: string; name: string; url: string | null; dayNumber: number | null }>;
  generatedDraftCount: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ChallengeTemplateCreate {
  title: string;
  practiceAction?: string | null;
  durationDays?: 7 | 14 | 21 | 30 | null;
  frequencyMinDays?: number | null;
  frequencyMaxDays?: number | null;
  sessionDurationMinutes?: 15 | 30 | 45 | 60 | null;
  practiceTimePeriods?: PracticeTimePeriod[];
}

export type ChallengeTemplateUpdate = Partial<ChallengeTemplateCreate>;

// ── Inspiration Decks（靈感卡卡組，daodao-server /api/v1/admin/inspiration-decks）──
export interface InspirationDeckSummary {
  id: number;
  name: string;
  cardCount: number;
  assignments: Array<{ cohortId: number; cohortName: string }>;
  createdAt: string;
  updatedAt: string | null;
}

export interface InspirationDeckCard {
  id: number;
  content: string;
  sortOrder: number;
}

export interface InspirationDeckDetail extends InspirationDeckSummary {
  cards: InspirationDeckCard[];
}

export interface InspirationDeckCreate {
  name: string;
  cards?: string[];
}

export interface InspirationImportResult {
  imported: number;
  errors: Array<{ row: number; reason: string }>;
}
