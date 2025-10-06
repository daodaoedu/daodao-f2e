import type {
  CreateIdeaFormSchema,
  UpdateIdeaFormSchema,
  CreateIdeaRequestSchema,
  UpdateIdeaRequestSchema,
  IdeaSchema,
} from '@/services/ideas/schema';
import { ideaSchema } from '@/services/ideas/schema';

/**
 * 將表單數據轉換為 API 創建請求格式
 * @param formData 表單數據
 * @param uploadedImageUrls 已上傳的圖片 URL 陣列
 * @param uploadedVideoUrls 已上傳的影片 URL 陣列
 * @returns API 創建請求數據
 */
export function formToCreateApiRequest(
  formData: CreateIdeaFormSchema,
  uploadedImageUrls: string[] = [],
  uploadedVideoUrls: string[] = []
): CreateIdeaRequestSchema {
  return {
    content: formData.content,
    tags: formData.tags,
    resources: formData.ideaResources, // 改為 resources
    imageUrls: uploadedImageUrls,
    videoUrls: uploadedVideoUrls,
  };
}

/**
 * 將更新表單數據轉換為 API 更新請求格式
 * @param formData 更新表單數據
 * @param uploadedImageUrls 已上傳的圖片 URL 陣列
 * @param uploadedVideoUrls 已上傳的影片 URL 陣列
 * @returns API 更新請求數據
 */
export function formToUpdateApiRequest(
  formData: UpdateIdeaFormSchema,
  uploadedImageUrls: string[] = [],
  uploadedVideoUrls: string[] = []
): UpdateIdeaRequestSchema {
  return {
    id: formData.id,
    content: formData.content,
    tags: formData.tags,
    resources: formData.ideaResources, // 改為 resources
    imageUrls: uploadedImageUrls,
    videoUrls: uploadedVideoUrls,
    status: formData.status,
  };
}

/**
 * 將 API 回應數據轉換為 Idea 實體
 * @param apiData API 回應的原始數據
 * @returns 驗證後的 Idea 實體
 */
export function apiResponseToIdea(apiData: unknown): IdeaSchema {
  return ideaSchema.parse(apiData);
}

/**
 * 將 Idea 實體轉換為表單預設值
 * @param idea Idea 實體
 * @returns 表單預設值
 */
export function ideaToFormDefaults(idea: IdeaSchema): Partial<CreateIdeaFormSchema> {
  return {
    content: idea.content,
    tags: idea.tags,
    ideaResources: idea.resources,
    // 注意：imageFiles 和 videoFiles 是 File 物件，無法從 URL 轉換
    // 這些欄位需要在組件層級處理
  };
}

/**
 * 將 Idea 實體轉換為更新表單預設值
 * @param idea Idea 實體
 * @returns 更新表單預設值
 */
export function ideaToUpdateFormDefaults(idea: IdeaSchema): Partial<UpdateIdeaFormSchema> {
  return {
    id: idea.id,
    content: idea.content,
    tags: idea.tags,
    ideaResources: idea.resources,
    status: idea.status,
    // 注意：imageFiles 和 videoFiles 是 File 物件，無法從 URL 轉換
    // 這些欄位需要在組件層級處理
  };
}

/**
 * 檢查表單是否有檔案需要上傳
 * @param formData 表單數據
 * @returns 是否有檔案需要上傳
 */
export function hasFilesToUpload(formData: CreateIdeaFormSchema | UpdateIdeaFormSchema): boolean {
  const hasImages = Boolean(formData.imageFiles && formData.imageFiles.length > 0);
  const hasVideos = Boolean(formData.videoFiles && formData.videoFiles.length > 0);
  return hasImages || hasVideos;
}

/**
 * 取得需要上傳的檔案列表
 * @param formData 表單數據
 * @returns 包含圖片和影片檔案的物件
 */
export function getFilesToUpload(formData: CreateIdeaFormSchema | UpdateIdeaFormSchema): {
  imageFiles: File[];
  videoFiles: File[];
} {
  return {
    imageFiles: formData.imageFiles || [],
    videoFiles: formData.videoFiles || [],
  };
}
