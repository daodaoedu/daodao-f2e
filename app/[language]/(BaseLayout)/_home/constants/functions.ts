export const FUNCTIONS = [
  {
    id: 'ideas',
    title: '想法',
    description: '捕捉並分享受到啟發的時刻。在這裡，每個想法都可能點亮別人的學習之路。',
    icon: '💡',
    color: 'bg-blue-100',
    action: '馬上開始',
  },
  {
    id: 'theme-practice',
    title: '主題實踐',
    description: '用 7-30 天的時間嘗試新主題，發現你的興趣。定時打卡，紀錄軌跡和心得！',
    icon: '🎯',
    color: 'bg-green-100',
    action: '馬上開始',
  },
  {
    id: 'learning-plan',
    title: '學習計劃',
    description: '為重要目標建立完整的學習計劃。設定目標、追蹤進度、累積成長！',
    icon: '📚',
    color: 'bg-purple-100',
    action: '馬上開始',
  },
  {
    id: 'resources',
    title: '資源',
    description: '探索社群推薦的優質學習資源，分享你用過的好內容，並留下真實使用心得。',
    icon: '🔗',
    color: 'bg-yellow-100',
    action: '馬上開始',
  },
] as const;

export type FunctionId = typeof FUNCTIONS[number]['id'];
export type Function = typeof FUNCTIONS[number];
