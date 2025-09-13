// Imports will be used when implementing real API calls
// import { parseToNumber } from '@/utils/helper';
// import { fetcher, mutations } from '@/utils/http';
import type {
  IdeaListResponseSchema,
  // IdeaDetailResponseSchema,
  IdeaMutationResponseSchema,
  CreateIdeaRequestSchema,
  UpdateIdeaRequestSchema,
  DeleteIdeaSchema,
  IdeaSearchParamsSchema,
  IdeaSchema,
} from './schema';
import { ideaListResponseSchema } from './schema';
import {
  IdeaError,
  IdeaErrorFactory,
  IdeaErrorHandler,
  createNotFoundError,
} from './errors';

// API endpoints
const IDEA_BASE_PATH = '/api/ideas';

export function getIdeaPathname(params?: { id?: string | number }): string {
  if (params?.id) {
    return `${IDEA_BASE_PATH}/${params.id}`;
  }
  return IDEA_BASE_PATH;
}

// URL 查詢參數建構
export function buildIdeaQueryString(params?: IdeaSearchParamsSchema): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  if (params.search) searchParams.append('search', params.search);
  if (params.tags) searchParams.append('tags', params.tags);
  if (params.sortBy && params.sortBy !== 'createdDate') {
    searchParams.append('sortBy', params.sortBy);
  }
  if (params.sortOrder && params.sortOrder !== 'desc') {
    searchParams.append('sortOrder', params.sortOrder);
  }
  if (params.userId) searchParams.append('userId', params.userId);

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// Mock 資料 (開發用)
const mockIdeaList: IdeaListResponseSchema = {
  ideas: [
    {
      id: '1',
      content: '經過一年的自學程式設計，我想分享一些學習心得和遇到的挑戰。從最初的 HTML、CSS 基礎開始，到現在能夠獨立開發小型網站應用，這段旅程充滿了挫折和收穫。特別是在學習 JavaScript 的時候，原型鏈和閉包的概念讓我卡了很久，但透過大量的練習和閱讀相關文章，終於有所突破。',
      user: {
        _id: 'user1',
        id: '1',
        name: '陳小明',
        roleList: ['學生'],
        photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      },
      tags: ['程式設計', '自學', '心得', 'JavaScript', '前端開發'],
      imageUrls: [],
      videoUrls: [],
      isLiked: false,
      likeCount: 15,
      commentCount: 3,
      viewCount: 120,
      shareCount: 2,
      status: 'active',
      createdDate: '2024-01-15T10:00:00Z',
      updatedDate: '2024-01-15T10:00:00Z',
      ideaResources: [
        {
          name: 'MDN Web Docs - JavaScript 指南',
          url: 'https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Guide',
        },
        {
          name: 'freeCodeCamp - 免費程式學習平台',
          url: 'https://www.freecodecamp.org',
        }
      ],
    },
    {
      id: '2',
      content: '參加了一場設計思維工作坊，學到了很多創新方法和解決問題的思維模式。講師帶我們從用戶同理心開始，透過訪談、觀察等方式真正理解使用者需求，然後進行腦力激盪和原型製作。這種以人為中心的設計方法讓我重新思考產品開發的流程，不再只是從技術角度出發，而是真正關注使用者體驗。',
      user: {
        _id: 'user2',
        id: '2',
        name: '林小華',
        roleList: ['設計師'],
        photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=40&h=40&fit=crop&crop=face',
      },
      tags: ['設計思維', '工作坊', '創新', 'UX設計', '用戶研究'],
      imageUrls: [],
      videoUrls: [],
      isLiked: true,
      likeCount: 28,
      commentCount: 7,
      viewCount: 200,
      shareCount: 5,
      status: 'active',
      createdDate: '2024-01-14T14:30:00Z',
      updatedDate: '2024-01-14T14:30:00Z',
      ideaResources: [
        {
          name: 'IDEO Design Thinking 課程',
          url: 'https://www.ideou.com/pages/design-thinking',
        }
      ],
    },
    {
      id: '3',
      content: '最近開始學習數據科學，發現數學基礎真的很重要！統計學、線性代數這些以前覺得很抽象的概念，現在在機器學習中都能找到實際應用。特別是在處理資料清理和特徵工程時，對數據的理解和直覺變得非常關鍵。推薦給想學 AI 的朋友們，不要忽略數學基礎的重要性。',
      user: {
        _id: 'user3',
        id: '3',
        name: '王小美',
        roleList: ['工程師'],
        photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      },
      tags: ['數據科學', '機器學習', '數學', 'AI', '統計學'],
      imageUrls: [],
      videoUrls: [],
      isLiked: false,
      likeCount: 42,
      commentCount: 12,
      viewCount: 350,
      shareCount: 8,
      status: 'active',
      createdDate: '2024-01-13T09:15:00Z',
      updatedDate: '2024-01-13T09:15:00Z',
      ideaResources: [
        {
          name: 'Coursera - 機器學習課程',
          url: 'https://www.coursera.org/learn/machine-learning',
        },
        {
          name: 'Kaggle Learn - 免費數據科學課程',
          url: 'https://www.kaggle.com/learn',
        }
      ],
    },
    {
      id: '4',
      content: '分享一個語言學習的心得：沉浸式學習真的有效！我開始看英文 YouTube 影片、聽 Podcast，甚至把手機介面都改成英文。雖然一開始很不習慣，但慢慢發現自己的聽力和語感都有明顯進步。重點是要選擇自己感興趣的內容，這樣學習才不會變成負擔。',
      user: {
        _id: 'user4',
        id: '4',
        name: '張小偉',
        roleList: ['學生'],
        photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      },
      tags: ['語言學習', '英文', '沉浸式學習', 'YouTube', 'Podcast'],
      imageUrls: [],
      videoUrls: [],
      isLiked: true,
      likeCount: 19,
      commentCount: 5,
      viewCount: 180,
      shareCount: 3,
      status: 'active',
      createdDate: '2024-01-12T16:45:00Z',
      updatedDate: '2024-01-12T16:45:00Z',
      ideaResources: [
        {
          name: 'TED Talks - 英語演講',
          url: 'https://www.ted.com/talks',
        }
      ],
    },
    {
      id: '5',
      content: '創業一年的反思：失敗真的是最好的老師。我的第一個產品因為沒有做好市場驗證就直接開發，結果花了大半年時間做出來卻沒有人要用。現在重新開始，我學會了先做 MVP，早期就開始收集用戶反饋，iterate 的速度也快很多。給想創業的朋友：don\'t be afraid to fail fast and learn faster!',
      user: {
        _id: 'user5',
        id: '5',
        name: '劉小強',
        roleList: ['創業家'],
        photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
      },
      tags: ['創業', '產品開發', 'MVP', '用戶反饋', '失敗經驗'],
      imageUrls: [],
      videoUrls: [],
      isLiked: false,
      likeCount: 67,
      commentCount: 23,
      viewCount: 450,
      shareCount: 15,
      status: 'active',
      createdDate: '2024-01-11T11:20:00Z',
      updatedDate: '2024-01-11T11:20:00Z',
      ideaResources: [
        {
          name: 'Lean Startup 精實創業',
          url: 'https://theleanstartup.com',
        },
        {
          name: 'Product Hunt - 產品發現平台',
          url: 'https://www.producthunt.com',
        }
      ],
    }
  ],
  pagination: {
    page: 1,
    pageSize: 20,
    totalCount: 5,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
};

// 使用統一的錯誤處理系統 (已移至 errors.ts)

// API 配置介面
interface APIConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  retryAttempts?: number;
}

// 預設配置
const DEFAULT_CONFIG: Required<APIConfig> = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  retryAttempts: 3,
};

// 強型別 API 介面定義
class IdeaAPI {
  private config: Required<APIConfig>;

  constructor(config: APIConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 通用的 HTTP 請求方法，支持重試和完整的錯誤處理
   */
  private async request<T>(
    url: string,
    options: RequestInit = {},
    schema?: unknown,
    attempt: number = 1
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    const requestId = Math.random().toString(36).substring(2, 15);

    try {
      const response = await fetch(`${this.config.baseURL}${url}`, {
        ...options,
        headers: {
          ...this.config.headers,
          'X-Request-ID': requestId,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = IdeaErrorFactory.fromHttpResponse(
          response.status,
          errorData,
          requestId
        );

        // 記錄錯誤
        IdeaErrorHandler.logError(error, { url, method: options.method || 'GET' });

        // 如果錯誤可重試且未達到最大重試次數
        if (error.isRetryable() && attempt < this.config.retryAttempts) {
          const delay = IdeaErrorHandler.getRetryDelay(error, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.request(url, options, schema, attempt + 1);
        }

        throw error;
      }

      const data = await response.json();

      // 如果提供了 schema，進行驗證
      if (schema && typeof schema === 'object' && 'parse' in schema) {
        try {
          return (schema as { parse: (data: unknown) => T }).parse(data);
        } catch {
          throw new Error('Schema validation failed');
        }
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof IdeaError) throw error;

      // 處理網路錯誤
      const networkError = IdeaErrorFactory.fromNetworkError(error as Error);
      IdeaErrorHandler.logError(networkError, { url, method: options.method || 'GET' });

      // 如果錯誤可重試且未達到最大重試次數
      if (networkError.isRetryable() && attempt < this.config.retryAttempts) {
        const delay = IdeaErrorHandler.getRetryDelay(networkError, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.request(url, options, schema, attempt + 1);
      }

      throw networkError;
    }
  }

  // 錯誤處理已整合至 IdeaErrorFactory

  /**
   * 創建想法
   */
  create = async (data: CreateIdeaRequestSchema): Promise<{ success: boolean; data: IdeaSchema }> => {
    const result = await this.request<unknown>(
      IDEA_BASE_PATH,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    return {
      success: true,
      data: (result as { data?: IdeaSchema }).data || (result as IdeaSchema),
    };
  };

  /**
   * 更新想法
   */
  update = async (data: UpdateIdeaRequestSchema): Promise<{ success: boolean; data: IdeaSchema }> => {
    const result = await this.request<unknown>(
      `${IDEA_BASE_PATH}/${data.id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );

    return {
      success: true,
      data: (result as { data?: IdeaSchema }).data || (result as IdeaSchema),
    };
  };

  /**
   * 讀取單一想法
   */
  read = async (id: string): Promise<IdeaSchema> => {
    const result = await this.request<unknown>(`${IDEA_BASE_PATH}/${id}`);
    return (result as { data?: IdeaSchema }).data || (result as IdeaSchema);
  };

  /**
   * 讀取想法列表
   */
  readList = async (params?: IdeaSearchParamsSchema): Promise<IdeaListResponseSchema> => {
    const queryString = buildIdeaQueryString(params);
    const result = await this.request<unknown>(`${IDEA_BASE_PATH}${queryString}`);

    // 使用 schema 驗證返回的數據
    return ideaListResponseSchema.parse(result);
  };

  /**
   * 刪除想法
   */
  delete = async (id: string): Promise<void> => {
    await this.request<void>(`${IDEA_BASE_PATH}/${id}`, {
      method: 'DELETE',
    });
  };

  /**
   * 點讚想法
   */
  like = async (id: string): Promise<{ success: boolean; data: IdeaSchema }> => {
    const result = await this.request<unknown>(`${IDEA_BASE_PATH}/${id}/like`, {
      method: 'POST',
    });

    return {
      success: true,
      data: (result as { data?: IdeaSchema }).data || (result as IdeaSchema),
    };
  };

  /**
   * 取消點讚想法
   */
  async unlike(id: string): Promise<{ success: boolean; data: IdeaSchema }> {
    const result = await this.request<unknown>(`${IDEA_BASE_PATH}/${id}/like`, {
      method: 'DELETE',
    });

    return {
      success: true,
      data: (result as { data?: IdeaSchema }).data || (result as IdeaSchema),
    };
  }

  /**
   * 增加瀏覽次數
   */
  async incrementViewCount(id: string): Promise<{ success: boolean; data: IdeaSchema }> {
    const result = await this.request<unknown>(`${IDEA_BASE_PATH}/${id}/view`, {
      method: 'POST',
    });

    return {
      success: true,
      data: (result as { data?: IdeaSchema }).data || (result as IdeaSchema),
    };
  }

  /**
   * 批量操作
   */
  async batchDelete(ids: string[]): Promise<{ success: boolean; results: Array<{ id: string; success: boolean; error?: string }> }> {
    const result = await this.request<unknown>(`${IDEA_BASE_PATH}/batch`, {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });

    return result as { success: boolean; results: Array<{ id: string; success: boolean; error?: string }> };
  }

  /**
   * 搜索想法
   */
  async search(query: string, options?: {
    limit?: number;
    offset?: number;
    sortBy?: 'relevance' | 'createdDate' | 'likeCount';
    filters?: IdeaSearchParamsSchema;
  }): Promise<IdeaListResponseSchema> {
    const searchParams = new URLSearchParams({
      q: query,
      ...(options?.limit && { limit: options.limit.toString() }),
      ...(options?.offset && { offset: options.offset.toString() }),
      ...(options?.sortBy && { sortBy: options.sortBy }),
    });

    if (options?.filters) {
      const filterParams = buildIdeaQueryString(options.filters);
      if (filterParams) {
        searchParams.append('filters', filterParams.substring(1)); // 移除開頭的 '?'
      }
    }

    const result = await this.request<unknown>(`${IDEA_BASE_PATH}/search?${searchParams.toString()}`);

    return ideaListResponseSchema.parse(result);
  }

  /**
   * 獲取統計信息
   */
  async getStats(id?: string): Promise<{
    totalCount: number;
    publicCount: number;
    privateCount: number;
    totalViews: number;
    totalLikes: number;
    avgLikes: number;
  }> {
    const url = id ? `${IDEA_BASE_PATH}/${id}/stats` : `${IDEA_BASE_PATH}/stats`;
    return this.request<{
      totalCount: number;
      publicCount: number;
      privateCount: number;
      totalViews: number;
      totalLikes: number;
      avgLikes: number;
    }>(url);
  }
}

// 創建 API 實例
const productionAPI = new IdeaAPI();

// 環境感知的 API 實例 - 根據環境變數決定是否使用 Mock API
const useMockAPI = 'true';

console.log('🔧 API Configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  useMockAPI
});

// Mock API 輔助函數
const mockAPIDelay = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const simulateError = (rate: number = 0.1): boolean => {
  return Math.random() < rate;
};

// Mock API 函數集合
const mockRead = async (ideaId: string): Promise<IdeaSchema> => {
  await mockAPIDelay();

  // 模擬網路錯誤
  if (simulateError(0.05)) {
    throw IdeaErrorFactory.fromNetworkError(new Error('Network connection failed'));
  }

  const idea = mockIdeaList.ideas.find((ideaItem) => ideaItem.id === ideaId);
  if (!idea) {
    throw createNotFoundError(ideaId, 'idea');
  }

  return idea;
};

const mockReadList = async (params?: IdeaSearchParamsSchema): Promise<IdeaListResponseSchema> => {
  await mockAPIDelay();

  // 模擬網路錯誤
  if (simulateError(0.05)) {
    throw IdeaErrorFactory.fromNetworkError(new Error('Network connection failed'));
  }

  // 基本篩選邏輯
  let filteredIdeas = [...mockIdeaList.ideas];

  if (params?.search) {
    const searchTerm = params.search.toLowerCase();
    filteredIdeas = filteredIdeas.filter(
      (idea) =>
        idea.content.toLowerCase().includes(searchTerm)
    );
  }

  if (params?.tags) {
    filteredIdeas = filteredIdeas.filter((idea) =>
      idea.tags.some((tag) => tag.toLowerCase().includes(params.tags!.toLowerCase()))
    );
  }

  if (params?.userId) {
    filteredIdeas = filteredIdeas.filter((idea) => idea.user.id === params.userId);
  }

  // 排序
  if (params?.sortBy) {
    filteredIdeas.sort((a, b) => {
      const direction = params.sortOrder === 'asc' ? 1 : -1;

      switch (params.sortBy) {
        case 'likeCount':
          return direction * (a.likeCount - b.likeCount);
        case 'updatedDate':
          return direction * (new Date(a.updatedDate).getTime() - new Date(b.updatedDate).getTime());
        case 'createdDate':
        default:
          return direction * (new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime());
      }
    });
  }

  return {
    ideas: filteredIdeas,
    pagination: {
      page: 1,
      pageSize: filteredIdeas.length,
      totalCount: filteredIdeas.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };
};

const mockCreate = async (data: CreateIdeaRequestSchema): Promise<IdeaMutationResponseSchema> => {
  await mockAPIDelay();

  if (simulateError(0.05)) {
    throw new Error('Validation failed');
  }

  const newIdea: IdeaSchema = {
    id: `idea-${Date.now()}`,
    content: data.content,
    tags: data.tags || [],
    ideaResources: data.ideaResources || [],
    imageUrls: data.imageUrls || [],
    videoUrls: data.videoUrls || [],
    user: {
      _id: 'mock-user',
      id: '0',
      name: '測試用戶',
      roleList: ['學生'],
      photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    },
    status: 'active',
    isLiked: false,
    likeCount: 0,
    commentCount: 0,
    viewCount: 0,
    shareCount: 0,
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
  };

  mockIdeaList.ideas.unshift(newIdea);

  return {
    success: true,
    data: newIdea,
    message: 'Idea created successfully',
  };
};

const mockUpdate = async (data: UpdateIdeaRequestSchema): Promise<IdeaMutationResponseSchema> => {
  await mockAPIDelay();

  if (simulateError(0.05)) {
    throw new Error('Validation failed');
  }

  const ideaIndex = mockIdeaList.ideas.findIndex((idea) => idea.id === data.id);
  if (ideaIndex === -1) {
    throw createNotFoundError(data.id, 'idea');
  }

  const updatedIdea: IdeaSchema = {
    ...mockIdeaList.ideas[ideaIndex],
    ...data,
    updatedDate: new Date().toISOString(),
  };

  mockIdeaList.ideas[ideaIndex] = updatedIdea;

  return {
    success: true,
    data: updatedIdea,
    message: 'Idea updated successfully',
  };
};

const mockDelete = async (id: string): Promise<DeleteIdeaSchema> => {
  await mockAPIDelay();

  if (simulateError(0.05)) {
    throw IdeaErrorFactory.fromNetworkError(new Error('Network connection failed'));
  }

  const ideaIndex = mockIdeaList.ideas.findIndex((idea) => idea.id === id);
  if (ideaIndex === -1) {
    throw createNotFoundError(id, 'idea');
  }

  mockIdeaList.ideas.splice(ideaIndex, 1);

  return {
    id,
  };
};

const mockLike = async (id: string): Promise<IdeaMutationResponseSchema> => {
  await mockAPIDelay();

  if (simulateError(0.05)) {
    throw IdeaErrorFactory.fromNetworkError(new Error('Network connection failed'));
  }

  const ideaIndex = mockIdeaList.ideas.findIndex((idea) => idea.id === id);
  if (ideaIndex === -1) {
    throw createNotFoundError(id, 'idea');
  }

  const idea = mockIdeaList.ideas[ideaIndex];
  const updatedIdea: IdeaSchema = {
    ...idea,
    likeCount: idea.likeCount + 1,
    updatedDate: new Date().toISOString(),
  };

  mockIdeaList.ideas[ideaIndex] = updatedIdea;

  return {
    success: true,
    data: updatedIdea,
    message: 'Idea liked successfully',
  };
};

export const ideaAPI = useMockAPI
  ? {
      ...productionAPI,
      // 在開發環境中覆蓋某些方法使用 Mock API
      readList: (params?: IdeaSearchParamsSchema) => {
        console.log('🚀 Using Mock API for readList:', params);
        return mockReadList(params);
      },
      read: (id: string) => {
        console.log('🚀 Using Mock API for read:', id);
        return mockRead(id);
      },
      create: (data: CreateIdeaRequestSchema) => {
        console.log('🚀 Using Mock API for create:', data);
        return mockCreate(data);
      },
      update: (data: UpdateIdeaRequestSchema) => {
        console.log('🚀 Using Mock API for update:', data);
        return mockUpdate(data);
      },
      delete: (id: string) => {
        console.log('🚀 Using Mock API for delete:', id);
        return mockDelete(id);
      },
      like: (id: string) => {
        console.log('🚀 Using Mock API for like:', id);
        return mockLike(id);
      },
      unlike: (id: string) => {
        console.log('🚀 Using Mock API for unlike:', id);
        return mockLike(id); // Mock API 的 like 方法處理切換
      },
    }
  : productionAPI;

// 向後相容的函數 (gradual migration)
export function getIdeaEndpoint(id?: string): string {
  return getIdeaPathname(id ? { id } : undefined);
}

// 向後相容的創建函數 (已棄用，請使用 ideaAPI.create)
export async function createIdea(data: CreateIdeaRequestSchema): Promise<IdeaMutationResponseSchema> {
  try {
    const result = await ideaAPI.create(data);
    return {
      success: result.success,
      data: result.data,
      message: '想法創建成功',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '創建失敗',
    };
  }
}

// 向後相容的更新函數 (已棄用，請使用 ideaAPI.update)
export async function updateIdea(data: UpdateIdeaRequestSchema): Promise<IdeaMutationResponseSchema> {
  try {
    const result = await ideaAPI.update(data);
    return {
      success: result.success,
      data: result.data,
      message: '想法更新成功',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '更新失敗',
    };
  }
}

// 向後相容的刪除函數 (已棄用，請使用 ideaAPI.delete)
export async function deleteIdea(data: DeleteIdeaSchema): Promise<void> {
  await ideaAPI.delete(data.id);
}
