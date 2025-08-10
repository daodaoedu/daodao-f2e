import React, { useState, useCallback } from 'react';
import {
  Search, Plus, Lightbulb, SortAsc, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { IdeaSearchParamsSchema } from '@/services/ideas';
import IdeaCard from './IdeaCard';
import { useIdeas } from '../hooks';

interface IdeasExploreSectionProps {
  className?: string;
  showHeader?: boolean;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
}

const IdeasExploreSection: React.FC<IdeasExploreSectionProps> = ({
  className = '',
  showHeader = true,
  showCreateButton = true,
  onCreateClick,
}) => {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'createdDate' | 'updatedDate' | 'likeCount'>('createdDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Build search parameters
  const searchParams: IdeaSearchParamsSchema = {
    search: searchQuery || undefined,
    sortBy,
    sortOrder,
  };

  // Use Ideas hook to fetch data
  const {
    ideas,
    pagination,
    isLoading,
    isError,
    error,
    refresh,
    isEmpty,
  } = useIdeas(searchParams);

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
      window.location.href = '/ideas/create';
    }
  };

  // Sort options
  const sortOptions = [
    { label: '最新發布', sortBy: 'createdDate' as const, sortOrder: 'desc' as const },
    { label: '最舊發布', sortBy: 'createdDate' as const, sortOrder: 'asc' as const },
    { label: '最近更新', sortBy: 'updatedDate' as const, sortOrder: 'desc' as const },
    { label: '最多按讚', sortBy: 'likeCount' as const, sortOrder: 'desc' as const },
  ];

  const getCurrentSortLabel = () => {
    const current = sortOptions.find((opt) => opt.sortBy === sortBy && opt.sortOrder === sortOrder);
    return current?.label || '最新發布';
  };

  if (isError) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <Lightbulb className="w-12 h-12 text-basic-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-basic-600 mb-2">載入失敗</h3>
            <p className="text-basic-400 mb-4">
              {error?.message || '無法載入想法內容，請稍後再試'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refresh()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
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
              <Lightbulb className="w-5 h-5 text-primary-base" />
              探索想法
              {pagination && (
                <span className="text-sm font-normal text-basic-400">
                  (
                  {pagination.totalCount}
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
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">分享想法</span>
              </Button>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent className="space-y-4">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-basic-400 w-4 h-4" />
            <Input
              placeholder="搜尋想法內容、標籤..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <SortAsc className="w-4 h-4" />
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
              onClick={() => refresh()}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Ideas Content */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={`idea-skeleton-${Date.now()}-${index}`} className="animate-pulse">
                <div className="bg-basic-100 rounded-lg h-32" />
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <div className="text-center py-12">
            <Lightbulb className="w-16 h-16 text-basic-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-basic-600 mb-2">
              {searchQuery ? '找不到相關想法' : '還沒有想法'}
            </h3>
            <p className="text-basic-400 mb-6">
              {searchQuery
                ? '嘗試調整搜尋關鍵字或清除篩選條件'
                : '成為第一個分享想法的人！'}
            </p>
            {showCreateButton && (
              <Button onClick={handleCreateClick} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                分享第一個想法
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                data={idea}
                className="border border-basic-200 hover:border-basic-300 transition-colors"
                showActions
              />
            ))}

            {/* Load More or Pagination Info */}
            {pagination && pagination.hasNext && (
              <div className="text-center pt-4">
                <p className="text-sm text-basic-400">
                  顯示
                  {' '}
                  {ideas.length}
                  {' '}
                  /
                  {' '}
                  {pagination.totalCount}
                  {' '}
                  個想法
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IdeasExploreSection;
