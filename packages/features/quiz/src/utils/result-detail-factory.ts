import type { IResultDetail } from "../types";
import {
  createPartnerDescription,
  type Partner,
  type ResourceLink,
} from "./result-detail-constants";

// 建立 ResultDetail 的工廠函數
export const createResultDetail = (config: {
  id: string;
  tags: string[];
  slogan: string;
  characteristics: string;
  scenery: string;
  strategies: string[];
  partners: Array<{
    roleId: string;
    brief: string;
    descriptionContext: string;
  }>;
  learningTraits: string;
  learningStrategies: string[];
  supportNeeded: string[];
  islandDining: string[];
  islandDiningDescription: string;
  recommendedResources: string;
  recommendedResourceLinks: ResourceLink[];
}): IResultDetail => {
  // 轉換 partners，使用工廠函數生成描述
  const partners: Partner[] = config.partners.map((partner) => {
    const descriptionFactory =
      createPartnerDescription[partner.roleId as keyof typeof createPartnerDescription];
    return {
      roleId: partner.roleId,
      brief: partner.brief,
      description: descriptionFactory
        ? descriptionFactory(partner.descriptionContext)
        : partner.descriptionContext,
    };
  });

  return {
    id: config.id,
    tags: config.tags,
    slogan: config.slogan,
    characteristics: config.characteristics,
    scenery: config.scenery,
    strategies: config.strategies,
    partners,
    learningTraits: config.learningTraits,
    learningStrategies: config.learningStrategies,
    supportNeeded: config.supportNeeded,
    islandDining: config.islandDining,
    islandDiningDescription: config.islandDiningDescription,
    recommendedResources: config.recommendedResources,
    recommendedResourceLinks: config.recommendedResourceLinks,
  };
};

// 建立夥伴關係的輔助函數
export const createPartner = (roleId: string, brief: string, descriptionContext: string) => ({
  roleId,
  brief,
  descriptionContext,
});

// 建立資源連結的輔助函數
export const createResourceLink = (text: string, link: string): ResourceLink => ({
  text,
  link,
});

// 預定義的學習策略模板
export const LEARNING_STRATEGIES = {
  DEEP_READING: "深度閱讀與來源驗證：選擇高品質、原始資料作為學習起點，發展批判性閱讀能力。",
  KNOWLEDGE_STRUCTURE: "建構知識架構：透過心智圖、筆記地圖、知識網絡，發展出自己的知識框架。",
  SELF_REFLECTION:
    "自我提問與反思筆記：建立提問、記錄困惑與新見解的習慣，讓滿腦的思考有更多機會釐清、驗證、獲得新啟發。",
  TASK_BREAKDOWN: "任務拆解與快速起步：將學習目標具體化，設定明確可行的行動步驟。",
  PROTOTYPING:
    "製作原型與實作演練：透過實際操作驗證理解，如設計、做專案、表演等，建議從最小可行的方式開始著手。",
  IMMEDIATE_FEEDBACK: "即時回饋與修正：在實作過程中主動尋求回饋並進行快速調整。",
  FRAMEWORK_PLANNING: "建立架構圖與時間表：學習前先畫出知識框架與進度規劃，提升掌握感。",
  INFO_CLASSIFICATION: "資訊分類與邏輯整理：透過表格、顏色標記、標籤分類等方式，有效整合知識。",
  REORGANIZE_PRACTICE: "重組與轉述練習：將學到的內容以自己的語言輸出，提高理解與記憶效果。",
  CROSS_DOMAIN_LEARNING: "跨域學習與創意思考：從多元資訊中探索不同知識，鼓勵可以多類比與轉化概念。",
  VISUAL_TRANSFORMATION:
    "視覺轉化與敘事運用：運用圖像、比喻或故事重構概念，加強記憶與理解，並讓他人更容易理解。",
  COLLABORATIVE_BRAINSTORM: "合作激盪與延伸探索：透過對談與共創，碰撞出新的思路與問題意識。",
  ACTIVE_SHARING: "主動分享與反思：透過「說出來」整理自己的知識與觀點。",
  COMMUNITY_LEARNING:
    "找尋或創造與人共學的機會：如參與互動型課程/活動、社群、協作專案等，建立彼此學習機會。",
  SELF_SETTLEMENT:
    "定期自我沉澱：定期的自我反思與內在對話，除了能將他人的觀點與回饋，轉化爲真正屬於自己的觀點，也能適度地平衡自身節奏、並減少過度依賴他人回饋。",
} as const;
