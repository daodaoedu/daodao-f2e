import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/utils/cn';
import { EXPLORE_SUBNAV, EXCHANGE_SUBNAV } from '@/constants/category';
import { FiSearch } from 'react-icons/fi';

interface SubNavProps {
  type: 'explore' | 'exchange';
  onCategorySelect?: (path: string) => void;
}

/**
 * SubNavWithSearch 組件 - 用於在探索和交流頁面內進行子導航，並包含搜索功能
 * @param {Object} props - 組件屬性
 * @param {string} props.type - 導航類型 ('explore' 或 'exchange')
 */
function SubNavWithSearch({ type, onCategorySelect }: SubNavProps) {
  const router = useRouter();
  const currentPath = router.pathname;
  const { category } = router.query;
  const [searchQuery, setSearchQuery] = useState('');

  // 根據類型選擇顯示的導航項目
  const navItems = type === 'explore' ? EXPLORE_SUBNAV : EXCHANGE_SUBNAV;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="bg-white shadow-sm mb-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center py-2">
          {/* 導航項目 */}
          <nav className="flex overflow-x-auto whitespace-nowrap py-1 no-scrollbar mb-3 md:mb-0">
            {navItems.map((item) => {
              // 檢查是否活躍的邏輯：如果是在 explore 頁面，則通過查詢參數確定；否則通過路徑確定
              let isActive = false;

              if (type === 'explore' && currentPath === '/explore' && item.path !== '/explore') {
                // 如果是在探索頁面並且不是「全部」選項，則透過 category 參數確定是否活躍
                isActive = category ? `/${category}` === item.path : false;
              } else {
                // 否則使用標準路徑比較
                isActive = currentPath === item.path;
              }
              return (
                type === 'explore' && item.path !== '/explore' ? (
                  <button
                    type="button"
                    key={item.name}
                    onClick={(e) => {
                      e.preventDefault();
                      if (onCategorySelect) {
                        // 使用 onCategorySelect 單純更新狀態，不跳轉頁面
                        onCategorySelect(item.path);
                      } else {
                        // 如果沒有提供 onCategorySelect，才使用導航跳轉
                        router.push(item.path);
                      }
                    }}
                    className={cn(
                      "inline-block px-4 py-2 font-medium text-base rounded-md transition-colors mr-1",
                      isActive
                        ? "text-primary-base bg-primary-lightest"
                        : "text-gray-600 hover:text-primary-base hover:bg-gray-50"
                    )}
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={cn(
                      "inline-block px-4 py-2 font-medium text-base rounded-md transition-colors mr-1",
                      isActive
                        ? "text-primary-base bg-primary-lightest"
                        : "text-gray-600 hover:text-primary-base hover:bg-gray-50"
                    )}
                  >
                    {item.name}
                  </Link>
                )
              );
            })}
          </nav>

          {/* 搜索框 */}
          <form onSubmit={handleSearch} className="flex w-full md:w-auto">
            <div className="relative flex w-full md:w-64 lg:w-80">
              <input
                type="text"
                placeholder="搜尋學習資源、計畫或揪團..."
                className="bg-gray-100 border-none rounded-full pl-4 pr-10 py-2 w-full focus:ring-2 focus:ring-primary-base focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit" 
                className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-primary-base"
              >
                <FiSearch className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SubNavWithSearch;