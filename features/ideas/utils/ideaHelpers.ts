import { format, parseISO } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { IdeaTag } from '../types';

/**
 * 格式化日期顯示
 */
export const formatIdeaDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'dd/MM/yyyy', { locale: zhTW });
  } catch {
    return dateString;
  }
};

/**
 * 格式化相對時間顯示
 */
export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return '剛剛';
    if (diffInMinutes < 60) return `${diffInMinutes}分鐘前`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}小時前`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}天前`;

    return formatIdeaDate(dateString);
  } catch {
    return dateString;
  }
};

/**
 * 根據標籤類別返回對應的CSS類別
 */
export const getTagCategoryClass = (category: IdeaTag['category']): string => {
  const categoryClasses: Record<IdeaTag['category'], string> = {
    design: 'bg-purple-100 text-purple-700 border-purple-200',
    tech: 'bg-blue-100 text-blue-700 border-blue-200',
    business: 'bg-green-100 text-green-700 border-green-200',
    psychology: 'bg-pink-100 text-pink-700 border-pink-200',
    education: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    creativity: 'bg-orange-100 text-orange-700 border-orange-200',
    custom: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  };

  return categoryClasses[category] || 'bg-gray-100 text-gray-700 border-gray-200';
};

/**
 * 驗證URL格式
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * 處理文字截斷
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
};

/**
 * 驗證Idea表單數據
 */
export const validateIdeaForm = (data: {
  content: string;
  ideaResources?: Array<{ name: string; url: string }>;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data.content.trim()) {
    errors.content = '請輸入內容';
  } else if (data.content.length > 5000) {
    errors.content = '內容不能超過5000個字符';
  }

  // 驗證資源
  if (data.ideaResources) {
    data.ideaResources.forEach((resource, index) => {
      if (!resource.name.trim()) {
        errors[`resource_${index}_name`] = '請輸入資源名稱';
      }
      if (!resource.url.trim()) {
        errors[`resource_${index}_url`] = '請輸入資源網址';
      } else if (!isValidUrl(resource.url)) {
        errors[`resource_${index}_url`] = '請輸入有效的網址格式';
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
