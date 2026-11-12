import apiClient, { slowApiClient } from './client'
import type {
  AdminPingData,
  AdminRoadmapItem,
  AdminUserListItem,
  AdminWishItem,
  AIQueryLog,
  AIServiceConfig,
  AIServiceConfigCreate,
  AIServiceConfigUpdate,
  ApiResponse,
  AuthMeData,
  CursorResponse,
  DashboardStats,
  FeedRankingConfig,
  FeedRankingConfigCreate,
  FeedRankingConfigUpdate,
  InsightPractice,
  InsightUser,
  LLMModel,
  LLMModelCreate,
  ModelSyncResult,
  OffsetPagination,
  PaginatedApiResponse,
  Permission,
  PlaygroundChatRequest,
  PlaygroundChatResponse,
  PlaygroundInsightRequest,
  PlaygroundInsightResponse,
  QueryLogFilters,
  RoadmapReport,
  RoadmapStatus,
  Role,
  RoleWithPermissions,
  SystemPrompt,
  SystemPromptCreate,
  SystemPromptUpdate,
  UserQuota,
  UserRoleInfo,
  UserWithQuota,
  WishCategory,
  WishStatus,
} from './types'

// ── Auth (admin-backend) ─────────────────────────────────
export const ping = () => apiClient.get<ApiResponse<AdminPingData>>('/api/v1/admin/ping')

// ── Auth (daodao-server) ─────────────────────────────────
export const getAuthMe = () =>
  apiClient.get<ApiResponse<AuthMeData>>('/daodao-server/api/v1/auth/me')

export const authLogout = () => apiClient.post('/daodao-server/api/v1/auth/logout')

export const authRefresh = () =>
  apiClient.post<ApiResponse<{ token: string }>>('/daodao-server/api/v1/auth/refresh')

// ── Dashboard ─────────────────────────────────────────────
export const getDashboardStats = (dateFrom?: string, dateTo?: string) =>
  apiClient.get<ApiResponse<DashboardStats>>('/api/v1/admin/dashboard/stats', {
    params: { date_from: dateFrom, date_to: dateTo },
  })

// ── System Prompts ────────────────────────────────────────
export const listSystemPrompts = (params?: {
  is_active?: boolean
  limit?: number
  offset?: number
}) =>
  apiClient.get<ApiResponse<SystemPrompt[]>>('/api/v1/admin/system-prompts', {
    params,
  })

export const getSystemPrompt = (id: number) =>
  apiClient.get<ApiResponse<SystemPrompt>>(`/api/v1/admin/system-prompts/${id}`)

export const createSystemPrompt = (data: SystemPromptCreate) =>
  apiClient.post<ApiResponse<SystemPrompt>>('/api/v1/admin/system-prompts', data)

export const updateSystemPrompt = (id: number, data: SystemPromptUpdate) =>
  apiClient.put<ApiResponse<SystemPrompt>>(`/api/v1/admin/system-prompts/${id}`, data)

export const deleteSystemPrompt = (id: number) =>
  apiClient.delete<ApiResponse<{ deleted: boolean; id: number }>>(
    `/api/v1/admin/system-prompts/${id}`,
  )

// ── LLM Models ────────────────────────────────────────────
export const listLLMModels = (params?: { provider?: string; is_active?: boolean }) =>
  apiClient.get<ApiResponse<LLMModel[]>>('/api/v1/admin/llm-models', { params })

export const createLLMModel = (data: LLMModelCreate) =>
  apiClient.post<ApiResponse<LLMModel>>('/api/v1/admin/llm-models', data)

export const updateLLMModel = (id: number, data: Partial<LLMModelCreate>) =>
  apiClient.put<ApiResponse<LLMModel>>(`/api/v1/admin/llm-models/${id}`, data)

export const deleteLLMModel = (id: number) =>
  apiClient.delete<ApiResponse<{ deleted: boolean; id: number }>>(`/api/v1/admin/llm-models/${id}`)

export const syncProviderModels = (provider: string) =>
  apiClient.post<ApiResponse<ModelSyncResult>>(`/api/v1/admin/llm-models/sync/${provider}`)

// ── AI Query Logs ─────────────────────────────────────────
export const listQueryLogs = (params?: QueryLogFilters) =>
  apiClient.get<ApiResponse<AIQueryLog[]> & { pagination: OffsetPagination }>(
    '/api/v1/admin/query-logs',
    { params },
  )

export const getQueryLog = (id: number) =>
  apiClient.get<ApiResponse<AIQueryLog>>(`/api/v1/admin/query-logs/${id}`)

// ── User Quotas ───────────────────────────────────────────
export const listUsers = (params?: { limit?: number; offset?: number; search?: string }) =>
  apiClient.get<ApiResponse<UserWithQuota[]>>('/api/v1/admin/users', { params })

export const getUserQuota = (userId: number) =>
  apiClient.get<
    ApiResponse<{
      user_id: number
      current_month_tokens_used: number
      quota: UserQuota | null
    }>
  >(`/api/v1/admin/users/${userId}/quota`)

// ── Playground ────────────────────────────────────────────
export const playgroundChat = (data: PlaygroundChatRequest) =>
  slowApiClient.post<ApiResponse<PlaygroundChatResponse>>('/api/v1/admin/playground/chat', data)

// ── User Quotas ───────────────────────────────────────────
export const upsertUserQuota = (
  userId: number,
  data: {
    monthly_token_limit: number
    daily_token_limit?: number | null
    quota_month?: number
  },
) => apiClient.put<ApiResponse<UserQuota>>(`/api/v1/admin/users/${userId}/quota`, data)

// ── Insight Playground ────────────────────────────────────
export const listInsightUsers = () =>
  apiClient.get<ApiResponse<InsightUser[]>>('/api/v1/admin/playground/insight/users')

export const listInsightPractices = (userId: number) =>
  apiClient.get<ApiResponse<InsightPractice[]>>('/api/v1/admin/playground/insight/practices', {
    params: { user_id: userId },
  })

export const playgroundInsight = (body: PlaygroundInsightRequest) =>
  slowApiClient.post<ApiResponse<PlaygroundInsightResponse>>(
    '/api/v1/admin/playground/insight',
    body,
  )

export const saveInsightResult = (data: { practice_id: number; insight: string }) =>
  apiClient.post<ApiResponse<{ saved: boolean; practice_id: number }>>(
    '/api/v1/admin/playground/insight/save',
    data,
  )

// ── AI Service Configs ────────────────────────────────
export const listAIServiceConfigs = (params?: { service?: string }) =>
  apiClient.get<ApiResponse<AIServiceConfig[]>>('/api/v1/admin/ai-service-configs', { params })

export const createAIServiceConfig = (data: AIServiceConfigCreate) =>
  apiClient.post<ApiResponse<AIServiceConfig>>('/api/v1/admin/ai-service-configs', data)

export const updateAIServiceConfig = (id: number, data: AIServiceConfigUpdate) =>
  apiClient.put<ApiResponse<AIServiceConfig>>(`/api/v1/admin/ai-service-configs/${id}`, data)

export const deleteAIServiceConfig = (id: number) =>
  apiClient.delete<ApiResponse<{ deleted: boolean; id: number }>>(
    `/api/v1/admin/ai-service-configs/${id}`,
  )

export const activateAIServiceConfig = (id: number) =>
  apiClient.post<ApiResponse<AIServiceConfig>>(`/api/v1/admin/ai-service-configs/${id}/activate`)

// ── Feed Ranking Configs ────────────────────────────────
export const listFeedRankingConfigs = () =>
  apiClient.get<ApiResponse<FeedRankingConfig[]>>('/api/v1/admin/feed-ranking-configs')

export const createFeedRankingConfig = (data: FeedRankingConfigCreate) =>
  apiClient.post<ApiResponse<FeedRankingConfig>>('/api/v1/admin/feed-ranking-configs', data)

export const updateFeedRankingConfig = (id: number, data: FeedRankingConfigUpdate) =>
  apiClient.put<ApiResponse<FeedRankingConfig>>(`/api/v1/admin/feed-ranking-configs/${id}`, data)

export const deleteFeedRankingConfig = (id: number) =>
  apiClient.delete<ApiResponse<{ deleted: boolean; id: number }>>(
    `/api/v1/admin/feed-ranking-configs/${id}`,
  )

export const activateFeedRankingConfig = (id: number) =>
  apiClient.post<ApiResponse<FeedRankingConfig>>(
    `/api/v1/admin/feed-ranking-configs/${id}/activate`,
  )

// ── Roles (daodao-server) ─────────────────────────────────
export const listRoles = () =>
  apiClient.get<ApiResponse<Role[]>>('/daodao-server/api/v1/admin/roles')

export const getRoleWithPermissions = (id: number) =>
  apiClient.get<ApiResponse<RoleWithPermissions>>(`/daodao-server/api/v1/admin/roles/${id}`)

export const createRole = (data: { name: string; description?: string }) =>
  apiClient.post<ApiResponse<Role>>('/daodao-server/api/v1/admin/roles', data)

export const updateRole = (id: number, data: { name?: string; description?: string }) =>
  apiClient.put<ApiResponse<Role>>(`/daodao-server/api/v1/admin/roles/${id}`, data)

export const deleteRole = (id: number) =>
  apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/daodao-server/api/v1/admin/roles/${id}`)

export const addRolePermission = (roleId: number, permissionId: number) =>
  apiClient.post<ApiResponse<{ success: boolean }>>(
    `/daodao-server/api/v1/admin/roles/${roleId}/permissions`,
    { permissionId },
  )

export const removeRolePermission = (roleId: number, permissionId: number) =>
  apiClient.delete<ApiResponse<{ success: boolean }>>(
    `/daodao-server/api/v1/admin/roles/${roleId}/permissions/${permissionId}`,
  )

// ── Permissions (daodao-server) ──────────────────────────
export const listPermissions = () =>
  apiClient.get<ApiResponse<Permission[]>>('/daodao-server/api/v1/admin/permissions')

export const createPermission = (data: { name: string; description?: string }) =>
  apiClient.post<ApiResponse<Permission>>('/daodao-server/api/v1/admin/permissions', data)

export const updatePermission = (id: number, data: { name?: string; description?: string }) =>
  apiClient.put<ApiResponse<Permission>>(`/daodao-server/api/v1/admin/permissions/${id}`, data)

export const deletePermission = (id: number) =>
  apiClient.delete<ApiResponse<{ deleted: boolean }>>(
    `/daodao-server/api/v1/admin/permissions/${id}`,
  )

// ── User Management (daodao-server) ──────────────────────
export const listAdminUsers = (params?: {
  search?: string
  page?: number
  limit?: number
  roleId?: number
  isActive?: boolean
  isVerified?: boolean
  personaType?: 'L' | 'C' | 'A' | 'D' | 'O'
  lastLoginFrom?: string
  lastLoginTo?: string
  createdFrom?: string
  createdTo?: string
  lastLoginPresence?: 'with' | 'without'
  lastActivityFrom?: string
  lastActivityTo?: string
  lastActivityPresence?: 'with' | 'without'
  sortBy?: 'createdAt' | 'lastLoginAt' | 'lastActiveAt' | 'name' | 'email'
  sortOrder?: 'asc' | 'desc'
}) =>
  apiClient.get<PaginatedApiResponse<AdminUserListItem>>('/daodao-server/api/v1/admin/users', {
    params,
  })

export const getUserRole = (userId: number) =>
  apiClient.get<ApiResponse<UserRoleInfo>>(`/daodao-server/api/v1/admin/users/${userId}/role`)

export const updateUserRole = (userId: number, roleId: number) =>
  apiClient.put<ApiResponse<{ success: boolean }>>(
    `/daodao-server/api/v1/admin/users/${userId}/role`,
    { roleId },
  )

export const updateUserStatus = (userId: number, isActive: boolean) =>
  apiClient.put<ApiResponse<{ success: boolean }>>(
    `/daodao-server/api/v1/admin/users/${userId}/status`,
    { isActive },
  )

// ── Wishpool / Roadmap (daodao-server) ───────────────────
export const listWishes = (params?: {
  status?: WishStatus
  category?: WishCategory
  q?: string
  cursor?: string
  limit?: number
}) => apiClient.get<CursorResponse<AdminWishItem>>('/daodao-server/api/v1/admin/wishes', { params })

export const linkWish = (
  id: number,
  data: { roadmap_item_id: number; internal_module_tag?: string },
) =>
  apiClient.post<ApiResponse<{ id: number; linked_roadmap_item_id: number }>>(
    `/daodao-server/api/v1/admin/wishes/${id}/link`,
    data,
  )

export const promoteWish = (
  id: number,
  data: {
    title: string
    description: string
    category: WishCategory
    status?: RoadmapStatus
    internal_module_tag?: string
  },
) =>
  apiClient.post<ApiResponse<{ id: number; linked_roadmap_item_id: number; external_id: string }>>(
    `/daodao-server/api/v1/admin/wishes/${id}/promote`,
    data,
  )

export const archiveWish = (id: number) =>
  apiClient.post<ApiResponse<{ id: number }>>(`/daodao-server/api/v1/admin/wishes/${id}/archive`)

export const listRoadmapItems = (params?: {
  status?: RoadmapStatus
  category?: WishCategory
  cursor?: string
  limit?: number
}) =>
  apiClient.get<CursorResponse<AdminRoadmapItem>>('/daodao-server/api/v1/admin/roadmap/items', {
    params,
  })

export const createRoadmapItem = (data: {
  title: string
  description: string
  category: WishCategory
  status?: RoadmapStatus
  is_public?: boolean
  pinned?: boolean
  sort_order?: number
}) =>
  apiClient.post<ApiResponse<AdminRoadmapItem>>('/daodao-server/api/v1/admin/roadmap/items', data)

export const updateRoadmapItem = (
  id: number,
  data: Partial<{
    title: string
    description: string
    category: WishCategory
    status: RoadmapStatus
    is_public: boolean
    pinned: boolean
    sort_order: number
  }>,
) =>
  apiClient.patch<ApiResponse<AdminRoadmapItem>>(
    `/daodao-server/api/v1/admin/roadmap/items/${id}`,
    data,
  )

export const getRoadmapReport = (params?: {
  range?: 'week' | 'month' | 'quarter' | 'year'
  status?: RoadmapStatus
}) =>
  apiClient.get<ApiResponse<RoadmapReport>>('/daodao-server/api/v1/admin/roadmap/reports', {
    params,
  })
