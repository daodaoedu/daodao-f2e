import {
  Book,
  Video,
  FileText,
  Headphones,
  GraduationCap,
  Plus,
} from 'lucide-react';

// 自定義色彩方案 - 匹配專案配色
export const colors = {
  primary: '#16B9B3', // primary-base
  primaryLight: '#89DAD7', // primary-lighter
  primaryDark: '#295E5C', // primary-darker
  secondary: '#FF9526', // tips
  accent: '#86C84A', // success
  background: '#F3FCFC', // primary-palest
  dark: '#011416', // basic-black
  alert: '#EF5364', // alert
};

// 動機選項
export const motivationOptions = [
  { id: 'career', label: '職業成長' },
  { id: 'personal', label: '個人興趣' },
  { id: 'project', label: '特定專案' },
  { id: 'required', label: '必修學習' },
  { id: 'other', label: '其他...' },
];

// 內容類型選項 - 使用 string 型別以確保相容性
export const contentTypeOptions = [
  { id: 'book' as const, label: '書籍', icon: Book },
  { id: 'video' as const, label: '影片課程', icon: Video },
  { id: 'articles' as const, label: '文章', icon: FileText },
  { id: 'podcast' as const, label: 'Podcast', icon: Headphones },
  { id: 'course' as const, label: '課程', icon: GraduationCap },
  { id: 'custom' as const, label: '自定義', icon: Plus },
];

// 根據內容類型獲取單位類型
export const getUnitType = (contentType: string): string => {
  switch (contentType) {
    case 'book': return '頁';
    case 'video': return '課';
    case 'articles': return '篇';
    case 'podcast': return '集';
    case 'custom': return '單元';
    default: return '單元';
  }
};

// 預設標籤選項
export const defaultTags = {
  categories: [
    { id: 'learning', label: '學習', color: 'bg-blue-100 text-blue-800' },
    { id: 'skill', label: '技能', color: 'bg-green-100 text-green-800' },
    { id: 'work', label: '工作', color: 'bg-purple-100 text-purple-800' },
    { id: 'hobby', label: '興趣', color: 'bg-pink-100 text-pink-800' },
    { id: 'health', label: '健康', color: 'bg-orange-100 text-orange-800' },
    { id: 'creative', label: '創作', color: 'bg-yellow-100 text-yellow-800' },
  ],
  difficulty: [
    { id: 'beginner', label: '初學', color: 'bg-emerald-100 text-emerald-800' },
    { id: 'intermediate', label: '進階', color: 'bg-amber-100 text-amber-800' },
    { id: 'advanced', label: '專家', color: 'bg-red-100 text-red-800' },
  ],
  duration: [
    { id: 'short-term', label: '短期', color: 'bg-cyan-100 text-cyan-800' },
    { id: 'medium-term', label: '中期', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'long-term', label: '長期', color: 'bg-violet-100 text-violet-800' },
  ],
};
