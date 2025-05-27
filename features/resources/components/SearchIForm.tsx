import { useCallback, useRef } from 'react';
import LensIcon from '@/public/assets/icons/lens.svg';
import useShadowToggleOnScroll from '@/hooks/useShadowToggleOnScroll';
import { cn } from '@/utils/cn';
import Button from '@/shared/components/Button';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';
import useDebounce from '@/hooks/useDebounce';

export default function SearchForm() {
  const { height, isShowShadow, TriggerElement } = useShadowToggleOnScroll();
  const [, pushState] = useSearchParamsManager();

  const updateSearchQuery = useCallback(
    (value: string) => {
      pushState('q', value);
    },
    [pushState]
  );

  const debouncedUpdateSearch = useDebounce(updateSearchQuery, 500);

  const inputRef = useRef<HTMLInputElement>(null);

  const onClickFocus = () => {
    inputRef.current?.focus();
  };

  return (
    <>
      <TriggerElement />
      <div
        className={cn(
          'sticky z-20 flex justify-between bg-basic-white py-5 px-5 gap-6 flex-col md:flex-row md:py-6 md:px-24',
          isShowShadow && 'shadow-md shadow-basic-black/10'
        )}
        style={{ top: `${height}px` }}
      >
        <div className="basis-1/2 relative">
          <LensIcon
            className="absolute top-[0.625rem] left-4"
            onClick={onClickFocus}
          />
          <input
            ref={inputRef}
            type="search"
            placeholder="想找什麼資源..."
            className="h-10 w-full rounded-lg border-[#DBDBDB] border flex items-center justify-center p-[0_1rem_0_2.75rem]"
            onChange={(e) => debouncedUpdateSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" size="sm" color="primary">
            篩選
          </Button>
          <Button variant="outline" size="sm" color="primary">
            最熱門
          </Button>
        </div>
      </div>
    </>
  );
}
