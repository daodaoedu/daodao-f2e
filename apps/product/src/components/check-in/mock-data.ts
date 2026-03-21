/**
 * 打卡功能開發用假資料
 * feat/checkout - 優化打卡功能
 */

// ============================================================================
// 假使用者
// ============================================================================

export const mockUser = {
  id: "mock-user-001",
  _id: "550e8400-e29b-41d4-a716-446655440001",
  name: "陳曉雯",
  photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=daodao-mock-user",
  educationStage: "university",
  selfIntroduction: "喜歡探索新事物、慢慢累積自己的習慣。",
  tagList: ["自我成長", "閱讀", "程式學習"],
  roleList: ["learner"],
  customId: "xiaowen_chen",
};

// ============================================================================
// 假實踐（PracticeEntity 格式）
// ============================================================================

export const mockPractice = {
  id: "mock-practice-abc123",
  title: "每天寫 30 分鐘學習筆記",
  practiceAction: "用自己的話整理當天學到的一個概念，記錄在筆記本或 Notion 裡",
  startDate: "2026-03-01",
  endDate: "2026-03-21",
  durationDays: 21,
  frequencyMinDays: 4,
  frequencyMaxDays: 7,
  sessionDurationMinutes: 30,
  practiceTimePeriods: ["evening", "night"],
  otherContext: "",
  status: "active" as const,
  hasResources: true,
  resources: [
    {
      id: "res-001",
      name: "Notion 筆記本",
      url: "https://notion.so",
    },
  ],
  progressPercentage: 62,
  firstCheckinAt: "2026-03-01T21:30:00.000Z",
  lastCheckinAt: "2026-03-18T22:10:00.000Z",
  checkInCount: 13,
  themeColor: "#C3EEFF",
  createdAt: "2026-02-28T10:00:00.000Z",
  updatedAt: "2026-03-18T22:10:00.000Z",
  user: mockUser,
  tags: ["學習", "筆記", "自我成長"],
  stats: {
    commentCount: 3,
    viewCount: 42,
    likeCount: 8,
    favoriteCount: 2,
  },
};

// ============================================================================
// 假打卡記錄（CheckInEntity 格式）
// ============================================================================

export const mockCheckInRecords = [
  {
    id: 1001,
    practiceId: 1,
    userId: 1,
    checkinDate: "2026-03-18",
    mood: "good" as const,
    note: "今天整理了 TypeScript 泛型的概念，寫下來才發現自己其實理解得不夠深，明天繼續補充。",
    imageUrls: [],
    ogImageUrl: null,
    tags: ["TypeScript", "有收穫"],
    createdAt: "2026-03-18T22:10:00.000Z",
    updatedAt: "2026-03-18T22:10:00.000Z",
  },
  {
    id: 1002,
    practiceId: 1,
    userId: 1,
    checkinDate: "2026-03-17",
    mood: "happy" as const,
    note: "複習了 React useCallback 和 useMemo 的差異，豁然開朗！之前一直搞混，現在終於清楚了。",
    imageUrls: ["https://placehold.co/600x400/C3EEFF/333?text=筆記截圖"],
    ogImageUrl: null,
    tags: ["React", "豁然開朗"],
    createdAt: "2026-03-17T21:45:00.000Z",
    updatedAt: "2026-03-17T21:45:00.000Z",
  },
  {
    id: 1003,
    practiceId: 1,
    userId: 1,
    checkinDate: "2026-03-15",
    mood: "neutral" as const,
    note: "今天有點累，只寫了一點點。不過還是有打開筆記本，算是有完成。",
    imageUrls: [],
    ogImageUrl: null,
    tags: ["堅持"],
    createdAt: "2026-03-15T23:00:00.000Z",
    updatedAt: "2026-03-15T23:00:00.000Z",
  },
  {
    id: 1004,
    practiceId: 1,
    userId: 1,
    checkinDate: "2026-03-14",
    mood: "happy" as const,
    note: "整理了 async/await 的錯誤處理模式，搭配 try-catch 和 Promise.allSettled，感覺很實用。",
    imageUrls: [],
    ogImageUrl: null,
    tags: ["JavaScript", "有收穫", "實用"],
    createdAt: "2026-03-14T21:20:00.000Z",
    updatedAt: "2026-03-14T21:20:00.000Z",
  },
  {
    id: 1005,
    practiceId: 1,
    userId: 1,
    checkinDate: "2026-03-12",
    mood: "bored" as const,
    note: "今天讀的東西比較枯燥，但還是寫完了。",
    imageUrls: [],
    ogImageUrl: null,
    tags: [],
    createdAt: "2026-03-12T22:30:00.000Z",
    updatedAt: "2026-03-12T22:30:00.000Z",
  },
];

// ============================================================================
// API 回應包裝格式（方便直接當作 API mock response）
// ============================================================================

export const mockPracticeResponse = {
  success: true as const,
  data: mockPractice,
  timestamp: new Date().toISOString(),
};

export const mockCheckInsResponse = {
  success: true as const,
  data: mockCheckInRecords,
  timestamp: new Date().toISOString(),
};
