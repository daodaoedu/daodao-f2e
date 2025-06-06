import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import {
  Search,
  Hash,
  X,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';
import { useIdeasContext } from '../contexts';
import { getTagCategoryClass } from '../utils';
import type { IdeaTag } from '../types';

interface SearchFieldProps {
  onSearch?: (query: string) => void;
  className?: string;
  expanded?: boolean;
  syncWithUrl?: boolean;
}

const SearchField: React.FC<SearchFieldProps> = ({
  onSearch,
  className = '',
  expanded = false,
  syncWithUrl = true,
}) => {
  const {
    state: contextState,
    setSearch,
    addTag,
    removeTag,
    clearTags,
    toggleSearchExpanded
  } = useIdeasContext();

  const [getSearchParams, pushState] = useSearchParamsManager();

  const [customTagInput, setCustomTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    onSearch?.(value);

    // 同步到 URL 參數
    if (syncWithUrl) {
      pushState('search', value || '');
    }
  }, [setSearch, onSearch, syncWithUrl, pushState]);

  // 初始化時從 URL 讀取搜尋參數
  useEffect(() => {
    if (!syncWithUrl) return;

    const urlSearch = getSearchParams('search')?.[0] || '';
    if (urlSearch && urlSearch !== contextState.filters.search) {
      setSearch(urlSearch);
    }

    // 只在組件初次載入時讀取 URL 標籤
    const urlTags = getSearchParams('tags') || [];
    if (urlTags.length > 0 && contextState.selectedTags.length === 0) {
      urlTags.forEach((tagName: string) => {
        const existingTag = contextState.availableTags.find((t) => t.name === tagName);
        if (existingTag) {
          addTag(existingTag);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncWithUrl]); // 只在 syncWithUrl 變化時執行

  const handleTagClick = useCallback((tag: IdeaTag) => {
    if (!contextState.selectedTags.find((t) => t.id === tag.id) && contextState.selectedTags.length < 3) {
      addTag(tag);

      // 同步標籤到 URL
      if (syncWithUrl) {
        const newTags = [...contextState.selectedTags, tag].map((t) => t.name);
        pushState('tags', newTags.join(','));
      }
    }
    setShowTagSuggestions(false);
  }, [addTag, contextState.selectedTags, syncWithUrl, pushState]);

  const createCustomTag = useCallback(() => {
    if (customTagInput.trim() && contextState.selectedTags.length < 3) {
      const newTag: IdeaTag = {
        id: `custom_${Date.now()}`,
        name: customTagInput.trim(),
        category: 'custom',
        count: 1
      };

      if (!contextState.selectedTags.find((t) => t.name.toLowerCase() === newTag.name.toLowerCase())) {
        addTag(newTag);
        setCustomTagInput('');
        setShowTagSuggestions(false);

        // 同步新標籤到 URL
        if (syncWithUrl) {
          const newTags = [...contextState.selectedTags, newTag].map((t) => t.name);
          pushState('tags', newTags.join(','));
        }
      }
    }
  }, [customTagInput, addTag, contextState.selectedTags, syncWithUrl, pushState]);

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
            value={contextState.filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-12 pr-12 py-3 text-lg border-none shadow-none focus:ring-0 bg-basic-100 hover:bg-white focus:bg-white transition-colors"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSearchExpanded}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-basic-300 hover:text-primary-base"
          >
            <Filter className="h-4 w-4 mr-1" />
            {contextState.isSearchExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Expanded Filters */}
      {(contextState.isSearchExpanded || expanded) && (
        <div className="border-t border-basic-200 p-4 bg-basic-50">
          <div className="space-y-4">
            {/* Selected Tags */}
            {contextState.selectedTags.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="body-sm text-basic-500">已選標籤 ({contextState.selectedTags.length}/3)</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      clearTags();

                      // 清除 URL 中的標籤參數
                      if (syncWithUrl) {
                        pushState('tags', '');
                      }
                    }}
                    className="text-xs text-basic-300 hover:text-red-500"
                  >
                    清除全部
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {contextState.selectedTags.map((tag) => (
                    <span
                      key={tag.id}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm border transition-colors ${
                        getTagCategoryClass(tag.category)
                      }`}
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      {tag.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          removeTag(tag.id);

                          // 同步移除標籤到 URL
                          if (syncWithUrl) {
                            const remainingTags = contextState.selectedTags
                              .filter((t) => t.id !== tag.id)
                              .map((t) => t.name);
                            pushState('tags', remainingTags.length > 0 ? remainingTags.join(',') : '');
                          }
                        }}
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
              <Label className="body-sm text-basic-500">
                添加標籤 {contextState.selectedTags.length < 3 ? `(還可選 ${3 - contextState.selectedTags.length} 個)` : '(已達上限)'}
              </Label>

              {/* Custom Tag Input */}
              {contextState.selectedTags.length < 3 && (
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
                    disabled={!customTagInput.trim() || contextState.selectedTags.length >= 3}
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
                    {contextState.availableTags.map((tag) => {
                      const isSelected = contextState.selectedTags.find((t) => t.id === tag.id);
                      const isDisabled = isSelected || contextState.selectedTags.length >= 3;

                      return (
                        <Button
                          key={tag.id}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTagClick(tag)}
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
                            <span className="text-xs text-basic-300 ml-2">{tag.count}</span>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Search Stats */}
            {contextState.filters.search && (
              <div className="pt-3 border-t border-basic-200">
                <p className="text-xs text-basic-400">
                  搜尋關鍵字：<span className="font-medium text-basic-500">"{contextState.filters.search}"</span>
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
