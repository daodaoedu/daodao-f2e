import React, { useState, useCallback } from 'react';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import {
  Search,
  Plus,
  RefreshCw,
  Loader2
} from 'lucide-react';
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
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">載入失敗</div>
        <Button onClick={() => refresh()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-basic-300 " />
              <Input
                placeholder="搜尋想法..."
                value={searchParams.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10  hover:border-primary-base focus:border-primary-base bg-white w-full"
              />
            </div>
          </div>

          {/* 桌機版分享想法按鈕 */}
          {showCreateButton && (
            <div className="hidden md:block flex-shrink-0">
              <Button
                onClick={onCreateClick}
                className="flex items-center gap-2 bg-primary-base hover:bg-primary-darker text-white px-6 py-2 rounded-full transition-colors whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-basic-black mb-4">確認刪除</h3>
              <p className="text-sm text-basic-500 mb-6">
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

      {/* 浮動創建按鈕 - 只在手機版顯示 */}
      {showCreateButton && (
        <Button
          onClick={onCreateClick}
          className="
            md:hidden
            fixed bottom-6 right-6 z-40
            w-14 h-14
            bg-primary-base hover:bg-primary-darker
            text-white
            rounded-full
            shadow-lg hover:shadow-xl
            transition-all duration-300 ease-in-out
            transform hover:scale-110 active:scale-95
            flex items-center justify-center
            group
            focus:outline-none focus:ring-4 focus:ring-primary-base/30
          "
          aria-label="分享想法"
        >
          <Plus className="h-6 w-6 transition-transform group-hover:rotate-90 duration-300" />

          {/* 懸停提示文字 */}
          <span className="
            absolute right-full mr-3 px-3 py-2
            bg-gray-900 text-white text-sm rounded-lg
            opacity-0 group-hover:opacity-100
            transition-opacity duration-300
            whitespace-nowrap
            pointer-events-none
            before:content-[''] before:absolute before:left-full
            before:top-1/2 before:-translate-y-1/2
            before:border-4 before:border-transparent before:border-l-gray-900
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
