import React from 'react';
import { Filter, X } from 'lucide-react';
import { PracticeFilter, PracticeStatus, ContentType } from '@/services/practice/schema';
import { getContentTypeLabel, getStatusLabel } from '@/services/practice/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

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
  const statusOptions: PracticeStatus[] = [
    'active',
    'paused',
    'completed',
    'archived'
  ];

  const contentTypeOptions: ContentType[] = [
    'book',
    'video',
    'articles',
    'podcast',
    'course',
    'custom'
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

  const handleStatusToggle = (status: PracticeStatus, checked: boolean) => {
    const currentStatus = filter.status || [];
    const newStatus = checked
      ? [...currentStatus, status]
      : currentStatus.filter((s) => s !== status);

    onFilterChange({ status: newStatus.length > 0 ? newStatus : undefined });
  };

  const handleContentTypeToggle = (contentType: ContentType, checked: boolean) => {
    const currentTypes = filter.contentType || [];
    const newTypes = checked
      ? [...currentTypes, contentType]
      : currentTypes.filter((t) => t !== contentType);

    onFilterChange({ contentType: newTypes.length > 0 ? newTypes : undefined });
  };

  const handleSortChange = (sortBy: PracticeFilter['sortBy']) => {
    onFilterChange({ sortBy });
  };

  const handleSortOrderToggle = () => {
    onFilterChange({
      sortOrder: filter.sortOrder === 'asc' ? 'desc' : 'asc'
    });
  };

  const removeStatusFilter = (status: PracticeStatus) => {
    const newStatus = (filter.status || []).filter((s) => s !== status);
    onFilterChange({ status: newStatus.length > 0 ? newStatus : undefined });
  };

  const removeContentTypeFilter = (contentType: ContentType) => {
    const newTypes = (filter.contentType || []).filter((t) => t !== contentType);
    onFilterChange({ contentType: newTypes.length > 0 ? newTypes : undefined });
  };

  return (
    <div className="p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">篩選器</h3>
          {hasActiveFilters && (
            <Badge variant="secondary">已套用</Badge>
          )}
        </div>

        <div className="flex flex-col xs:flex-row xs:items-center space-y-2 xs:space-y-0 xs:space-x-4">
          <span className="text-sm text-muted-foreground">
            顯示 {filteredCount} / {totalCount} 項實踐
          </span>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilter}
              className="text-destructive hover:text-destructive self-start xs:self-auto"
            >
              <X className="h-4 w-4 mr-1" />
              清除篩選
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-4">
        {/* 狀態篩選 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full xs:w-auto">
              狀態
              {filter.status?.length && (
              <Badge variant="default" className="ml-2 h-5 min-w-5 p-0 text-xs">
                {filter.status.length}
              </Badge>
                )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {statusOptions.map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={filter.status?.includes(status) || false}
                onCheckedChange={(checked) => handleStatusToggle(status, checked)}
              >
                {getStatusLabel(status)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 內容類型篩選 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full xs:w-auto">
              類型
              {filter.contentType?.length && (
              <Badge variant="default" className="ml-2 h-5 min-w-5 p-0 text-xs">
                {filter.contentType.length}
              </Badge>
                )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {contentTypeOptions.map((contentType) => (
              <DropdownMenuCheckboxItem
                key={contentType}
                checked={filter.contentType?.includes(contentType) || false}
                onCheckedChange={(checked) => handleContentTypeToggle(contentType, checked)}
              >
                {getContentTypeLabel(contentType)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 排序選項 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full xs:w-auto">
              <span className="hidden sm:inline">排序：</span>
              <span className="sm:hidden">排序</span>
              <span className="hidden lg:inline">{sortOptions.find((opt) => opt.value === filter.sortBy)?.label}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleSortChange(option.value as PracticeFilter['sortBy'])}
                className={filter.sortBy === option.value ? 'bg-accent' : ''}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSortOrderToggle}>
              {filter.sortOrder === 'asc' ? '升序排列' : '降序排列'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 已套用的篩選標籤 */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filter.status?.map((status) => (
            <Badge
              key={status}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => removeStatusFilter(status)}
            >
              {getStatusLabel(status)}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}

          {filter.contentType?.map((contentType) => (
            <Badge
              key={contentType}
              variant="default"
              className="cursor-pointer hover:bg-primary/80"
              onClick={() => removeContentTypeFilter(contentType)}
            >
              {getContentTypeLabel(contentType)}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}

          {filter.searchTerm && (
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-muted"
              onClick={() => onFilterChange({ searchTerm: '' })}
            >
              搜尋: "{filter.searchTerm}"
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
