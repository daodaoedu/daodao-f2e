// 偏好類型與選項的介面定義
export interface PreferenceType {
  id: number;
  name: string;
  value: string;
  description: string;
}

export interface PreferenceOption {
  id: number;
  preference_type_id: number;
  name: string;
  value: string;
}

// 定義偏好類型常數
export const PREFERENCE_TYPES: PreferenceType[] = [
  { id: 1, name: '內容格式偏好', value: 'content_format', description: '使用者偏好的學習內容呈現方式' },
  { id: 2, name: '回饋風格偏好', value: 'feedback_style', description: '使用者偏好的回饋和意見提供方式' },
  { id: 3, name: '引導師風格偏好', value: 'teaching_style', description: '使用者偏好的教學引導方式' },
  { id: 4, name: '思考方法偏好', value: 'thinking_method', description: '使用者偏好的思考和問題解決方法' },
  { id: 5, name: '學習夥伴偏好', value: 'learning_partner', description: '使用者偏好的學習協作角色類型' },
  { id: 6, name: '知識呈現偏好', value: 'knowledge_presentation', description: '使用者偏好的知識結構和呈現方式' },
  { id: 7, name: '學習深度偏好', value: 'learning_depth', description: '使用者偏好的學習深度和廣度' },
  { id: 8, name: '社交學習風格', value: 'social_learning_style', description: '使用者在社交學習情境中的偏好角色' },
  { id: 9, name: '協作模式偏好', value: 'collaboration_mode', description: '使用者偏好的團隊合作模式' },
  { id: 10, name: '學習節奏偏好', value: 'learning_pace', description: '使用者偏好的學習進度和時間安排' },
  { id: 11, name: '挑戰難度偏好', value: 'challenge_level', description: '使用者偏好的學習挑戰程度' },
  { id: 12, name: '學習目標導向', value: 'learning_goal', description: '使用者的學習目的和動機取向' },
  { id: 13, name: '技能實踐偏好', value: 'skill_practice', description: '使用者偏好的技能學習和實踐方式' },
  { id: 14, name: '反思頻率偏好', value: 'reflection_frequency', description: '使用者偏好的學習反思和回顧頻率' },
  { id: 15, name: '評量方式偏好', value: 'assessment_method', description: '使用者偏好的學習成效評估方式' },
  { id: 16, name: '學習障礙偏好', value: 'learning_obstacle', description: '使用者在遇到學習障礙時偏好的協助方式' },
];

// 定義偏好選項常數
export const PREFERENCE_OPTIONS: PreferenceOption[] = [
  // 內容格式偏好選項
  { id: 1, preference_type_id: 1, name: '文字為主', value: 'text' },
  { id: 2, preference_type_id: 1, name: '影片為主', value: 'video' },
  { id: 3, preference_type_id: 1, name: '混合內容', value: 'mixed' },
  { id: 4, preference_type_id: 1, name: '互動式學習', value: 'interactive' },
  { id: 5, preference_type_id: 1, name: '圖表資訊', value: 'infographic' },
  { id: 6, preference_type_id: 1, name: 'podcast', value: 'audio' },
  
  // 回饋風格偏好選項
  { id: 7, preference_type_id: 2, name: '詳細指導型', value: 'detailed' },
  { id: 8, preference_type_id: 2, name: '簡潔重點型', value: 'concise' },
  { id: 9, preference_type_id: 2, name: '鼓勵激勵型', value: 'encouraging' },
  { id: 10, preference_type_id: 2, name: '挑戰思考型', value: 'challenging' },
  { id: 11, preference_type_id: 2, name: '問題解析型', value: 'analytical' },
  { id: 12, preference_type_id: 2, name: '實例展示型', value: 'example_based' },
  
  // 引導師風格偏好選項
  { id: 13, preference_type_id: 3, name: '蘇格拉底式提問', value: 'socratic' },
  { id: 14, preference_type_id: 3, name: '系統化講解', value: 'systematic' },
  { id: 15, preference_type_id: 3, name: '案例分析', value: 'case_based' },
  { id: 16, preference_type_id: 3, name: '實作引導', value: 'hands_on' },
  { id: 17, preference_type_id: 3, name: '啟發式教學', value: 'heuristic' },
  { id: 18, preference_type_id: 3, name: '遊戲學習法', value: 'gamified' },
  { id: 19, preference_type_id: 3, name: '直觀展示法', value: 'demonstrative' },
  
  // 思考方法偏好選項
  { id: 20, preference_type_id: 4, name: '批判性思考', value: 'critical' },
  { id: 21, preference_type_id: 4, name: '創造性思考', value: 'creative' },
  { id: 22, preference_type_id: 4, name: '系統性思考', value: 'systematic' },
  { id: 23, preference_type_id: 4, name: '設計思考', value: 'design' },
  { id: 24, preference_type_id: 4, name: '邏輯推理', value: 'logical' },
  { id: 25, preference_type_id: 4, name: '跨領域思考', value: 'interdisciplinary' },
  { id: 26, preference_type_id: 4, name: '實證分析', value: 'empirical' },
  { id: 27, preference_type_id: 4, name: '整合思考', value: 'integrative' },
  
  // 學習夥伴偏好選項
  { id: 28, preference_type_id: 5, name: '專業教師型', value: 'teacher' },
  { id: 29, preference_type_id: 5, name: '同儕學習型', value: 'peer' },
  { id: 30, preference_type_id: 5, name: '導師指導型', value: 'mentor' },
  { id: 31, preference_type_id: 5, name: '自主學習型', value: 'self_directed' },
  { id: 32, preference_type_id: 5, name: '合作探究型', value: 'collaborative' },
  { id: 33, preference_type_id: 5, name: '專家諮詢型', value: 'expert' },
  { id: 34, preference_type_id: 5, name: '教練輔導型', value: 'coach' },
  
  // 知識呈現偏好選項
  { id: 35, preference_type_id: 6, name: '由簡入深漸進式', value: 'progressive' },
  { id: 36, preference_type_id: 6, name: '全局概念優先', value: 'big_picture_first' },
  { id: 37, preference_type_id: 6, name: '實例先行再理論', value: 'example_first' },
  { id: 38, preference_type_id: 6, name: '理論框架優先', value: 'theory_first' },
  { id: 39, preference_type_id: 6, name: '問題導向式學習', value: 'problem_based' },
  { id: 40, preference_type_id: 6, name: '專題導向式學習', value: 'project_based' },
  
  // 學習深度偏好選項
  { id: 41, preference_type_id: 7, name: '概述性學習', value: 'overview' },
  { id: 42, preference_type_id: 7, name: '深入探究型', value: 'in_depth' },
  { id: 43, preference_type_id: 7, name: '實用應用型', value: 'practical' },
  { id: 44, preference_type_id: 7, name: '研究創新型', value: 'research' },
  
  // 社交學習風格選項
  { id: 45, preference_type_id: 8, name: '主動引導型', value: 'leader' },
  { id: 46, preference_type_id: 8, name: '積極參與型', value: 'active_participant' },
  { id: 47, preference_type_id: 8, name: '觀察學習型', value: 'observer' },
  { id: 48, preference_type_id: 8, name: '獨立貢獻型', value: 'independent_contributor' },
  
  // 協作模式偏好選項
  { id: 49, preference_type_id: 9, name: '角色明確的團隊協作', value: 'structured_team' },
  { id: 50, preference_type_id: 9, name: '開放式腦力激盪', value: 'brainstorming' },
  { id: 51, preference_type_id: 9, name: '結構化討論', value: 'structured_discussion' },
  { id: 52, preference_type_id: 9, name: '專業知識共享', value: 'expertise_sharing' },
  
  // 學習節奏偏好選項
  { id: 53, preference_type_id: 10, name: '密集短期學習', value: 'intensive' },
  { id: 54, preference_type_id: 10, name: '分散長期學習', value: 'distributed' },
  { id: 55, preference_type_id: 10, name: '固定時間表', value: 'scheduled' },
  { id: 56, preference_type_id: 10, name: '彈性自主排程', value: 'flexible' },
  
  // 挑戰難度偏好選項
  { id: 57, preference_type_id: 11, name: '舒適區學習', value: 'comfort_zone' },
  { id: 58, preference_type_id: 11, name: '適度挑戰', value: 'moderate_challenge' },
  { id: 59, preference_type_id: 11, name: '高挑戰高成長', value: 'high_challenge' },
  
  // 學習目標導向選項
  { id: 60, preference_type_id: 12, name: '精通導向', value: 'mastery' },
  { id: 61, preference_type_id: 12, name: '表現導向', value: 'performance' },
  { id: 62, preference_type_id: 12, name: '應用導向', value: 'application' },
  { id: 63, preference_type_id: 12, name: '探索導向', value: 'exploration' },
  { id: 64, preference_type_id: 12, name: '證照導向', value: 'certification' },
  { id: 65, preference_type_id: 12, name: '興趣導向', value: 'interest' },
  
  // 技能實踐偏好選項
  { id: 66, preference_type_id: 13, name: '即時應用', value: 'immediate_application' },
  { id: 67, preference_type_id: 13, name: '觀察模仿', value: 'observation' },
  { id: 68, preference_type_id: 13, name: '引導練習', value: 'guided_practice' },
  { id: 69, preference_type_id: 13, name: '自主探索', value: 'self_exploration' },
  { id: 70, preference_type_id: 13, name: '反覆練習', value: 'repetitive_practice' },
  { id: 71, preference_type_id: 13, name: '情境模擬', value: 'simulation' },
  
  // 反思頻率偏好選項
  { id: 72, preference_type_id: 14, name: '即時反思', value: 'immediate' },
  { id: 73, preference_type_id: 14, name: '階段性反思', value: 'milestone' },
  { id: 74, preference_type_id: 14, name: '結構化反思', value: 'structured' },
  { id: 75, preference_type_id: 14, name: '深度反思', value: 'deep' },
  { id: 76, preference_type_id: 14, name: '協作反思', value: 'collaborative' },
  
  // 評量方式偏好選項
  { id: 77, preference_type_id: 15, name: '專案式評量', value: 'project' },
  { id: 78, preference_type_id: 15, name: '紙筆測驗', value: 'test' },
  { id: 79, preference_type_id: 15, name: '實作評量', value: 'performance' },
  { id: 80, preference_type_id: 15, name: '同儕互評', value: 'peer_assessment' },
  { id: 81, preference_type_id: 15, name: '自我反思評量', value: 'self_reflection' },
  { id: 82, preference_type_id: 15, name: '作品集評量', value: 'portfolio' },
  { id: 83, preference_type_id: 15, name: '持續性進度評量', value: 'continuous' },
  
  // 學習障礙偏好選項
  { id: 84, preference_type_id: 16, name: '分步驟引導協助', value: 'step_by_step' },
  { id: 85, preference_type_id: 16, name: '概念釐清支援', value: 'conceptual_clarification' },
  { id: 86, preference_type_id: 16, name: '實例示範協助', value: 'example_demonstration' },
  { id: 87, preference_type_id: 16, name: '鼓勵性支持', value: 'encouragement' },
  { id: 88, preference_type_id: 16, name: '同儕協助', value: 'peer_support' },
  { id: 89, preference_type_id: 16, name: '專家諮詢', value: 'expert_consultation' },
];

// 輔助函數 - 將選項按類型分組
export const groupPreferenceOptions = () => {
  const grouped: { [key: string]: PreferenceOption[] } = {};
  
  PREFERENCE_OPTIONS.forEach(option => {
    const typeValue = PREFERENCE_TYPES.find(type => type.id === option.preference_type_id)?.value || '';
    if (!grouped[typeValue]) {
      grouped[typeValue] = [];
    }
    grouped[typeValue].push(option);
  });
  
  return grouped;
};
