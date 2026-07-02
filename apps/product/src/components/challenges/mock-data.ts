/** 共同挑戰 POC 假資料 */

import type {
  Challenge,
  MyChallengeProgress,
  MySeasonHistory,
  SeasonCheckin,
  SeasonRankingEntry,
} from "./types";

export const CATEGORY_LABELS: Record<string, string> = {
  all: "全部",
  exam: "備考",
  book: "讀書",
  sport: "運動",
  certification: "認證",
  other: "其他",
};

export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: "jlpt-n3",
    title: "日檢 N3 備考衝刺",
    description:
      "以 12 月 JLPT N3 考試為目標，每天固定練習單字、文法或聽力，一群人一起走到考場。",
    coverEmoji: "🇯🇵",
    category: "exam",
    isRecurring: true,
    checkinPrompt: "今天練了幾題？有哪題卡住？",
    hasRanking: true,
    allTimeParticipants: 512,
    seasons: [
      {
        id: "jlpt-n3-s1",
        seasonNumber: 1,
        targetDescription: "通過 2026 年 7 月 JLPT N3",
        startDate: "2026-04-01",
        endDate: "2026-07-05",
        status: "active",
        memberCount: 128,
        totalCheckins: 2341,
      },
      {
        id: "jlpt-n3-s2",
        seasonNumber: 2,
        targetDescription: "通過 2026 年 12 月 JLPT N3",
        startDate: "2026-09-01",
        endDate: "2026-12-06",
        status: "upcoming",
        memberCount: 23,
        totalCheckins: 0,
      },
    ],
  },
  {
    id: "neuroplasticity-book",
    title: "《神經可塑性》共讀挑戰",
    description: "30 天讀完這本最近討論度超高的書，每天讀一點、寫下一句最有感的話。",
    coverEmoji: "🧠",
    category: "book",
    isRecurring: false,
    checkinPrompt: "今天讀到哪裡？最有感的一句話是？",
    hasRanking: false,
    allTimeParticipants: 64,
    seasons: [
      {
        id: "neuro-s1",
        seasonNumber: 1,
        targetDescription: "30 天內讀完全書並寫下心得",
        startDate: "2026-06-15",
        endDate: "2026-07-15",
        status: "active",
        memberCount: 64,
        totalCheckins: 812,
      },
    ],
  },
  {
    id: "half-marathon",
    title: "半馬完賽訓練",
    description: "以年底城市半馬為目標，每週三次訓練打卡，互相督促撐過撞牆期。",
    coverEmoji: "🏃",
    category: "sport",
    isRecurring: true,
    checkinPrompt: "今天跑了幾公里？配速多少？",
    hasRanking: true,
    allTimeParticipants: 231,
    seasons: [
      {
        id: "half-marathon-s3",
        seasonNumber: 3,
        targetDescription: "完成 2026 台北城市半馬（21K）",
        startDate: "2026-08-01",
        endDate: "2026-12-20",
        status: "upcoming",
        memberCount: 41,
        totalCheckins: 0,
      },
      {
        id: "half-marathon-s2",
        seasonNumber: 2,
        targetDescription: "完成 2026 春季半馬",
        startDate: "2026-01-01",
        endDate: "2026-04-26",
        status: "ended",
        memberCount: 96,
        totalCheckins: 3120,
      },
    ],
  },
  {
    id: "claude-ai-cert",
    title: "Claude AI 課程認證",
    description: "一起完成 Anthropic 官方課程與認證，每天學一單元、記錄一個學到的概念。",
    coverEmoji: "🤖",
    category: "certification",
    isRecurring: false,
    checkinPrompt: "今天學到最有用的概念是什麼？",
    hasRanking: true,
    allTimeParticipants: 89,
    seasons: [
      {
        id: "claude-cert-s1",
        seasonNumber: 1,
        targetDescription: "完成課程並取得認證",
        startDate: "2026-06-01",
        endDate: "2026-07-31",
        status: "active",
        memberCount: 89,
        totalCheckins: 1467,
      },
    ],
  },
];

export const MOCK_SEASON_CHECKINS: Record<string, SeasonCheckin[]> = {
  "jlpt-n3-s1": [
    {
      id: "c1",
      userId: "u1",
      displayName: "王小明",
      avatarEmoji: "🐳",
      content: "今天練完聽力第 3 回，錯了 8 題要再加油，聽力語速還是跟不太上。",
      checkinDate: "2026-07-02",
      streak: 21,
    },
    {
      id: "c2",
      userId: "u2",
      displayName: "李大華",
      avatarEmoji: "🦊",
      content: "單字背到第 500 個！用島島打卡真的有差，不敢偷懶。",
      checkinDate: "2026-07-02",
      streak: 18,
    },
    {
      id: "c3",
      userId: "u3",
      displayName: "陳美玲",
      avatarEmoji: "🐰",
      content: "文法 N3 藍寶書第 12 章完成，「〜わけではない」終於搞懂了。",
      checkinDate: "2026-07-02",
      streak: 15,
    },
    {
      id: "c4",
      userId: "u4",
      displayName: "張大同",
      avatarEmoji: "🐸",
      content: "今天只有 20 分鐘，做了一回單字題。少但沒斷，繼續。",
      checkinDate: "2026-07-01",
      streak: 9,
    },
  ],
  "neuro-s1": [
    {
      id: "c5",
      userId: "u5",
      displayName: "林小茜",
      avatarEmoji: "🐱",
      content: "第 4 章：「神經元用進廢退」。原來大腦真的會因為練習長出新連結。",
      checkinDate: "2026-07-02",
      streak: 12,
    },
  ],
  "claude-cert-s1": [
    {
      id: "c6",
      userId: "u6",
      displayName: "黃阿哲",
      avatarEmoji: "🦉",
      content: "今天學 tool use 章節，原來 agent 的核心就是一個 loop。",
      checkinDate: "2026-07-02",
      streak: 30,
    },
  ],
};

export const MOCK_SEASON_RANKING: Record<string, SeasonRankingEntry[]> = {
  "jlpt-n3-s1": [
    { rank: 1, userId: "u1", displayName: "王小明", avatarEmoji: "🐳", totalCheckins: 88, currentStreak: 21 },
    { rank: 2, userId: "u2", displayName: "李大華", avatarEmoji: "🦊", totalCheckins: 82, currentStreak: 18 },
    { rank: 3, userId: "u3", displayName: "陳美玲", avatarEmoji: "🐰", totalCheckins: 76, currentStreak: 15 },
    { rank: 4, userId: "u7", displayName: "吳志偉", avatarEmoji: "🐻", totalCheckins: 71, currentStreak: 3 },
    { rank: 5, userId: "me", displayName: "我", avatarEmoji: "🌊", totalCheckins: 65, currentStreak: 12, isMe: true },
  ],
  "claude-cert-s1": [
    { rank: 1, userId: "u6", displayName: "黃阿哲", avatarEmoji: "🦉", totalCheckins: 30, currentStreak: 30 },
    { rank: 2, userId: "me", displayName: "我", avatarEmoji: "🌊", totalCheckins: 24, currentStreak: 6, isMe: true },
  ],
};

export const MOCK_MY_HISTORY: Record<string, MySeasonHistory[]> = {
  "half-marathon": [{ seasonId: "half-marathon-s2", seasonNumber: 2, checkinCount: 28, streak: 11 }],
};

export const MOCK_MY_PROGRESS: Record<string, MyChallengeProgress> = {
  "jlpt-n3-s1": {
    challengeId: "jlpt-n3",
    seasonId: "jlpt-n3-s1",
    joined: true,
    todayCheckedIn: false,
    myCheckinCount: 65,
    myStreak: 12,
    myRank: 5,
  },
  "claude-cert-s1": {
    challengeId: "claude-ai-cert",
    seasonId: "claude-cert-s1",
    joined: true,
    todayCheckedIn: true,
    myCheckinCount: 24,
    myStreak: 6,
    myRank: 2,
  },
};

/** 依 id 取得挑戰，找不到回傳 undefined */
export function getChallengeById(id: string): Challenge | undefined {
  return MOCK_CHALLENGES.find((c) => c.id === id);
}
