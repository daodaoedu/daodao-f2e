import {
  CategoryAcademicSvg,
  CategoryFinanceSvg,
  CategoryHealthSvg,
  CategoryInterestSvg,
  CategorySocialSvg,
  CategoryWorkSvg,
} from "@daodao/assets";
import type { CategoryType, ICategory } from "../types";

export const categoryMap = new Map<CategoryType, ICategory>([
  [
    "interest",
    {
      id: "interest",
      label: "興趣",
      icon: CategoryInterestSvg,
      tags: [
        "學會鉤針",
        "登上百岳",
        "畫出油畫作品",
        "研究子彈筆記",
        "iPhone 攝影技巧",
        "一週一影評",
        "韓系化妝進階班",
        "寫小說",
        "學烏克麗麗",
        "iPad 畫畫",
        "動手做便當",
      ],
    },
  ],
  [
    "social",
    {
      id: "social",
      label: "人際",
      icon: CategorySocialSvg,
      tags: [
        "每週約一位朋友",
        "練習傾聽技巧",
        "加入社團活動",
        "學會拒絕的藝術",
        "寫感謝信",
        "主動關心家人",
        "參加志工服務",
      ],
    },
  ],
  [
    "health",
    {
      id: "health",
      label: "健康",
      icon: CategoryHealthSvg,
      tags: [
        "每日走一萬步",
        "學習冥想",
        "減少含糖飲料",
        "早睡早起",
        "每週運動三次",
        "學習健康料理",
        "培養伸展習慣",
      ],
    },
  ],
  [
    "academic",
    {
      id: "academic",
      label: "學業",
      icon: CategoryAcademicSvg,
      tags: [
        "每日閱讀 30 分鐘",
        "學習新語言",
        "完成線上課程",
        "做讀書筆記",
        "準備證照考試",
        "學習程式設計",
        "研究一個新主題",
      ],
    },
  ],
  [
    "work",
    {
      id: "work",
      label: "工作",
      icon: CategoryWorkSvg,
      tags: [
        "學習時間管理",
        "建立個人品牌",
        "學習簡報技巧",
        "精進專業技能",
        "建立人脈網絡",
        "學會任務排序",
        "提升溝通能力",
      ],
    },
  ],
  [
    "finance",
    {
      id: "finance",
      label: "金錢",
      icon: CategoryFinanceSvg,
      tags: [
        "記帳習慣",
        "學習投資基礎",
        "減少不必要開支",
        "設定儲蓄目標",
        "了解理財工具",
        "開始存美股",
        "建立緊急預備金",
      ],
    },
  ],
]);

export function getCategoryLabel(categoryId: CategoryType): string {
  return categoryMap.get(categoryId)?.label ?? categoryId;
}

export function getCategoryTags(categoryId: CategoryType): string[] {
  return categoryMap.get(categoryId)?.tags ?? [];
}
