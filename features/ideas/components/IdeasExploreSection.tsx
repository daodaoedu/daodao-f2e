'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Search, Plus, Lightbulb, SortAsc, RefreshCw,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Card, CardContent,
} from '@/shared/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import type { IdeaSearchParamsSchema } from '@/services/ideas';
import { useRouter } from 'next/navigation';
import { IdeaCard } from '@/entities/idea';
import { useIdeas } from '../hooks';

interface IdeasExploreSectionProps {
  className?: string;
  showHeader?: boolean;
  showCreateButton?: boolean;
  showSearchBar?: boolean;
  onCreateClick?: () => void;
}

const IdeasExploreSection: React.FC<IdeasExploreSectionProps> = ({
  className = '',
  showHeader = true,
  showCreateButton = true,
  showSearchBar = true,
  onCreateClick,
}) => {
  const router = useRouter();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'createdDate' | 'updatedDate' | 'likeCount'>('createdDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Build search parameters
  const searchParams: IdeaSearchParamsSchema = {
    search: searchQuery || undefined,
    sortBy,
    sortOrder,
    page: 1,
    pageSize: 20,
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
            <Lightbulb className="mx-auto mb-4 size-12 text-basic-200" />
            <h3 className="text-basic-600 mb-2 text-lg font-medium">載入失敗</h3>
            <p className="mb-4 text-basic-400">
              {error?.message || '無法載入想法內容，請稍後再試'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refresh()}
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
    <div className={`w-full ${className}`}>
      {showHeader && (
        <div className="pb-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Lightbulb className="size-5 text-primary-base" />
              探索想法
              {pagination && (
                <span className="text-sm font-normal text-basic-400">
                  (
                  {pagination.totalCount}
                  )
                </span>
              )}
            </h2>
            {showCreateButton && (
              onCreateClick ? (
                <Button
                  size="sm"
                  onClick={onCreateClick}
                  className="flex items-center gap-2"
                >
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">分享想法</span>
                </Button>
              ) : (
                <Link href="/ideas/create">
                  <Button
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="size-4" />
                    <span className="hidden sm:inline">分享想法</span>
                  </Button>
                </Link>
              )
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Search and Filter Bar */}
        {showSearchBar && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-basic-400" />
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
                onClick={() => refresh()}
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        )}

        {/* Ideas Content */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, index) => (
              <Card
                key={`idea-skeleton-${Date.now()}-${index}`}
                className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-3xl mx-auto bg-basic-white rounded-2xl shadow-sm border border-basic-200 animate-pulse"
              >
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="h-32 bg-basic-100 rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isEmpty ? (
          <div className="py-12 text-center">
            <Lightbulb className="mx-auto mb-4 size-16 text-basic-200" />
            <h3 className="text-basic-600 mb-2 text-lg font-medium">
              {searchQuery ? '找不到相關想法' : '還沒有想法'}
            </h3>
            <p className="mb-6 text-basic-400">
              {searchQuery
                ? '嘗試調整搜尋關鍵字或清除篩選條件'
                : '成為第一個分享想法的人！'}
            </p>
            {showCreateButton && (
              onCreateClick ? (
                <Button onClick={onCreateClick} className="flex items-center gap-2">
                  <Plus className="size-4" />
                  分享第一個想法
                </Button>
              ) : (
                <Link href="/ideas/create">
                  <Button className="flex items-center gap-2">
                    <Plus className="size-4" />
                    分享第一個想法
                  </Button>
                </Link>
              )
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onClick={(id) => router.push(`/ideas/${id}`)}
              />
            ))}

            {/* Load More or Pagination Info */}
            {pagination && pagination.hasNext && (
              <div className="pt-4 text-center">
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
      </div>
    </div>
  );
};

export default IdeasExploreSection;
