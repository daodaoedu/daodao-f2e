// 篩選器組件
import React from 'react';
import { IoFilterOutline as Filter, IoCloseOutline as X, IoChevronDownOutline as ChevronDown } from 'react-icons/io5';
import { PracticeFilter, PracticeStatus, ContentType } from '../../../services/practice/types';
import { getContentTypeLabel, getStatusLabel } from '../../../services/practice/utils';

interface FilterBarProps {
  filter: PracticeFilter;
  onFilterChange: (filter: Partial<PracticeFilter>) => void;
  onResetFilter: () => void;
  totalCount: number;
  filteredCount: number;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  onResetFilter,
  totalCount,
  filteredCount
}) => {
  const [showStatusFilter, setShowStatusFilter] = React.useState(false);
  const [showContentTypeFilter, setShowContentTypeFilter] = React.useState(false);
  const [showSortOptions, setShowSortOptions] = React.useState(false);

  const statusOptions: PracticeStatus[] = [
    PracticeStatus.ACTIVE,
    PracticeStatus.PAUSED,
    PracticeStatus.COMPLETED,
    PracticeStatus.ARCHIVED
  ];
  const contentTypeOptions: ContentType[] = [
    ContentType.BOOK,
    ContentType.VIDEO,
    ContentType.ARTICLES,
    ContentType.PODCAST,
    ContentType.COURSE,
    ContentType.CUSTOM
  ];

  const sortOptions = [
    { value: 'updatedAt', label: '最近更新' },
    { value: 'createdAt', label: '建立時間' },
    { value: 'progress', label: '完成度' },
    { value: 'streak', label: '連續天數' }
  ];

  const hasActiveFilters = !!(
    filter.status?.length ||
    filter.contentType?.length ||
    filter.searchTerm?.trim()
  );

  const handleStatusToggle = (status: PracticeStatus) => {
    const currentStatus = filter.status || [];
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter((s) => s !== status)
      : [...currentStatus, status];

    onFilterChange({ status: newStatus.length > 0 ? newStatus : undefined });
  };

  const handleContentTypeToggle = (contentType: ContentType) => {
    const currentTypes = filter.contentType || [];
    const newTypes = currentTypes.includes(contentType)
      ? currentTypes.filter((t) => t !== contentType)
      : [...currentTypes, contentType];

    onFilterChange({ contentType: newTypes.length > 0 ? newTypes : undefined });
  };

  const handleSortChange = (sortBy: PracticeFilter['sortBy']) => {
    onFilterChange({ sortBy });
    setShowSortOptions(false);
  };

  const handleSortOrderToggle = () => {
    onFilterChange({
      sortOrder: filter.sortOrder === 'asc' ? 'desc' : 'asc'
    });
  };

  return (
    <div className="p-4">
      {/* 篩選器標題和統計 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-basic-400" />
          <h3 className="heading-sm text-basic-black">篩選器</h3>
          {hasActiveFilters && (
            <span className="bg-primary-lightest text-primary-base text-xs px-2 py-1 rounded-full">
              已套用
            </span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <span className="body-sm text-basic-400">
            顯示 {filteredCount} / {totalCount} 項實踐
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilter}
              className="flex items-center space-x-1 body-sm text-alert hover:text-red-600"
            >
              <X className="h-4 w-4" />
              <span>清除篩選</span>
            </button>
          )}
        </div>
      </div>

      {/* 篩選選項 */}
      <div className="flex flex-wrap gap-4">
        {/* 狀態篩選 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStatusFilter(!showStatusFilter)}
            className={`flex items-center space-x-2 px-3 py-2 border rounded-md body-sm transition-colors ${
              filter.status?.length
                ? 'border-primary-base bg-primary-lightest text-primary-darker'
                : 'border-basic-200 bg-white text-basic-500 hover:bg-basic-100'
            }`}
          >
            <span>狀態</span>
            {filter.status?.length && (
              <span className="bg-primary-base text-white text-xs px-1.5 py-0.5 rounded-full">
                {filter.status.length}
              </span>
            )}
            <ChevronDown className="h-4 w-4" />
          </button>

          {showStatusFilter && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-basic-200 rounded-md shadow-lg z-10">
              <div className="p-2">
                {statusOptions.map((status) => (
                  <label key={status} className="flex items-center space-x-2 p-2 hover:bg-basic-100 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filter.status?.includes(status) || false}
                      onChange={() => handleStatusToggle(status)}
                      className="rounded border-basic-300 text-primary-base focus:ring-primary-base"
                    />
                    <span className="body-sm text-basic-500">
                      {getStatusLabel(status)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 內容類型篩選 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowContentTypeFilter(!showContentTypeFilter)}
            className={`flex items-center space-x-2 px-3 py-2 border rounded-md body-sm transition-colors ${
              filter.contentType?.length
                ? 'border-primary-base bg-primary-lightest text-primary-darker'
                : 'border-basic-200 bg-white text-basic-500 hover:bg-basic-100'
            }`}
          >
            <span>類型</span>
            {filter.contentType?.length && (
              <span className="bg-primary-base text-white text-xs px-1.5 py-0.5 rounded-full">
                {filter.contentType.length}
              </span>
            )}
            <ChevronDown className="h-4 w-4" />
          </button>

          {showContentTypeFilter && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-basic-200 rounded-md shadow-lg z-10">
              <div className="p-2">
                {contentTypeOptions.map((contentType) => (
                  <label key={contentType} className="flex items-center space-x-2 p-2 hover:bg-basic-100 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filter.contentType?.includes(contentType) || false}
                      onChange={() => handleContentTypeToggle(contentType)}
                      className="rounded border-basic-300 text-primary-base focus:ring-primary-base"
                    />
                    <span className="body-sm text-basic-500">
                      {getContentTypeLabel(contentType)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 排序選項 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSortOptions(!showSortOptions)}
            className="flex items-center space-x-2 px-3 py-2 border border-basic-200 bg-white text-basic-500 hover:bg-basic-100 rounded-md body-sm transition-colors"
          >
            <span>排序</span>
            <span className="text-xs text-basic-400">
              {sortOptions.find((opt) => opt.value === filter.sortBy)?.label}
            </span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {showSortOptions && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-basic-200 rounded-md shadow-lg z-10">
              <div className="p-2">
                {sortOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => handleSortChange(option.value as PracticeFilter['sortBy'])}
                    className={`w-full text-left p-2 body-sm rounded hover:bg-basic-100 ${
                      filter.sortBy === option.value ? 'bg-primary-lightest text-primary-darker' : 'text-basic-500'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}

                <div className="border-t border-basic-200 mt-2 pt-2">
                  <button
                    type="button"
                    onClick={handleSortOrderToggle}
                    className="w-full text-left p-2 body-sm text-basic-500 hover:bg-basic-100 rounded"
                  >
                    {filter.sortOrder === 'asc' ? '升序排列' : '降序排列'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 已套用的篩選器標籤 */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filter.status?.map((status) => (
            <span
              key={status}
              className="inline-flex items-center space-x-1 bg-primary-lightest text-primary-darker text-xs px-2 py-1 rounded-full"
            >
              <span>{getStatusLabel(status)}</span>
              <button
                type="button"
                onClick={() => handleStatusToggle(status)}
                className="hover:bg-primary-lighter rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {filter.contentType?.map((contentType) => (
            <span
              key={contentType}
              className="inline-flex items-center space-x-1 bg-success text-white text-xs px-2 py-1 rounded-full"
            >
              <span>{getContentTypeLabel(contentType)}</span>
              <button
                type="button"
                onClick={() => handleContentTypeToggle(contentType)}
                className="hover:bg-green-600 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {filter.searchTerm && (
            <span className="inline-flex items-center space-x-1 bg-tips text-white text-xs px-2 py-1 rounded-full">
              <span>搜尋: "{filter.searchTerm}"</span>
              <button
                type="button"
                onClick={() => onFilterChange({ searchTerm: '' })}
                className="hover:bg-orange-600 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
