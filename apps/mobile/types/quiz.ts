export interface Quiz {
  id: string;
  title: string;
  description: string;
  icon: string;
  questionCount: number;
  estimatedTime: string; // e.g., "5 分鐘"
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  order: number;
  question: string;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  text: string;
  value: string; // Used for scoring
}

export interface QuizAnswer {
  questionId: string;
  optionId: string;
  value: string;
}

export interface QuizResult {
  quizId: string;
  island: IslandResult;
  answers: QuizAnswer[];
  completedAt: string;
}

export interface IslandResult {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  traits: string[];
  recommendations: string[];
}

// Mock data
export const availableQuizzes: Quiz[] = [
  {
    id: "learning-style",
    title: "學習風格測驗",
    description: "探索你的學習偏好，找到最適合你的學習方式",
    icon: "🎯",
    questionCount: 10,
    estimatedTime: "5 分鐘",
  },
  {
    id: "personality",
    title: "學習島嶼性格測驗",
    description: "發現你的學習性格，解鎖專屬島嶼",
    icon: "🏝️",
    questionCount: 15,
    estimatedTime: "8 分鐘",
  },
];

export const mockQuestions: QuizQuestion[] = [
  {
    id: "q1",
    quizId: "learning-style",
    order: 1,
    question: "當你學習新事物時，你更傾向於...",
    options: [
      { id: "q1-a", text: "閱讀相關書籍或文章", value: "reading" },
      { id: "q1-b", text: "觀看影片或教學", value: "visual" },
      { id: "q1-c", text: "動手實作練習", value: "kinesthetic" },
      { id: "q1-d", text: "與他人討論交流", value: "social" },
    ],
  },
  {
    id: "q2",
    quizId: "learning-style",
    order: 2,
    question: "你認為最有效的學習時間是...",
    options: [
      { id: "q2-a", text: "清晨", value: "morning" },
      { id: "q2-b", text: "下午", value: "afternoon" },
      { id: "q2-c", text: "晚上", value: "evening" },
      { id: "q2-d", text: "隨時都可以", value: "flexible" },
    ],
  },
  {
    id: "q3",
    quizId: "learning-style",
    order: 3,
    question: "遇到困難時，你通常會...",
    options: [
      { id: "q3-a", text: "自己研究找答案", value: "independent" },
      { id: "q3-b", text: "尋求他人幫助", value: "collaborative" },
      { id: "q3-c", text: "暫時放下，之後再試", value: "patient" },
      { id: "q3-d", text: "嘗試不同方法", value: "experimental" },
    ],
  },
];

export const mockIslandResults: IslandResult[] = [
  {
    id: "explorer",
    name: "探索者島",
    description: "你是一位好奇心旺盛的探索者，喜歡嘗試新事物",
    icon: "🧭",
    color: "#4F46E5",
    traits: ["好奇心強", "勇於嘗試", "獨立思考"],
    recommendations: ["每日閱讀", "程式學習", "語言學習"],
  },
  {
    id: "creator",
    name: "創造者島",
    description: "你擁有豐富的創造力，善於將想法付諸實踐",
    icon: "🎨",
    color: "#EC4899",
    traits: ["創意豐富", "動手能力強", "有藝術天賦"],
    recommendations: ["寫作練習", "藝術創作", "設計學習"],
  },
  {
    id: "connector",
    name: "連結者島",
    description: "你善於建立人際關係，喜歡與他人合作學習",
    icon: "🤝",
    color: "#22C55E",
    traits: ["善於溝通", "團隊合作", "同理心強"],
    recommendations: ["社群活動", "語言學習", "團隊專案"],
  },
];
