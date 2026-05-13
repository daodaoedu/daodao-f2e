export interface IChallengeParticipant {
  id: string;
  avatarColor: string;
  name: string;
}

export interface IChallenge {
  id: string;
  title: string;
  description: string;
  status: "draft" | "active" | "completed";
  statusLabel: string;
  period: {
    start: string;
    end: string;
  };
  participantCount: number;
  participants: IChallengeParticipant[];
}

export interface IExploreTopicRecommendation {
  id: string;
  title: string;
  description: string;
  tags: string[];
  reason: string;
  authorName: string;
  authorAvatarChar: string;
  authorAvatarColor: string;
  templateId?: string;
  practiceId?: string;
}

const MOCK_CHALLENGES: IChallenge[] = [
  {
    id: "challenge-1",
    title: "21 天原子習慣建立挑戰",
    description: "從小習慣開始，建立微小但長期的改變。每天只需 5 分鐘，社群陪伴讓你不再半途而廢。",
    status: "draft",
    statusLabel: "草稿（熱烈報名中）",
    period: { start: "5/1", end: "5/21" },
    participantCount: 142,
    participants: [
      { id: "p1", avatarColor: "#93C5FD", name: "小明" },
      { id: "p2", avatarColor: "#86EFAC", name: "小花" },
      { id: "p3", avatarColor: "#C4B5FD", name: "小強" },
    ],
  },
];

const MOCK_EXPLORE_TOPICS: IExploreTopicRecommendation[] = [
  {
    id: "explore-1",
    title: "多益 860 分衝刺計畫",
    description: "每天聽寫一篇 TED Talk，週末做一回模擬考題。",
    tags: ["英文", "檢定", "聽力"],
    reason: "因為您正在「練習日文」",
    authorName: "學習狂人",
    authorAvatarChar: "學",
    authorAvatarColor: "#16B9B3",
  },
  {
    id: "explore-2",
    title: "每週讀透一本書",
    description: "涵蓋歷史、科技與心理學，並產出心智圖筆記。",
    tags: ["閱讀", "自我成長"],
    reason: "與您「閱讀少年臺灣史」的興趣相近",
    authorName: "知識游牧民",
    authorAvatarChar: "知",
    authorAvatarColor: "#16B9B3",
  },
  {
    id: "explore-3",
    title: "30 天 Podcast 企劃挑戰",
    description: "從零開始構思、錄音到上架，完成自己的第一個節目。",
    tags: ["Podcast", "創作"],
    reason: "基於您的標籤「Podcast」",
    authorName: "聲音說書人",
    authorAvatarChar: "聲",
    authorAvatarColor: "#16B9B3",
  },
];

export function useChallenges() {
  return {
    challenges: MOCK_CHALLENGES,
    isLoading: false,
  };
}

export function useExploreTopics() {
  return {
    topics: MOCK_EXPLORE_TOPICS,
    isLoading: false,
  };
}
