import React, { useCallback } from 'react';
import { useRouter } from '@/shared/i18n/navigation';
import {
  Search,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import IdeaCard from './IdeaCard';
import { useIdeaSearch } from '../hooks';

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
  const router = useRouter();
  // Local state
  
  // Hooks
  const {
    ideas,
    searchParams,
    isError,
    updateSearch,
    refresh,
  } = useIdeaSearch();


  // Handlers
  const handleSearch = useCallback((search: string) => {
    updateSearch({ search });
  }, [updateSearch]);

  // const handleEdit = useCallback((ideaId: string) => {
  //   console.log('Edit idea:', ideaId);
  //   // TODO: Navigate to edit page or open edit modal
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
                idea={idea}
                onClick={(id) => {
                  // 導航到詳情頁
                   router.push(`/ideas/${id}`);
                }}
              />
            ))}
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
