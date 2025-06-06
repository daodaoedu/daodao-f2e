import { MutationFetcher } from "swr/mutation";
import { mutations, parseToString, fetcher } from "@/services/core";
import { uploadImages } from "@/services/modules/images";

import {
  IdeaSchema,
  CreateIdeaSchema,
  UpdateIdeaSchema,
  DeleteIdeaSchema,
  IdeaQuerySchema,
  IdeaListResponseSchema,
} from "./schema";

export type IdeaSWRKey = string;

/**
 * 移除ID後綴的工具函數
 * 處理格式如 "idea_123" -> "idea" 的轉換
 */
function removeNumberSuffixStrict(id: string): string | null {
  if (!id || typeof id !== 'string') {
    return null;
  }

  // 使用正則表達式檢查是否以 _數字 結尾
  const match = id.match(/_\d+$/);
  if (!match) {
    return id; // 如果沒有匹配到 _數字 結尾，返回原字符串
  }

  // 移除匹配到的部分
  return id.substring(0, id.length - match[0].length);
}

interface GetIdeaPathnameProps {
  ideaId?: string;
  isMe?: boolean;
}

/**
 * 生成Ideas API路徑 (統一新舊API)
 * 兼容舊的 getIdeaEndpoint 函數
 */
export const getIdeaPathname = ({
  ideaId,
  isMe,
}: GetIdeaPathnameProps = {}) => {
  const pathname = "/ideas";

  if (ideaId) {
    const cleanId = removeNumberSuffixStrict(ideaId);
    return `${pathname}/${parseToString(cleanId)}`;
  }
  if (isMe) {
    return `${pathname}/me`;
  }

  return pathname;
};

/**
 * 向後相容的端點函數
 * @deprecated 使用 getIdeaPathname 替代
 */
export const getIdeaEndpoint = getIdeaPathname;

/**
 * 生成Ideas查詢參數字符串
 */
export const buildIdeaQueryString = (params: IdeaQuerySchema): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });

  return searchParams.toString();
};

// 靜態計數器，避免水合錯誤
let ideaCounter = 1000;

/**
 * 生成唯一 ID，避免服務端和客戶端不一致
 */
function generateUniqueId(): string {
  return `idea_${++ideaCounter}`;
}

interface IdeaAPIType {
  create: MutationFetcher<IdeaSchema, IdeaSWRKey, CreateIdeaSchema>;
  update: MutationFetcher<IdeaSchema, IdeaSWRKey, UpdateIdeaSchema>;
  delete: MutationFetcher<void, IdeaSWRKey, DeleteIdeaSchema>;
  list: (params?: IdeaQuerySchema) => Promise<IdeaListResponseSchema>;
  getById: (id: string) => Promise<IdeaSchema>;
}

const ideaAPI: IdeaAPIType = {
  /**
   * 創建新的Idea (整合新舊邏輯)
   */
  create: async (_, { arg }) => {
    console.log('創建 Idea API 調用:', arg);
    console.log('API 端點:', getIdeaPathname());
    
    // 模擬網路延遲
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 使用固定的時間戳避免水合錯誤
    const baseTime = new Date('2024-12-07T10:00:00Z');
    const now = new Date(baseTime.getTime() + (ideaCounter * 1000)).toISOString();
    const id = generateUniqueId();
    
    // TODO: 暫時返回模擬數據，等待後端實現
    const mockResponse: IdeaSchema = {
      id,
      title: arg.title,
      content: arg.content,
      authorId: '1',
      authorName: '測試用戶',
      authorAvatar: '',
      tags: arg.tags || [],
      imageUrls: arg.imageUrls || [],
      videoUrls: arg.videoUrls || [],
      visibility: arg.visibility || 'public',
      isLiked: false,
      likeCount: 0,
      commentCount: 0,
      viewCount: 0,
      shareCount: 0,
      status: 'active',
      createdDate: now,
      updatedDate: now,
      ideaResources: arg.ideaResources || []
    };
    
    console.log('返回模擬數據:', mockResponse);
    
    return mockResponse;
    
    /* 真實 API 調用（整合舊邏輯，等後端實現後啟用）
    const {
      imageFiles,
      imageUrls,
      videoFiles,
      videoUrls,
      ...ideaData
    } = arg;

    try {
      // 處理圖片上傳 (使用新的 uploadImages 函數)
      const updatedImageUrls = await uploadImages(imageFiles, imageUrls);
      
      // 處理影片上傳（如果有的話）
      const updatedVideoUrls = videoFiles 
        ? await uploadImages(videoFiles, videoUrls) 
        : videoUrls;

      const payload = {
        ...ideaData,
        imageUrls: updatedImageUrls,
        videoUrls: updatedVideoUrls,
      };
      
      console.log('發送到後端的數據:', payload);

      return mutations.post<IdeaSchema>(getIdeaPathname(), payload);
    } catch (error) {
      console.error('創建 Idea 失敗:', error);
      throw error;
    }
    */
  },

  /**
   * 更新現有的Idea (整合新舊邏輯)
   */
  update: async (_, { arg }) => {
    const {
      id,
      imageFiles,
      imageUrls,
      videoFiles,
      videoUrls,
      ...ideaData
    } = arg;

    try {
      // 處理圖片上傳
      const updatedImageUrls = await uploadImages(imageFiles, imageUrls);
      
      // 處理影片上傳（如果有的話）
      const updatedVideoUrls = videoFiles 
        ? await uploadImages(videoFiles, videoUrls) 
        : videoUrls;

      const payload = {
        ...ideaData,
        imageUrls: updatedImageUrls,
        videoUrls: updatedVideoUrls,
      };

      return mutations.put<IdeaSchema>(getIdeaPathname({ ideaId: id }), payload);
    } catch (error) {
      console.error('更新 Idea 失敗:', error);
      throw error;
    }
  },

  /**
   * 刪除Idea (整合新舊邏輯)
   */
  delete: async (_, { arg }) => {
    try {
      return await mutations.delete<void>(getIdeaPathname({ ideaId: arg.id }));
    } catch (error) {
      console.error('刪除 Idea 失敗:', error);
      throw error;
    }
  },

  /**
   * 獲取Ideas列表 (新功能)
   */
  list: async (params: Partial<IdeaQuerySchema> = {}) => {
    console.log('獲取 Ideas 列表:', params);
    
    // 模擬網路延遲
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // TODO: 暫時返回模擬數據
    const mockData: IdeaListResponseSchema = {
      data: [
        {
          id: 'static_1',
          title: '學習 React 的最佳實踐',
          content: '分享我在學習 React 過程中發現的一些最佳實踐和技巧...',
          authorId: '1',
          authorName: 'Alice',
          authorAvatar: '',
          tags: ['React', '前端', '程式設計'],
          imageUrls: [],
          videoUrls: [],
          visibility: 'public',
          isLiked: false,
          likeCount: 15,
          commentCount: 3,
          viewCount: 120,
          shareCount: 2,
          status: 'active',
          createdDate: '2024-12-01T10:00:00Z',
          updatedDate: '2024-12-01T10:00:00Z',
          ideaResources: [
            {
              name: 'React 官方文檔',
              url: 'https://react.dev'
            }
          ]
        },
        {
          id: 'static_2',
          title: 'UX 設計心得分享',
          content: '最近在設計用戶介面時學到的一些心得...',
          authorId: '2',
          authorName: 'Bob',
          authorAvatar: '',
          tags: ['UX設計', '設計'],
          imageUrls: [],
          videoUrls: [],
          visibility: 'public',
          isLiked: true,
          likeCount: 8,
          commentCount: 1,
          viewCount: 85,
          shareCount: 1,
          status: 'active',
          createdDate: '2024-11-30T15:30:00Z',
          updatedDate: '2024-11-30T15:30:00Z',
          ideaResources: []
        }
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        totalCount: 2,
        totalPages: 1
      }
    };
    
    return mockData;
    
    /* 真實 API 調用（等後端實現後啟用）
    const queryString = buildIdeaQueryString(params);
    const url = queryString 
      ? `${getIdeaPathname()}?${queryString}` 
      : getIdeaPathname();
    
    return fetcher<IdeaListResponseSchema>(url);
    */
  },

  /**
   * 根據ID獲取單個Idea (新功能)
   */
  getById: async (id: string) => {
    try {
      return await fetcher<IdeaSchema>(getIdeaPathname({ ideaId: id }));
    } catch (error) {
      console.error('獲取 Idea 失敗:', error);
      throw error;
    }
  },
};

// 向後相容的函數 - 與舊 services/ideas 保持一致
/**
 * @deprecated 使用 ideaAPI.create 替代
 */
export const createIdea = async (arg: CreateIdeaSchema) => {
  return ideaAPI.create('', { arg });
};

/**
 * @deprecated 使用 ideaAPI.update 替代
 */
export const updateIdea = async (arg: UpdateIdeaSchema) => {
  return ideaAPI.update('', { arg });
};

/**
 * @deprecated 使用 ideaAPI.delete 替代
 */
export const deleteIdea = async (ideaId: string) => {
  return ideaAPI.delete('', { arg: { id: ideaId } });
};

export default ideaAPI;
