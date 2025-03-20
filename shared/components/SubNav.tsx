import { useRouter } from 'next/router';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import { EXPLORE_SUBNAV, EXCHANGE_SUBNAV } from '@/constants/category';

interface SubNavProps {
  type: 'explore' | 'exchange';
  onCategorySelect?: (path: string) => void;
}

/**
 * SubNav 組件 - 用於在探索和交流頁面內進行子導航
 * @param {Object} props - 組件屬性
 * @param {string} props.type - 導航類型 ('explore' 或 'exchange')
 */
function SubNav({ type, onCategorySelect }: SubNavProps) {
  const router = useRouter();
  const currentPath = router.pathname;
  const { category } = router.query;

  // 根據類型選擇顯示的導航項目
  const navItems = type === 'explore' ? EXPLORE_SUBNAV : EXCHANGE_SUBNAV;

  return (
    <div className="bg-white shadow-sm mb-6">
      <div className="container mx-auto px-4">
        <nav className="flex overflow-x-auto whitespace-nowrap py-1 no-scrollbar">
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
                    "inline-block px-5 py-3 font-medium text-base rounded-md transition-colors",
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
                    "inline-block px-5 py-3 font-medium text-base rounded-md transition-colors",
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
      </div>
    </div>
  );
}

export default SubNav;
