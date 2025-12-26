// 共同的類型定義
export interface Partner {
  roleId: string;
  brief: string;
  description: string;
}

export interface ResourceLink {
  text: string;
  link: string;
}

// 角色 ID 常數
export const ROLE_IDS = {
  EXPLORER: "d", // 探究者
  ACTOR: "a", // 行動者
  ORGANIZER: "o", // 結構者
  LINKER: "l", // 流動者
  CONNECTOR: "c", // 連結者
} as const;

// 共同的標籤
export const COMMON_TAGS = {
  REASONING: "注重推理",
  OBSERVATION: "熱愛觀察",
  HANDS_ON: "熱愛動手做",
  ACTION_ORIENTED: "行動派",
  STRUCTURED: "結構腦",
  PLANNING: "善規劃",
  CROSS_DOMAIN: "跨領域",
  DIVERSE_THINKING: "多元思考",
  COLLABORATIVE: "共學共好",
  PERCEPTIVE: "善於察覺",
} as const;

// 共同的島嶼美食描述模式
export const DINING_DESCRIPTIONS = {
  KNOWLEDGE_FLAVOR: "知識總是越嚼越香",
  ENERGY_BOOST: "經典組合讓你天天滿血",
  CLEAR_INGREDIENTS: "可以明確知道有哪些食材就給讚！",
  UNEXPECTED_COMBO: "越怪我越愛，意想不到的組合總是會迸出新滋味！",
  SHARING_JOY: "與你分享的快樂勝過獨自擁有！",
} as const;

// 夥伴關係描述的工廠函數
export const createPartnerDescription = {
  organizer: (context: string) =>
    `構構島的島民能${context}，讓行動者的衝勁能對準最有效率的路徑，避免在行動中迷失方向或做白工。`,

  explorer: (context: string) =>
    `探探島的島民${context}，能提供經過深度挖掘且驗證過的高品質知識原料，讓的藍圖不只是空架子，而是能蓋出堅實知識大廈的基石。`,

  actor: (context: string) =>
    `動動島的島民${context}，他們會立即將結構者的規劃付諸實踐，找出流程中的瓶頸與不合理之處，讓理論架構能真正落地，變得更具實用性。`,

  linker: (context: string) =>
    `跨跨島的島民${context}，能挑戰探究者既有的假設，幫助他們從不同學科的角度重新審視問題，激發出更具原創性的洞見。`,

  connector: (context: string) =>
    `連連島的島民${context}，提供真實且多元的回饋，讓行動者的原型能快速迭代，更貼近實際需求，從而增強其行動的意義與價值感。`,
};
