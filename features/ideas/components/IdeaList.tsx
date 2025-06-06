import React, { useState, useCallback } from 'react';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import {
  Search,
  Grid,
  List,
  Plus,
  RefreshCw,
  Loader2
} from 'lucide-react';
import IdeaCard from './IdeaCard';
import { useIdeas, useIdeaActions } from '../hooks';
import { useIdeasContext } from '../contexts';
import type { IdeaFilters, IdeaSchema } from '../types';

interface IdeaListProps {
  showCreateButton?: boolean;
  onCreateClick?: () => void;
  className?: string;
}

const IdeaList: React.FC<IdeaListProps> = ({
  showCreateButton = true,
  onCreateClick,
  className = '',
}) => {
  // Context
  const { state: contextState, setFilters, setViewMode, deleteLocalIdea } = useIdeasContext();

  // Hooks
  const {
    ideas,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
    updateParams,
  } = useIdeas({
    initialParams: {
      ...contextState.filters,
      tags: contextState.selectedTags.map((tag) => tag.name),
    },
  });

  const {
    toggleLike,
    shareIdea,
    isDeletingIdea,
    likedIdeas,
  } = useIdeaActions({
    onSuccess: () => {
      refresh();
    },
  });

  // Local state
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Handlers
  const handleSearch = useCallback((search: string) => {
    setFilters({ search });
    updateParams({ search, page: 1 });
  }, [setFilters, updateParams]);

  const handleSortChange = useCallback((sortBy: string) => {
    const [field, order] = sortBy.split(':') as [IdeaFilters['sortBy'], 'asc' | 'desc'];
    setFilters({ sortBy: field, sortOrder: order });
    updateParams({ sortBy: field, sortOrder: order, page: 1 });
  }, [setFilters, updateParams]);

  const handleEdit = useCallback((idea: IdeaSchema) => {
    console.log('Edit idea:', idea.id);
    // TODO: Implement edit functionality
  }, []);

  const handleDelete = useCallback(async (ideaId: string) => {
    setSelectedIdeaId(ideaId);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (selectedIdeaId) {
      try {
        // Remove from local state immediately
        deleteLocalIdea(selectedIdeaId);

        // Also call the delete API (when backend is ready)
        // await deleteIdea(selectedIdeaId);

        setShowDeleteModal(false);
        setSelectedIdeaId(null);

        console.log('Idea deleted successfully:', selectedIdeaId);
      } catch (err) {
        console.error('Failed to delete idea:', err);
        // If delete fails, we might want to add the idea back to local state
      }
    }
  }, [selectedIdeaId, deleteLocalIdea]);

  const handleLike = useCallback(async (ideaId: string) => {
    try {
      await toggleLike(ideaId);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  }, [toggleLike]);

  const handleShare = useCallback(async (ideaId: string) => {
    try {
      const shareUrl = await shareIdea(ideaId);
      // Could show a toast or copy confirmation here
      console.log('Shared idea:', shareUrl);
    } catch (err) {
      console.error('Failed to share idea:', err);
    }
  }, [shareIdea]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMore();
    }
  }, [hasMore, isLoading, loadMore]);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">載入失敗</div>
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          重新載入
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="heading-lg text-primary-darker">想法分享</h2>
          <p className="body-sm text-basic-300 mt-1">
            發現 {ideas.length} 個創新想法
          </p>
        </div>

        {showCreateButton && (
          <Button
            onClick={onCreateClick}
            className="bg-primary-base hover:bg-primary-darker text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            分享想法
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-basic-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-basic-300" />
              <Input
                placeholder="搜尋想法..."
                value={contextState.filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 border-basic-200 hover:border-primary-base focus:border-primary-base"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <Select
              value={`${contextState.filters.sortBy}:${contextState.filters.sortOrder}`}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="border-basic-200 hover:border-primary-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdDate:desc">最新發布</SelectItem>
                <SelectItem value="createdDate:asc">最早發布</SelectItem>
                <SelectItem value="likeCount:desc">最多讚數</SelectItem>
                <SelectItem value="title:asc">標題 A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode */}
          <div className="flex rounded-lg border border-basic-200 overflow-hidden">
            <Button
              variant={contextState.viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none flex-1"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={contextState.viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none flex-1"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Active Tags */}
        {contextState.selectedTags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-basic-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="body-sm text-basic-400">篩選標籤：</span>
              {contextState.selectedTags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-base/10 text-primary-darker border border-primary-base/20"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && ideas.length === 0 && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-base" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && ideas.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-basic-100 flex items-center justify-center">
            <Plus className="h-8 w-8 text-basic-300" />
          </div>
          <h3 className="heading-sm text-basic-500 mb-2">還沒有想法</h3>
          <p className="body-sm text-basic-300 mb-4">
            成為第一個分享創新想法的人！
          </p>
          {showCreateButton && (
            <Button
              onClick={onCreateClick}
              className="bg-primary-base hover:bg-primary-darker text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              分享第一個想法
            </Button>
          )}
        </div>
      )}

      {/* Ideas Grid/List */}
      {ideas.length > 0 && (
        <div className={`
          ${contextState.viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }
        `}
        >
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              data={idea}
              detailLink={`/ideas/detail?ideaId=${idea.id}`}
              onEditClick={() => handleEdit(idea)}
              onDeleteClick={() => handleDelete(idea.id)}
              onLikeClick={() => handleLike(idea.id)}
              onShareClick={() => handleShare(idea.id)}
              isLiked={likedIdeas.has(idea.id)}
              className={contextState.viewMode === 'list' ? 'max-w-none' : ''}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleLoadMore}
            disabled={isLoading}
            variant="outline"
            className="border-primary-base text-primary-base hover:bg-primary-base hover:text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                載入中...
              </>
            ) : (
              '載入更多'
            )}
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="heading-sm text-basic-black mb-4">確認刪除</h3>
            <p className="body-sm text-basic-500 mb-6">
              確定要刪除這個想法嗎？此操作無法撤銷。
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedIdeaId(null);
                }}
                disabled={isDeletingIdea}
              >
                取消
              </Button>
              <Button
                variant="alert"
                onClick={confirmDelete}
                disabled={isDeletingIdea}
              >
                {isDeletingIdea ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    刪除中...
                  </>
                ) : (
                  '確認刪除'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeaList;
