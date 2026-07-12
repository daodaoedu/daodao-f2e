/**
 * Practice API Service
 * 提供實踐相關的 API 調用函數（用於 Server Components 或直接調用）
 */

import { client } from "../client";
import { extractApiErrorMessage } from "./check-in-form-data";
import type { paths } from "../types";

// ============================================================================
// Types
// ============================================================================

type PracticeListResponse =
  paths["/api/v1/me/practices"]["get"]["responses"]["200"]["content"]["application/json"];
type PracticeStatsResponse =
  paths["/api/v1/me/practice-stats"]["get"]["responses"]["200"]["content"]["application/json"];
type PracticeTemplatesResponse =
  paths["/api/v1/practices/templates"]["get"]["responses"]["200"]["content"]["application/json"];
type PracticeTemplateCategoriesResponse =
  paths["/api/v1/practices/templates/categories"]["get"]["responses"]["200"]["content"]["application/json"];
type PracticeDetailResponse =
  paths["/api/v1/practices/{id}"]["get"]["responses"]["200"]["content"]["application/json"];
type PracticeCheckInsResponse =
  paths["/api/v1/practices/{id}/checkins"]["get"]["responses"]["200"]["content"]["application/json"];

// ============================================================================
// Practice Summary Types (實踐完成摘要)
// ============================================================================

/**
 * 心情類型
 * @description 打卡時可選擇的心情
 * - give_up: 想放棄
 * - frustrated: 挫折
 * - bored: 無聊
 * - neutral: 普通
 * - good: 不錯
 * - happy: 開心
 */
export type MoodType = "give_up" | "frustrated" | "bored" | "neutral" | "good" | "happy";

/**
 * 心情統計項目
 * @description 包含心情類型、出現次數和最近出現時間
 */
export interface MoodStat {
  /** 心情類型 */
  mood: MoodType;
  /** 出現次數 */
  count: number;
  /** 最近一次出現的時間 */
  lastOccurredAt: string;
}

/**
 * 實踐完成摘要
 * @description 用於生成實踐完成總結圖片的資料結構
 */
export interface PracticeSummary {
  /** 用戶名稱 */
  userName: string;
  /** 用戶頭像 URL */
  userPhotoURL?: string | null;
  /** 實踐 ID */
  practiceId: string;
  /** 實踐名稱（標題，最多 50 字） */
  practiceName: string;
  /** 實踐內容描述（最多 50 字） */
  practiceDescription?: string;
  /** 實踐開始日期 (YYYY-MM-DD) */
  startDate: string;
  /** 實踐結束日期 (YYYY-MM-DD) */
  endDate: string;
  /** 打卡總次數（成長足跡數量） */
  checkInCount: number;
  /**
   * 最常見的心情（最多 2 個）
   * @description 按出現次數排序，相同次數則按最近出現時間排序
   */
  topMoods: MoodStat[];
  /**
   * 文字最多的打卡筆記（最多 3 個）
   * @description 從所有打卡記錄的 note 中提取，按文字長度排序
   */
  topNotes: string[];
  /** 鼓勵文字 */
  encouragementText: string;
  /** 主題色（HEX 格式，如 #FCDD84） */
  themeColor?: string;
  /** 使用者反思文字 */
  reflection?: string;
  /** 接下來的意圖文字 */
  nextIntent?: string;
  /** 接下來意圖的草稿 ID */
  nextIntentDraftId?: string;
  /** 已選取用於分享卡的打卡紀錄 ID 列表 */
  selectedCheckInIds?: string[];
  /** AI 生成的核心洞察文字 */
  insight?: string;
  /** 洞察回饋（喜歡／不喜歡與原因） */
  insightFeedback?: { type: "positive" | "negative"; reasons?: string[] } | null;
  /** 打卡筆記平均字數 */
  avgWords: number;
  /** 實踐進度百分比 */
  progressPercentage: number;
  /** 實踐活動狀態 */
  status: string;
}

export type IGetMyPracticesParams = NonNullable<
  paths["/api/v1/me/practices"]["get"]["parameters"]["query"]
>;

export type IGetPracticeStatsParams = NonNullable<
  paths["/api/v1/me/practice-stats"]["get"]["parameters"]["query"]
>;

export type IGetPracticeTemplatesParams = NonNullable<
  paths["/api/v1/practices/templates"]["get"]["parameters"]["query"]
>;

export type IGetRandomPracticeTemplatesParams = NonNullable<
  paths["/api/v1/practices/templates/random"]["get"]["parameters"]["query"]
>;

export type IGetPracticeCheckInsParams = NonNullable<
  paths["/api/v1/practices/{id}/checkins"]["get"]["parameters"]["query"]
>;

export type IGetUserPracticesParams = NonNullable<
  paths["/api/v1/practices/user/{userId}"]["get"]["parameters"]["query"]
>;

// 從回應中提取 PracticeTemplateType 類型（單一模板項目的數據類型）
export type PracticeTemplateType = NonNullable<PracticeTemplatesResponse["data"]>[number];

export type {
  PracticeListResponse,
  PracticeStatsResponse,
  PracticeTemplatesResponse,
  PracticeTemplateCategoriesResponse,
  PracticeDetailResponse,
  PracticeCheckInsResponse,
};

// ============================================================================
// Client Functions (用於 Server Components 或直接調用)
// ============================================================================

/**
 * 獲取當前用戶的實踐列表
 */
export const getMyPractices = async (params?: IGetMyPracticesParams) => {
  return client.GET("/api/v1/me/practices", {
    params: {
      query: {
        page: params?.page,
        limit: params?.limit,
        status: params?.status,
        search: params?.search,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
      },
    },
  });
};

/**
 * 獲取當前用戶的實踐統計
 */
export const getMyPracticeStats = async (params?: IGetPracticeStatsParams) => {
  return client.GET("/api/v1/me/practice-stats", {
    params: {
      query: {
        timeRange: params?.timeRange,
        includeArchived: params?.includeArchived ?? undefined,
      },
    },
  });
};

/**
 * 獲取實踐模板列表
 */
export const getPracticeTemplates = async (params?: IGetPracticeTemplatesParams) => {
  return client.GET("/api/v1/practices/templates", {
    params: {
      query: {
        page: params?.page,
        limit: params?.limit,
        category: params?.category,
        search: params?.search,
      },
    },
  });
};

/**
 * 獲取實踐模板分類列表
 */
export const getPracticeTemplateCategories = async () => {
  return client.GET("/api/v1/practices/templates/categories");
};

/**
 * 獲取單一實踐模板詳情
 */
export const getPracticeTemplateById = async (id: string) => {
  return client.GET("/api/v1/practices/templates/{id}", {
    params: {
      path: {
        id,
      },
    },
  });
};

/**
 * 隨機獲取實踐模板
 */
export const getRandomPracticeTemplates = async (params?: IGetRandomPracticeTemplatesParams) => {
  return client.GET("/api/v1/practices/templates/random", {
    params: {
      query: {
        count: params?.count,
        category: params?.category,
      },
    },
  });
};

/**
 * 獲取單一實踐詳情
 */
export const getPracticeById = async (id: string) => {
  return client.GET("/api/v1/practices/{id}", {
    params: {
      path: {
        id,
      },
    },
  });
};

/**
 * 獲取實踐的打卡記錄列表
 */
export const getPracticeCheckIns = async (id: string, params?: IGetPracticeCheckInsParams) => {
  return client.GET("/api/v1/practices/{id}/checkins", {
    params: {
      path: {
        id,
      },
      query: {
        page: params?.page,
        limit: params?.limit,
        startDate: params?.startDate,
        endDate: params?.endDate,
        mood: params?.mood,
        include: params?.include,
      },
    },
  });
};

/**
 * 獲取指定用戶的實踐列表
 */
export const getUserPractices = async (userId: string, params?: IGetUserPracticesParams) => {
  return client.GET("/api/v1/practices/user/{userId}", {
    params: {
      path: {
        userId,
      },
      query: {
        page: params?.page,
        limit: params?.limit,
        query: params?.query,
        contentType: params?.contentType,
        tags: params?.tags,
        userId: params?.userId,
        status: params?.status,
        sort: params?.sort,
        order: params?.order,
        include: params?.include,
      },
    },
  });
};

/**
 * 獲取隨機鼓勵句
 */
export const getRandomEncouragement = async () => {
  return client.GET("/api/v1/checkin-encouragements/random");
};

// ============================================================================
// Practice Summary Functions (實踐完成摘要生成)
// ============================================================================

/** 有效的心情類型列表 */
const VALID_MOODS: MoodType[] = ["give_up", "frustrated", "bored", "neutral", "good", "happy"];

/** 摘要查詢的打卡記錄上限 */
const MAX_CHECKINS_FOR_SUMMARY = 200;

/**
 * 驗證心情類型是否有效
 * @param mood 待驗證的心情值
 * @returns 有效的心情類型或 undefined
 */
const validateMood = (mood: unknown): MoodType | undefined => {
  if (typeof mood !== "string") return undefined;
  return VALID_MOODS.includes(mood as MoodType) ? (mood as MoodType) : undefined;
};

/**
 * 從打卡記錄中統計心情出現頻率
 * @param checkIns 打卡記錄列表
 * @returns 心情統計列表，按出現次數排序（相同次數則按最近出現時間排序）
 */
const calculateMoodStats = (
  checkIns: Array<{
    mood?: MoodType;
    createdAt: string;
  }>
): MoodStat[] => {
  const moodMap = new Map<MoodType, { count: number; lastOccurredAt: string }>();

  for (const checkIn of checkIns) {
    if (!checkIn.mood) continue;

    const existing = moodMap.get(checkIn.mood);
    if (existing) {
      existing.count += 1;
      // 更新最近出現時間（取較新的）
      if (new Date(checkIn.createdAt) > new Date(existing.lastOccurredAt)) {
        existing.lastOccurredAt = checkIn.createdAt;
      }
    } else {
      moodMap.set(checkIn.mood, {
        count: 1,
        lastOccurredAt: checkIn.createdAt,
      });
    }
  }

  // 轉換為陣列並排序
  const moodStats: MoodStat[] = Array.from(moodMap.entries()).map(([mood, stats]) => ({
    mood,
    count: stats.count,
    lastOccurredAt: stats.lastOccurredAt,
  }));

  // 排序：先按次數降序，相同次數則按最近出現時間降序
  moodStats.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return new Date(b.lastOccurredAt).getTime() - new Date(a.lastOccurredAt).getTime();
  });

  return moodStats;
};

/**
 * 從打卡記錄中找出文字最長的標籤
 * @param checkIns 打卡記錄列表
 * @param maxCount 最多取幾個標籤
 * @returns 文字最長的標籤列表
 */
const findLongestNotes = (checkIns: Array<{ note?: string }>, maxCount: number = 3): string[] => {
  return checkIns
    .map((c) => c.note?.trim())
    .filter((note): note is string => !!note)
    .sort((a, b) => b.length - a.length)
    .slice(0, maxCount);
};

/**
 * 截斷文字到指定長度
 * @param text 原始文字
 * @param maxLength 最大長度
 * @returns 截斷後的文字
 */
const truncateText = (text: string | undefined, maxLength: number): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength);
};

/**
 * 實踐詳情的擴充欄位
 * @description 這些欄位已由後端回傳，但尚未同步進 OpenAPI schema
 * NOTE: 後端部署後執行 pnpm run generate:api 更新 types，屆時可移除此 workaround
 */
type PracticeDetailExtraFields = {
  reflection?: string;
  nextIntent?: string;
  nextIntentDraftId?: string;
  selectedCheckInIds?: string[];
  insight?: string;
  insightFeedback?: { type: "positive" | "negative"; reasons?: string[] } | null;
  avgWords?: number;
};

/**
 * 獲取實踐完成摘要
 * @description 組合實踐詳情和打卡記錄，生成用於總結圖片的摘要資料
 * @param practiceId 實踐 ID
 * @returns 實踐摘要或錯誤
 */
export const getPracticeSummary = async (
  practiceId: string
): Promise<{ data: PracticeSummary | null; error: string | null }> => {
  try {
    // 1. 獲取實踐詳情
    const practiceResponse = await getPracticeById(practiceId);
    if (practiceResponse.error || !practiceResponse.data?.data) {
      return {
        data: null,
        error: "無法獲取實踐資料",
      };
    }
    const practice = practiceResponse.data.data;
    const practiceExtra = practice as typeof practice & PracticeDetailExtraFields;

    // 2. 獲取打卡記錄（使用合理的上限避免效能問題）
    const checkInLimit = Math.min(
      practice.checkInCount || MAX_CHECKINS_FOR_SUMMARY,
      MAX_CHECKINS_FOR_SUMMARY
    );
    const checkInsResponse = await getPracticeCheckIns(practiceId, {
      limit: checkInLimit,
    });
    const checkIns = checkInsResponse.data?.data ?? [];

    // 3. 獲取隨機鼓勵句
    let encouragementText = "恭喜你完成了這段旅程！";
    try {
      const encouragementResponse = await getRandomEncouragement();
      if (encouragementResponse.data?.data?.message) {
        encouragementText = encouragementResponse.data.data.message;
      }
    } catch {
      // 使用預設鼓勵句
    }

    // 4. 計算心情統計（取最多 2 個）
    // 使用 validateMood 進行執行時類型驗證
    const moodStats = calculateMoodStats(
      checkIns.map((c) => ({
        mood: validateMood(c.mood),
        createdAt: c.createdAt,
      }))
    );
    const topMoods = moodStats.slice(0, 2);

    // 5. 找出文字最多的打卡筆記（最多 3 個）
    const topNotes = findLongestNotes(checkIns, 3);

    // 6. 組合摘要資料
    const summary: PracticeSummary = {
      userName: practice.user?.name ?? "使用者",
      userPhotoURL: practice.user?.photoURL,
      practiceId: practice.id,
      practiceName: truncateText(practice.title, 50),
      practiceDescription: truncateText(practice.practiceAction, 50),
      startDate: practice.startDate ?? "",
      endDate: practice.endDate ?? "",
      checkInCount: practice.checkInCount,
      topMoods,
      topNotes,
      encouragementText,
      themeColor: practice.themeColor,
      reflection: practiceExtra.reflection,
      nextIntent: practiceExtra.nextIntent,
      nextIntentDraftId: practiceExtra.nextIntentDraftId,
      selectedCheckInIds: practiceExtra.selectedCheckInIds,
      insight: practiceExtra.insight,
      insightFeedback: practiceExtra.insightFeedback,
      avgWords: practiceExtra.avgWords ?? 0,
      progressPercentage: practice.progressPercentage,
      status: practice.status,
    };

    return { data: summary, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "獲取摘要失敗";
    return { data: null, error: message };
  }
};

/**
 * 複製實踐（複製他人或自己的實踐）
 * @param id 來源實踐 ID
 * @returns 新實踐 external_id（UUID）
 * NOTE: 後端部署後執行 pnpm run generate:api 更新 types，屆時可移除此 workaround
 */
type CopyPracticeClient = {
  POST: (
    path: "/api/v1/practices/{id}/copy",
    options: { params: { path: { id: string } } }
  ) => Promise<{ data?: { data: { id: string } }; error?: unknown }>;
};

export const copyPractice = async (id: string): Promise<{ id: string }> => {
  const response = await (client as unknown as CopyPracticeClient).POST(
    "/api/v1/practices/{id}/copy",
    { params: { path: { id } } }
  );

  if (response.error) {
    throw new Error(extractApiErrorMessage(response.error, "複製失敗"));
  }

  return response.data?.data as { id: string };
};

// ============================================================================
// Practice Summary Mutations (實踐總結頁互動)
// NOTE: 以下端點尚未同步進 OpenAPI schema，暫用 typed client cast workaround。
// 後端部署後執行 pnpm run generate:api 更新 types，屆時可移除這些 workaround。
// ============================================================================

type UpdateReflectionClient = {
  PATCH: (
    path: "/api/v1/practices/{id}/reflection",
    options: { params: { path: { id: string } }; body: { reflection: string } }
  ) => Promise<{ data?: { data: unknown }; error?: unknown }>;
};

type UpdateNextIntentClient = {
  PATCH: (
    path: "/api/v1/practices/{id}/next-intent",
    options: {
      params: { path: { id: string } };
      body: { nextIntent: string; saveDraft?: boolean };
    }
  ) => Promise<{ data?: { data: unknown }; error?: unknown }>;
};

type UpdateSelectedCheckinsClient = {
  PATCH: (
    path: "/api/v1/practices/{id}/selected-checkins",
    options: { params: { path: { id: string } }; body: { checkinIds: string[] } }
  ) => Promise<{ data?: { data: unknown }; error?: unknown }>;
};

type CreateInsightFeedbackClient = {
  POST: (
    path: "/api/v1/practices/{id}/insight-feedback",
    options: {
      params: { path: { id: string } };
      body: { type: "positive" | "negative"; reasons?: string[] };
    }
  ) => Promise<{ data?: { data: unknown }; error?: unknown }>;
};

/**
 * 提取錯誤訊息
 * @param error API 回應中的錯誤物件
 * @param fallback 預設錯誤訊息
 */
const extractErrorMessage = (error: unknown, fallback: string): string => {
  return error && typeof error === "object" && "message" in error
    ? String((error as { message?: unknown }).message)
    : fallback;
};

/**
 * 更新實踐反思文字
 * @param id 實踐 ID
 * @param reflection 反思內容
 */
export const updateReflection = async (id: string, reflection: string) => {
  const response = await (client as unknown as UpdateReflectionClient).PATCH(
    "/api/v1/practices/{id}/reflection",
    { params: { path: { id } }, body: { reflection } }
  );

  if (response.error) {
    throw new Error(extractErrorMessage(response.error, "更新反思失敗"));
  }

  return response.data?.data;
};

/**
 * 更新實踐的「接下來我想」意圖
 * @param id 實踐 ID
 * @param nextIntent 意圖內容
 * @param saveDraft 是否僅存為草稿
 */
export const updateNextIntent = async (id: string, nextIntent: string, saveDraft?: boolean) => {
  const response = await (client as unknown as UpdateNextIntentClient).PATCH(
    "/api/v1/practices/{id}/next-intent",
    { params: { path: { id } }, body: { nextIntent, saveDraft } }
  );

  if (response.error) {
    throw new Error(extractErrorMessage(response.error, "更新意圖失敗"));
  }

  return response.data?.data;
};

/**
 * 更新已選取用於分享卡的打卡紀錄
 * @param id 實踐 ID
 * @param checkinIds 已選取的打卡紀錄 ID 列表
 */
export const updateSelectedCheckins = async (id: string, checkinIds: string[]) => {
  const response = await (client as unknown as UpdateSelectedCheckinsClient).PATCH(
    "/api/v1/practices/{id}/selected-checkins",
    { params: { path: { id } }, body: { checkinIds } }
  );

  if (response.error) {
    throw new Error(extractErrorMessage(response.error, "更新打卡選取失敗"));
  }

  return response.data?.data;
};

/**
 * 建立洞察回饋
 * @param id 實踐 ID
 * @param type 回饋類型（正向／負向）
 * @param reasons 回饋原因列表
 */
export const createInsightFeedback = async (
  id: string,
  type: "positive" | "negative",
  reasons?: string[]
) => {
  const response = await (client as unknown as CreateInsightFeedbackClient).POST(
    "/api/v1/practices/{id}/insight-feedback",
    { params: { path: { id } }, body: { type, reasons } }
  );

  if (response.error) {
    throw new Error(extractErrorMessage(response.error, "送出回饋失敗"));
  }

  return response.data?.data;
};
