export const FEATURES = [
  {
    id: 'personal-learning',
    title: '個人學習管理',
    description: '有計劃、追蹤進度、記錄反思',
    icon: '📊',
    tag: '不再混亂',
    details: [
      '長期計劃或短期實踐，掌控學習節奏',
      '追蹤項目進度，將目標轉化為行動',
      '定期記錄覆盤，深化學習',
    ],
  },
  {
    id: 'community-support',
    title: '社群支持',
    description: '分享學習想法和心得，在互動討論中找到志同道合夥伴',
    icon: '🤝',
    tag: '不再孤單',
    details: [
      '貝殼表達感謝，鼓勵知識和學習的分享',
      '所有互動都為了加深理解、促進成長',
      '建立學習連結，共同探索而非相互競爭',
    ],
  },
  {
    id: 'growth-visualization',
    title: '成長視覺化',
    description: '記錄每一步努力，讓每個突破都清晰可見',
    icon: '📈',
    tag: '不再無感',
    details: [
      '學習紀錄和活躍度呈現，看見成長軌跡',
      '個人技能地圖，視覺化個人成長發展',
    ],
  },
] as const;

export type FeatureId = typeof FEATURES[number]['id'];
export type Feature = typeof FEATURES[number];
