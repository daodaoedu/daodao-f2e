import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/atoms/button';
import { cn } from '@/utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';

interface CategoryChipProps {
  label: string;
  value: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  value,
  isActive,
  onClick,
  className = '',
}) => {
  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size="sm"
      value={value}
      onClick={onClick}
      className={cn(
        'whitespace-nowrap h-8 px-4 text-sm font-medium rounded-full border transition-all duration-200',
        isActive
          ? 'bg-primary-base text-white border-primary-base hover:bg-primary-darker'
          : 'bg-white text-basic-500 border-basic-200 hover:border-primary-base hover:text-primary-base',
        className
      )}
    >
      {label}
    </Button>
  );
};

interface ScrollButtonProps {
  direction: 'left' | 'right';
  show: boolean;
  onClick: () => void;
}

const ScrollButton: React.FC<ScrollButtonProps> = ({ direction, show, onClick }) => {
  if (!show) return null;

  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  const positionClass = direction === 'left'
    ? 'left-0 bg-gradient-to-r from-white to-transparent'
    : 'right-0 bg-gradient-to-l from-white to-transparent';

  return (
    <div className={cn('absolute top-0 bottom-0 w-8 flex items-center z-10', positionClass)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className="h-8 w-8 p-0 bg-white shadow-sm border border-basic-200 hover:bg-basic-100"
      >
        <Icon className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Ideas 的標籤分類定義
const IDEA_CATEGORIES = [
  { key: 'tech', value: 'tech', label: '技術' },
  { key: 'design', value: 'design', label: '設計' },
  { key: 'business', value: 'business', label: '商業' },
  { key: 'education', value: 'education', label: '教育' },
  { key: 'life', value: 'life', label: '生活' },
  { key: 'creativity', value: 'creativity', label: '創意' },
  { key: 'productivity', value: 'productivity', label: '效率' },
  { key: 'health', value: 'health', label: '健康' },
  { key: 'career', value: 'career', label: '職涯' },
  { key: 'other', value: 'other', label: '其他' },
];

interface SelectedCategoryProps {
  className?: string;
}

const SelectedCategory: React.FC<SelectedCategoryProps> = ({ className = '' }) => {
  const categoryListRef = useRef<HTMLUListElement>(null);
  const [getSearchParams, pushState] = useSearchParamsManager();
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);

  const currentCategories = useMemo(
    () => getSearchParams('category') || [],
    [getSearchParams]
  );

  const handleCategoryClick = useCallback((categoryLabel: string) => {
    const hasCategory = currentCategories.includes(categoryLabel);
    const categories = hasCategory
      ? currentCategories.filter((category: string) => category !== categoryLabel)
      : [...currentCategories, categoryLabel];

    pushState('category', categories.length > 0 ? categories.join(',') : '');
  }, [pushState, currentCategories]);

  const handleAllClick = useCallback(() => {
    pushState('category', '');
  }, [pushState]);

  const updateScrollButtonVisibility = useCallback(() => {
    if (!categoryListRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = categoryListRef.current;
    const isStart = Math.floor(scrollLeft) <= 0;
    const isEnd = Math.ceil(scrollLeft + clientWidth) >= scrollWidth;

    setShowLeftButton(!isStart);
    setShowRightButton(!isEnd);
  }, []);

  const resetScrollButtonVisibility = useCallback(() => {
    setShowLeftButton(false);
    setShowRightButton(false);
  }, []);

  const scrollHandler = useCallback((direction: 'left' | 'right') => {
    if (!categoryListRef.current) return;

    const delta = categoryListRef.current.offsetWidth + 100;
    const scrollAmount = direction === 'left' ? -delta : delta;

    categoryListRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  }, []);

  return (
    <div className={cn('flex items-center space-x-5', className)}>
      <div className="flex-shrink-0">
        <span className="body-sm font-semibold text-basic-500">想法領域</span>
      </div>

      <div
        className="relative flex-1 max-w-[calc(100%-96px)]"
        onMouseEnter={updateScrollButtonVisibility}
        onMouseLeave={resetScrollButtonVisibility}
        onFocus={updateScrollButtonVisibility}
        onBlur={resetScrollButtonVisibility}
      >
        <ScrollButton
          direction="left"
          show={showLeftButton}
          onClick={() => scrollHandler('left')}
        />

        <ul
          ref={categoryListRef}
          className="flex space-x-2 overflow-x-auto scrollbar-hide scroll-smooth py-1"
          onScroll={updateScrollButtonVisibility}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <li className="flex-shrink-0">
            <CategoryChip
              label="全部"
              value="all"
              isActive={currentCategories.length === 0}
              onClick={handleAllClick}
            />
          </li>

          {IDEA_CATEGORIES.map(({ key, value, label }) => (
            <li key={key} className="flex-shrink-0">
              <CategoryChip
                label={label}
                value={value}
                isActive={currentCategories.includes(label)}
                onClick={() => handleCategoryClick(label)}
              />
            </li>
          ))}
        </ul>

        <ScrollButton
          direction="right"
          show={showRightButton}
          onClick={() => scrollHandler('right')}
        />
      </div>
    </div>
  );
};

export default SelectedCategory;
export { IDEA_CATEGORIES };
export type { SelectedCategoryProps };
