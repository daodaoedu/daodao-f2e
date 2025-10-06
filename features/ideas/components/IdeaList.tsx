import React, { useState, useCallback } from 'react';
import {
  Search,
  Plus,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import IdeaCard from './IdeaCard';
import { useIdeaSearch, useIdeaActions, useIdeasCache } from '../hooks';

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
  // Local state
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Hooks
  const {
    ideas,
    searchParams,
    isError,
    updateSearch,
    refresh,
  } = useIdeaSearch();

  const { removeIdeaFromCache, updateIdeaInCache } = useIdeasCache();

  const { deleteIdea, isDeleting } = useIdeaActions({
    onSuccess: () => {
      if (selectedIdeaId) {
        removeIdeaFromCache(selectedIdeaId);
        setShowDeleteModal(false);
        setSelectedIdeaId(null);
      }
    },
    onError: (error) => {
      console.error('Failed to delete idea:', error);
    },
  });

  // Handlers
  const handleSearch = useCallback((search: string) => {
    updateSearch({ search });
  }, [updateSearch]);

  const handleEdit = useCallback((ideaId: string) => {
    console.log('Edit idea:', ideaId);
    // TODO: Navigate to edit page or open edit modal
  }, []);

  const handleDeleteClick = useCallback((ideaId: string) => {
    setSelectedIdeaId(ideaId);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (selectedIdeaId) {
      await deleteIdea(selectedIdeaId);
    }
  }, [selectedIdeaId, deleteIdea]);

  const handleLike = useCallback((ideaId: string) => {
    // Optimistically update the UI
    const idea = ideas.find((i) => i.id === ideaId);
    if (idea) {
      const updatedIdea = {
        ...idea,
        isLiked: !idea.isLiked,
        likeCount: idea.isLiked ? idea.likeCount - 1 : idea.likeCount + 1,
      };
      updateIdeaInCache(updatedIdea);
    }

    // TODO: Call actual like API
    console.log('Toggle like for idea:', ideaId);
  }, [ideas, updateIdeaInCache]);

  // const handleShare = useCallback((ideaId: string) => {
  //   const shareUrl = `${window.location.origin}/ideas/${ideaId}`;
  //   navigator.clipboard.writeText(shareUrl);
  //   console.log('Shared idea URL:', shareUrl);
  //   // TODO: Show toast notification
  // }, []);

  if (isError) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-red-500">載入失敗</div>
        <Button onClick={() => refresh()} variant="outline">
          <RefreshCw className="mr-2 size-4" />
          重新載入
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-6 ${className}`}>
        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-basic-300" />
              <Input
                placeholder="搜尋想法..."
                value={searchParams.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full  bg-white pl-10 hover:border-primary-base focus:border-primary-base"
              />
            </div>
          </div>

          {/* 桌機版分享想法按鈕 */}
          {showCreateButton && (
            <div className="hidden shrink-0 md:block">
              <Button
                onClick={onCreateClick}
                className="flex items-center gap-2 whitespace-nowrap rounded-full bg-primary-base px-6 py-2 text-white transition-colors hover:bg-primary-darker"
              >
                <Plus className="size-4" />
                分享想法
              </Button>
            </div>
          )}
        </div>

        {/* Ideas List */}
        {ideas.length > 0 && (
          <div className="space-y-4">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                data={idea}
                detailLink={`/ideas/${idea.id}`}
                onEditClick={() => handleEdit(idea.id)}
                onDeleteClick={() => handleDeleteClick(idea.id)}
                onLikeClick={() => handleLike(idea.id)}
                isLiked={idea.isLiked}
              />
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-basic-black">確認刪除</h3>
              <p className="mb-6 text-sm text-basic-500">
                確定要刪除這個想法嗎？此操作無法撤銷。
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedIdeaId(null);
                  }}
                  disabled={isDeleting}
                >
                  取消
                </Button>
                <Button
                  variant="alert"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
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

      {/* 浮動創建按鈕 - 只在手機版顯示 */}
      {showCreateButton && (
        <Button
          onClick={onCreateClick}
          className="
            group
            fixed bottom-6 right-6 z-40
            flex size-14
            items-center justify-center
            rounded-full
            bg-primary-base
            text-white shadow-lg
            transition-all duration-300 ease-in-out
            hover:scale-110 hover:bg-primary-darker hover:shadow-xl
            focus:outline-none focus:ring-4 focus:ring-primary-base/30
            active:scale-95
            md:hidden
          "
          aria-label="分享想法"
        >
          <Plus className="size-6 transition-transform duration-300 group-hover:rotate-90" />

          {/* 懸停提示文字 */}
          <span className="
            pointer-events-none absolute right-full mr-3 whitespace-nowrap
            rounded-lg bg-gray-900 px-3 py-2
            text-sm text-white
            opacity-0 transition-opacity
            duration-300
            before:absolute
            before:left-full before:top-1/2 before:-translate-y-1/2
            before:border-4 before:border-transparent
            before:border-l-gray-900 before:content-[''] group-hover:opacity-100
          "
          >
            分享想法
          </span>
        </Button>
      )}
    </>
  );
};

export default IdeaList;
