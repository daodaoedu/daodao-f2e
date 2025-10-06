import { fetcher, mutations } from '@/utils/http';
import type {
  IdeaListResponseSchema,
  CreateIdeaRequestSchema,
  UpdateIdeaRequestSchema,
  IdeaSearchParamsSchema,
  IdeaSchema,
  IdeaMutationResponseSchema,
} from './schema';

// API 端點
const IDEA_BASE_PATH = '/api/v1/ideas';

function getIdeaPathname(params?: { id?: string | number }): string {
  if (params?.id) {
    return `${IDEA_BASE_PATH}/${params.id}`;
  }
  return IDEA_BASE_PATH;
}

export function buildIdeaQueryString(params?: IdeaSearchParamsSchema): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append('page', params.page.toString());
  if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
  if (params.search) searchParams.append('search', params.search);
  if (params.tags) {
    if (Array.isArray(params.tags)) {
      params.tags.forEach(tag => searchParams.append('tags', tag));
    } else {
      searchParams.append('tags', params.tags);
    }
  }
  if (params.userId) searchParams.append('userId', params.userId);
  if (params.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

  return searchParams.toString();
}

// API 類別
class IdeaAPI {
  /**
   * 取得想法列表
   */
  async readList(params?: IdeaSearchParamsSchema): Promise<IdeaListResponseSchema> {
    const queryString = buildIdeaQueryString(params);
    const url = queryString ? `${IDEA_BASE_PATH}?${queryString}` : IDEA_BASE_PATH;

    return fetcher<IdeaListResponseSchema>(url);
  }

  /**
   * 取得單個想法詳情
   */
  async read(ideaId: string): Promise<IdeaSchema> {
    return fetcher<IdeaSchema>(getIdeaPathname({ id: ideaId }));
  }

  /**
   * 建立新想法
   */
  async create(data: CreateIdeaRequestSchema): Promise<IdeaMutationResponseSchema> {
    return mutations.post<IdeaMutationResponseSchema>(IDEA_BASE_PATH, data);
  }

  /**
   * 更新想法
   */
  async update(data: UpdateIdeaRequestSchema): Promise<IdeaMutationResponseSchema> {
    return mutations.put<IdeaMutationResponseSchema>(getIdeaPathname({ id: data.id }), data);
  }

  /**
   * 刪除想法
   */
  async delete(id: string): Promise<void> {
    return mutations.delete<void>(getIdeaPathname({ id }));
  }

  /**
   * 按讚想法
   */
  async like(id: string): Promise<IdeaSchema> {
    return mutations.post<IdeaSchema>(`${getIdeaPathname({ id })}/like`);
  }

  /**
   * 取消按讚想法
   */
  async unlike(id: string): Promise<IdeaSchema> {
    return mutations.delete<IdeaSchema>(`${getIdeaPathname({ id })}/like`);
  }
}

// 匯出 API 實例
export const ideaAPI = new IdeaAPI();