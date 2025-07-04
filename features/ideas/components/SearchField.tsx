import React, { useState, useCallback } from 'react';
import {
  Search,
  Hash,
  X,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SearchFieldProps {
  value?: string;
  onSearch?: (query: string) => void;
  onTagChange?: (tags: string[]) => void;
  className?: string;
  expanded?: boolean;
}

// 預設的熱門標籤
const DEFAULT_TAGS = [
  { id: '1', name: '程式設計', category: 'tech' },
  { id: '2', name: '設計思維', category: 'design' },
  { id: '3', name: '創業', category: 'business' },
  { id: '4', name: '學習方法', category: 'education' },
  { id: '5', name: '時間管理', category: 'productivity' },
  { id: '6', name: '創意發想', category: 'creativity' },
  { id: '7', name: '人工智慧', category: 'tech' },
  { id: '8', name: '用戶體驗', category: 'design' },
  { id: '9', name: '專案管理', category: 'business' },
  { id: '10', name: '心理學', category: 'psychology' },
];

const SearchField: React.FC<SearchFieldProps> = ({
  value = '',
  onSearch,
  onTagChange,
  className = '',
  expanded = false,
}) => {
  const [searchValue, setSearchValue] = useState(value);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [isExpanded, setIsExpanded] = useState(expanded);

  const handleSearchChange = useCallback((newValue: string) => {
    setSearchValue(newValue);
    onSearch?.(newValue);
  }, [onSearch]);

  const handleTagClick = useCallback((tagName: string) => {
    if (!selectedTags.includes(tagName) && selectedTags.length < 3) {
      const newTags = [...selectedTags, tagName];
      setSelectedTags(newTags);
      onTagChange?.(newTags);
    }
    setShowTagSuggestions(false);
  }, [selectedTags, onTagChange]);

  const removeTag = useCallback((tagName: string) => {
    const newTags = selectedTags.filter((tag) => tag !== tagName);
    setSelectedTags(newTags);
    onTagChange?.(newTags);
  }, [selectedTags, onTagChange]);

  const createCustomTag = useCallback(() => {
    if (customTagInput.trim() && selectedTags.length < 3) {
      const newTagName = customTagInput.trim();
      if (!selectedTags.includes(newTagName)) {
        const newTags = [...selectedTags, newTagName];
        setSelectedTags(newTags);
        onTagChange?.(newTags);
        setCustomTagInput('');
        setShowTagSuggestions(false);
      }
    }
  }, [customTagInput, selectedTags, onTagChange]);

  const clearAllTags = useCallback(() => {
    setSelectedTags([]);
    onTagChange?.([]);
  }, [onTagChange]);

  const handleCustomTagKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      createCustomTag();
    }
  }, [createCustomTag]);

  return (
    <div className={`bg-white rounded-lg border border-basic-200 transition-all duration-200 ${className}`}>
      {/* Main Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-basic-300" />
          <Input
            type="text"
            placeholder="搜尋想法、標籤或作者..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-12 pr-12 py-3 text-lg border-none shadow-none focus:ring-0 bg-basic-100 hover:bg-white focus:bg-white transition-colors"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-basic-300 hover:text-primary-base"
          >
            <Filter className="h-4 w-4 mr-1" />
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="border-t border-basic-200 p-4 bg-basic-50">
          <div className="space-y-4">
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-basic-500">已選標籤 ({selectedTags.length}/3)</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllTags}
                    className="text-xs text-basic-300 hover:text-red-500"
                  >
                    清除全部
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm border bg-primary-base/10 text-primary-darker border-primary-base/20"
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTag(tag)}
                        className="ml-2 h-4 w-4 p-0 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tag Selection */}
            <div className="space-y-3">
              <Label className="text-sm text-basic-500">
                添加標籤 {selectedTags.length < 3 ? `(還可選 ${3 - selectedTags.length} 個)` : '(已達上限)'}
              </Label>

              {/* Custom Tag Input */}
              {selectedTags.length < 3 && (
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyPress={handleCustomTagKeyPress}
                    placeholder="輸入自訂標籤"
                    className="flex-1 border-basic-200 hover:border-primary-base focus:border-primary-base"
                  />
                  <Button
                    onClick={createCustomTag}
                    disabled={!customTagInput.trim() || selectedTags.length >= 3}
                    size="sm"
                    className="bg-primary-base hover:bg-primary-darker text-white disabled:bg-basic-300"
                  >
                    新增
                  </Button>
                </div>
              )}

              {/* Toggle Tag Suggestions */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTagSuggestions(!showTagSuggestions)}
                className="w-full border-basic-200 text-basic-500 hover:border-primary-base hover:text-primary-base"
              >
                <Hash className="h-4 w-4 mr-2" />
                {showTagSuggestions ? '隱藏' : '顯示'}熱門標籤
                {showTagSuggestions ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
              </Button>

              {/* Tag Suggestions */}
              {showTagSuggestions && (
                <div className="bg-white border border-basic-200 rounded-lg p-3 max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {DEFAULT_TAGS.map((tag) => {
                      const isSelected = selectedTags.includes(tag.name);
                      const isDisabled = isSelected || selectedTags.length >= 3;

                      return (
                        <Button
                          key={tag.id}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTagClick(tag.name)}
                          disabled={!!isDisabled}
                          className={`justify-start text-left p-2 h-auto ${
                            isSelected
                              ? 'bg-primary-base/10 text-primary-darker border border-primary-base/20'
                              : isDisabled
                                ? 'text-basic-300 cursor-not-allowed'
                                : 'text-basic-500 hover:bg-basic-100'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <Hash className="h-3 w-3 mr-2" />
                              <span className="text-sm truncate">{tag.name}</span>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Search Stats */}
            {searchValue && (
              <div className="pt-3 border-t border-basic-200">
                <p className="text-xs text-basic-400">
                  搜尋關鍵字：<span className="font-medium text-basic-500">"{searchValue}"</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchField;
