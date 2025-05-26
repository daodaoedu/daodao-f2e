import {
  IoBookOutline as BookOpen,
  IoVideocamOutline as Video,
  IoDocumentTextOutline as FileText,
  IoHeadsetOutline as Headphones,
  IoAddCircleOutline as PlusCircle
} from 'react-icons/io5';

// 自定義色彩方案 - 匹配專案配色
export const colors = {
  primary: "#16B9B3", // primary-base
  primaryLight: "#89DAD7", // primary-lighter
  primaryDark: "#295E5C", // primary-darker
  secondary: "#FF9526", // tips
  accent: "#86C84A", // success
  background: "#F3FCFC", // primary-palest
  dark: "#011416", // basic-black
  alert: "#EF5364", // alert
};

// 動機選項
export const motivationOptions = [
  { id: 'career', label: '職業成長' },
  { id: 'personal', label: '個人興趣' },
  { id: 'project', label: '特定專案' },
  { id: 'required', label: '必修學習' },
  { id: 'other', label: '其他...' }
];

// 內容類型選項
export const contentTypeOptions = [
  { id: 'book', label: '書籍', icon: BookOpen },
  { id: 'video', label: '影片課程', icon: Video },
  { id: 'articles', label: '文章', icon: FileText },
  { id: 'podcast', label: 'Podcast', icon: Headphones },
  { id: 'custom', label: '自定義', icon: PlusCircle }
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
