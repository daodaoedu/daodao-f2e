import React, { useState, useCallback } from 'react';
import {
  Search, Plus, Target, Filter, SortAsc, RefreshCw,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/shared/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import type { PracticeFilter, Practice } from '@/services/practice/schema';
import PracticeCard from './PracticeCard';
import { useFilteredPractices } from '../../hooks';

interface PracticeExploreSectionProps {
  className?: string;
  showHeader?: boolean;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
}

const PracticeExploreSection: React.FC<PracticeExploreSectionProps> = ({
  className = '',
  showHeader = true,
  showCreateButton = true,
  onCreateClick,
}) => {
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'progress' | 'streak'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Build filter parameters
  const filter: PracticeFilter = {
    searchTerm: searchQuery || undefined,
    sortBy,
    sortOrder,
    // Only show active practices in explore mode
    status: ['active'],
  };

  // Use filtered practices hook
  const {
    practices,
    loading: isLoading,
    error,
  } = useFilteredPractices(filter);

  const isEmpty = !isLoading && (!practices || practices.length === 0);

  const refresh = () => {
    // Refresh functionality can be implemented later
    console.log('Refresh practices');
  };

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleSortChange = useCallback((newSortBy: typeof sortBy, newSortOrder: typeof sortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, []);

  const handleCreateClick = () => {
    if (onCreateClick) {
      onCreateClick();
    } else {
      // Default behavior - navigate to create page
      window.location.href = '/practice/create';
    }
  };

  const handleEdit = (practice: Practice) => {
    window.location.href = `/practice/${practice.id}/edit`;
  };

  const handleDelete = (practice: Practice) => {
    console.log('Delete practice:', practice.id);
    // Handle delete operation
  };

  const handleCheckIn = (practice: Practice) => {
    console.log('Check in practice:', practice.id);
    // Handle check-in operation
  };

  // const handleJoin = (practice: Practice) => {
  //   console.log('Join practice:', practice.id);
  //   // Handle join operation - this would typically create a copy for the user
  // };

  // Sort options
  const sortOptions = [
    { label: '最新建立', sortBy: 'createdAt' as const, sortOrder: 'desc' as const },
    { label: '最舊建立', sortBy: 'createdAt' as const, sortOrder: 'asc' as const },
    { label: '最近更新', sortBy: 'updatedAt' as const, sortOrder: 'desc' as const },
    { label: '進度最高', sortBy: 'progress' as const, sortOrder: 'desc' as const },
    { label: '連續天數', sortBy: 'streak' as const, sortOrder: 'desc' as const },
  ];

  const getCurrentSortLabel = () => {
    const current = sortOptions.find((opt) => opt.sortBy === sortBy && opt.sortOrder === sortOrder);
    return current?.label || '最新建立';
  };

  if (error) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <Target className="mx-auto mb-4 size-12 text-basic-200" />
            <h3 className="text-basic-600 mb-2 text-lg font-medium">載入失敗</h3>
            <p className="mb-4 text-basic-400">
              {error?.message || '無法載入實踐內容，請稍後再試'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="size-4" />
              重新載入
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      {showHeader && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="size-5 text-primary-base" />
              探索主題實踐
              {practices && (
                <span className="text-sm font-normal text-basic-400">
                  (
                  {practices.length}
                  )
                </span>
              )}
            </CardTitle>
            {showCreateButton && (
              <Button
                size="sm"
                onClick={handleCreateClick}
                className="flex items-center gap-2"
              >
                <Plus className="size-4" />
                <span className="hidden sm:inline">開始實踐</span>
              </Button>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent className="space-y-4">
        {/* Search and Filter Bar */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-basic-400" />
              <Input
                placeholder="搜尋實踐標題、描述、標籤..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              {/* Advanced Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                className={`flex items-center gap-2 ${showAdvancedFilter ? 'bg-primary-50 text-primary-600' : ''}`}
              >
                <Filter className="size-4" />
                <span className="hidden sm:inline">篩選</span>
              </Button>

              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <SortAsc className="size-4" />
                    <span className="hidden sm:inline">{getCurrentSortLabel()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {sortOptions.map((option) => (
                    <DropdownMenuItem
                      key={`${option.sortBy}-${option.sortOrder}`}
                      onClick={() => handleSortChange(option.sortBy, option.sortOrder)}
                      className={`cursor-pointer ${
                        sortBy === option.sortBy && sortOrder === option.sortOrder
                          ? 'bg-primary-50 text-primary-600'
                          : ''
                      }`}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Advanced Filter Bar */}
          {showAdvancedFilter && (
            <div className="bg-basic-50 rounded-lg p-4">
              <p className="text-sm text-basic-400">進階篩選功能開發中</p>
            </div>
          )}
        </div>

        {/* Practices Content */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={`practice-skeleton-${Date.now()}-${index}`} className="animate-pulse">
                <div className="h-40 rounded-lg bg-basic-100" />
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <div className="py-12 text-center">
            <Target className="mx-auto mb-4 size-16 text-basic-200" />
            <h3 className="text-basic-600 mb-2 text-lg font-medium">
              {searchQuery ? '找不到相關實踐' : '還沒有實踐活動'}
            </h3>
            <p className="mb-6 text-basic-400">
              {searchQuery
                ? '嘗試調整搜尋關鍵字或清除篩選條件'
                : '開始你的第一個學習實踐！'}
            </p>
            {showCreateButton && (
              <Button onClick={handleCreateClick} className="flex items-center gap-2">
                <Plus className="size-4" />
                開始第一個實踐
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {practices.map((practice) => (
              <PracticeCard
                key={practice.id}
                practice={practice}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCheckIn={handleCheckIn}
                showActions
              />
            ))}

            {/* Load More Info */}
            {practices.length > 0 && (
              <div className="pt-4 text-center">
                <p className="text-sm text-basic-400">
                  顯示
                  {' '}
                  {practices.length}
                  {' '}
                  個實踐活動
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PracticeExploreSection;
