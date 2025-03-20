import {
    BookOpen,
    Video,
    FileText,
    Headphones,
    PlusCircle
  } from 'lucide-react';

  // 自定義色彩方案
  export const colors = {
    primary: "#16b9b3", // 青色
    secondary: "#ffa10b", // 橙色
    accent: "#f9e41c", // 黃色
    background: "#99ecff", // 淺藍色
    dark: "#0f3036", // 深青色
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
    { id: 'podcast', label: '播客', icon: Headphones },
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
