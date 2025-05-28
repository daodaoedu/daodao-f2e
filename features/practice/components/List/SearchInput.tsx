// 搜尋輸入組件
import React from 'react';
import { Search, X } from 'lucide-react';

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
  className = ''
}) => {
  const [focused, setFocused] = React.useState(false);

  const handleClear = () => {
    onChange('');
    if (onClear) onClear();
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`relative flex items-center border-2 rounded-lg transition-all duration-200 ${
        focused
          ? 'border-primary-base shadow-md ring-2 ring-primary-base ring-opacity-20'
          : 'border-basic-200 hover:border-primary-lighter'
      }`}
      >
        {/* 搜尋圖示 */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <Search className={`h-5 w-5 transition-colors ${
            focused ? 'text-primary-base' : 'text-basic-300'
          }`}
          />
        </div>

        {/* 輸入框 */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 bg-transparent border-none outline-none text-basic-black placeholder-basic-300 body-md"
        />

        {/* 清除按鈕 */}
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-basic-100 transition-colors"
            type="button"
          >
            <X className="h-4 w-4 text-basic-300 hover:text-basic-400" />
          </button>
        )}
      </div>

      {/* 搜尋建議或快速篩選 */}
      {focused && value.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-basic-200 rounded-lg shadow-lg z-10">
          <div className="p-3">
            <div className="text-xs text-basic-400 mb-2 font-medium">搜尋範圍包含：</div>
            <ul className="body-sm text-basic-400 space-y-1">
              <li>• 實踐標題和描述</li>
              <li>• 小目標內容</li>
              <li>• 學習資源名稱</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInput;
