import React from 'react';
import { Hash } from 'lucide-react';
import { cn } from '@/utils/cn';

// 使用設計系統配色
const getTagColor = (tag: string): string => {
  // 預設標籤配色 - 使用專案配色方案
  const tagColors: Record<string, string> = {
    // 分類標籤
    '學習': 'bg-primary-base/10 text-primary-darker',
    '技能': 'bg-success/10 text-success',
    '工作': 'bg-basic-300/20 text-basic-500',
    '興趣': 'bg-tips/10 text-tips',
    '健康': 'bg-success/20 text-success',
    '創作': 'bg-tips/20 text-tips',
    // 難度標籤
    '初學': 'bg-success/10 text-success',
    '進階': 'bg-tips/10 text-tips',
    '專家': 'bg-alert/10 text-alert',
    // 時長標籤
    '短期': 'bg-primary-lighter/20 text-primary-base',
    '中期': 'bg-basic-200/50 text-basic-400',
    '長期': 'bg-basic-300/30 text-basic-500'
  };
  
  return tagColors[tag] || 'bg-basic-100 text-basic-400';
};

interface TagListProps {
  tags: string[];
  maxDisplay?: number;
  showIcon?: boolean;
  className?: string;
}

const TagList: React.FC<TagListProps> = ({ 
  tags, 
  maxDisplay = 5,
  showIcon = true,
  className = '' 
}) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  const displayTags = tags.slice(0, maxDisplay);
  const hasMore = tags.length > maxDisplay;

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {showIcon && (
        <Hash className="h-4 w-4 text-basic-400 flex-shrink-0" />
      )}
      <div className="flex flex-wrap items-center gap-1">
        {displayTags.map((tag, index) => (
          <span
            key={index}
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium transition-colors",
              getTagColor(tag)
            )}
          >
            {tag}
          </span>
        ))}
        {hasMore && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-basic-100 text-basic-400">
            +{tags.length - maxDisplay}
          </span>
        )}
      </div>
    </div>
  );
};

export default TagList;
export type { TagListProps };
