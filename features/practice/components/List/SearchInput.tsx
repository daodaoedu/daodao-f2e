// 搜尋輸入組件
import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = '搜尋實踐項目...',
  className = '',
}) => {
  const [focused, setFocused] = React.useState(false);

  const handleClear = () => {
    onChange('');
    if (onClear) onClear();
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        {/* 搜尋圖示 */}
        <Search className={cn(
          'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors',
          focused ? 'text-primary' : 'text-muted-foreground'
        )}
        />

        {/* 輸入框 */}
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={cn(
            'pl-10 pr-10',
            focused && 'ring-2 ring-primary/20'
          )}
        />

        {/* 清除按鈕 */}
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            type="button"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">清除搜尋</span>
          </Button>
        )}
      </div>

      {/* 搜尋建議或快速篩選 */}
      {focused && value.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-10 mt-2 rounded-md border bg-popover p-3 shadow-md">
          <div className="text-xs font-medium text-muted-foreground mb-2">搜尋範圍包含：</div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 實踐標題和描述</li>
            <li>• 小目標內容</li>
            <li>• 學習資源名稱</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchInput;
