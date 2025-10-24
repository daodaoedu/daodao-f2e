import { MutationFetcher } from 'swr/mutation';
import { getTokenStorage } from '@/shared/lib/storage';
import {
  Practice,
  CheckInRecord,
  CreatePracticeInput,
  UpdatePracticeInput,
  CheckInInput,
  PracticeFilter,
  createPracticeSchema,
  updatePracticeSchema,
  checkInInputSchema
} from './schema';

export type PracticeSWRKey = string;

interface GetPracticePathnameProps {
  id?: string;
}

// API endpoints
const PRACTICE_BASE_PATH = '/api/v1/practices';

export const getPracticePathname = ({ id }: GetPracticePathnameProps = {}) =>
  id ? `${PRACTICE_BASE_PATH}/${id}` : PRACTICE_BASE_PATH;

// URL 查詢參數建構
export function buildPracticeQueryString(params?: PracticeFilter): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  if (params.searchTerm) searchParams.append('search', params.searchTerm);
  if (params.status && params.status.length > 0) {
    searchParams.append('status', params.status.join(','));
  }
  if (params.contentType && params.contentType.length > 0) {
    searchParams.append('contentType', params.contentType.join(','));
  }
  if (params.motivationType && params.motivationType.length > 0) {
    searchParams.append('motivationType', params.motivationType.join(','));
  }
  if (params.dateRange?.start) {
    searchParams.append('startDate', params.dateRange.start);
  }
  if (params.dateRange?.end) {
    searchParams.append('endDate', params.dateRange.end);
  }
  if (params.sortBy && params.sortBy !== 'updatedAt') {
    searchParams.append('sortBy', params.sortBy);
  }
  if (params.sortOrder && params.sortOrder !== 'desc') {
    searchParams.append('sortOrder', params.sortOrder);
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// Practice List Response Schema
export interface PracticeListResponseSchema {
  data: Practice[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

// HTTP 請求基礎類
class PracticeAPIClass {
  private config = {
    baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  };

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;
    const token = getTokenStorage().get();

    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        // Try to extract error message from response body
        let errorMessage = `HTTP error! status: ${response.status}`;

        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            // Check for common error message formats from backend
            if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.error?.message) {
              errorMessage = errorData.error.message;
            } else if (errorData.error && typeof errorData.error === 'string') {
              errorMessage = errorData.error;
            } else if (errorData.msg) {
              errorMessage = errorData.msg;
            } else if (errorData.detail) {
              errorMessage = errorData.detail;
            }

            // Handle 409 Conflict specifically for duplicate check-in
            if (response.status === 409 && errorMessage.includes('HTTP error')) {
              errorMessage = '今日已完成簽到';
            }
          }
        } catch (e) {
          // If response body is not JSON or parsing fails
          // Use default error message or status-specific message
          if (response.status === 409) {
            errorMessage = '今日已完成簽到';
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Practice API Error:', error);
      throw error;
    }
  }

  /**
   * 讀取 Practice 列表
   */
  readList = async (params?: PracticeFilter): Promise<PracticeListResponseSchema> => {
    const queryString = buildPracticeQueryString(params);

    try {
      const result = await this.request<any>(`${PRACTICE_BASE_PATH}${queryString}`);
      // 適配 pagination 格式差異
      const adaptedResult = {
        data: result.data || [],
        pagination: {
          page: result.pagination?.currentPage || 1,
          pageSize: result.pagination?.itemsPerPage || 20,
          totalCount: result.pagination?.totalItems || 0,
          totalPages: result.pagination?.totalPages || 1,
          hasNext: result.pagination?.hasNext,
          hasPrev: result.pagination?.hasPrev,
        }
      };
      return adaptedResult;
    } catch (error) {
      console.error('❌ Practice API Error:', error);
      throw error;
    }
  };

  /**
   * 讀取單一 Practice
   */
  read = async (id: string): Promise<Practice> => {
    const result = await this.request<unknown>(`${PRACTICE_BASE_PATH}/${id}`);
    const practice = (result as { data?: Practice }).data || (result as Practice);
    return practice;
  };

  /**
   * 創建新的 Practice
   */
  create = async (input: CreatePracticeInput): Promise<Practice> => {
    const validatedInput = createPracticeSchema.parse(input);
    const result = await this.request<any>(`${PRACTICE_BASE_PATH}`, {
      method: 'POST',
      body: JSON.stringify(validatedInput),
    });
    return (result as { data?: Practice }).data || (result as Practice);
  };

  /**
   * 更新 Practice
   */
  update = async (id: string, input: UpdatePracticeInput): Promise<Practice> => {
    const validatedInput = updatePracticeSchema.parse(input);
    const result = await this.request<any>(`${PRACTICE_BASE_PATH}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(validatedInput),
    });
    return (result as { data?: Practice }).data || (result as Practice);
  };

  /**
   * 刪除 Practice
   */
  delete = async (id: string): Promise<void> => {
    await this.request<void>(`${PRACTICE_BASE_PATH}/${id}`, {
      method: 'DELETE',
    });
  };

  /**
   * 獲取打卡記錄列表（支持分頁獲取所有記錄）
   */
  getCheckIns = async (practiceId: string): Promise<CheckInRecord[]> => {
    const allCheckIns: CheckInRecord[] = [];
    let page = 1;
    const limit = 100; // 後端最大限制為 100
    let hasMore = true;

    while (hasMore) {
      const result = await this.request<any>(`${PRACTICE_BASE_PATH}/${practiceId}/checkins?page=${page}&limit=${limit}`);

      // 處理不同的響應格式
      let data = (result as { data?: any[] }).data || (result as { items?: any[] }).items || [];

      // 如果 data 仍然是包裝對象，嘗試提取內部的數組
      if (data && typeof data === 'object' && 'items' in data) {
        data = (data as any).items || [];
      }

      // 映射後端字段到前端 schema
      const mappedData: CheckInRecord[] = data.map((item: any) => ({
        id: String(item.id),
        practiceId: String(item.practiceId),
        date: item.checkInDate, // 後端: checkInDate -> 前端: date
        progress: item.progressAmount || 0, // 後端: progressAmount -> 前端: progress
        totalProgress: item.cumulativeProgress || 0, // 後端: cumulativeProgress -> 前端: totalProgress
        note: item.note || '',
        mood: item.mood,
        tags: item.tags || [],
        createdAt: item.createdAt,
      }));

      if (mappedData.length > 0) {
        allCheckIns.push(...mappedData);
      }

      // 檢查是否還有更多數據
      if (data.length < limit) {
        hasMore = false;
      } else {
        page += 1;
      }
    }

    return allCheckIns;
  };

  /**
   * 簽到
   */
  checkIn = async (practiceId: string, input: CheckInInput): Promise<CheckInRecord> => {
    const validatedInput = checkInInputSchema.parse(input);
    const result = await this.request<any>(`${PRACTICE_BASE_PATH}/${practiceId}/checkins`, {
      method: 'POST',
      body: JSON.stringify(validatedInput),
    });
    return (result as { data?: CheckInRecord }).data || (result as CheckInRecord);
  };

  /**
   * 匯出資料
   */
  exportData = async (): Promise<string> => {
    const result = await this.request<any>(`${PRACTICE_BASE_PATH}/export`, {
      method: 'GET',
    });
    return result;
  };

  /**
   * 匯入資料
   */
  importData = async (data: string): Promise<void> => {
    await this.request<void>(`${PRACTICE_BASE_PATH}/import`, {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  };
}

// 創建 API 實例
const practiceAPIInstance = new PracticeAPIClass();

// 匯出 API 實例和方法
export const practiceAPI = practiceAPIInstance;

// 預設導出
export default practiceAPIInstance;

