import { useEffect, useMemo, useRef, useState } from 'react';
import useThrottle from '@/hooks/useThrottle';
import ArrowIcon from '@/public/assets/icons/arrow.svg';
import { isServer } from '@/utils/helper';
import { cn } from '@/utils/cn';

const useCarouselTouch = (onNext: () => void, onPrev: () => void) => {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (!touchStartX) return;
    const touchMoveX = e.touches[0].clientX;
    const deltaX = touchMoveX - touchStartX;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX < 0) {
        onNext();
      } else {
        onPrev();
      }
      setTouchStartX(null); // 避免多次觸發
    }
  };

  const handleTouchEnd = () => {
    setTouchStartX(null);
  };

  return { handleTouchStart, handleTouchMove, handleTouchEnd };
};

interface CarouselProps<T> {
  title: string;
  titleId: string;
  items: T[];
  renderKey: (item: T) => React.Key;
  renderItem: (item: T) => React.ReactNode;
}

export default function Carousel<T>({
  title,
  titleId,
  items,
  renderKey,
  renderItem,
}: CarouselProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemWidths, setItemWidths] = useState<number[]>([]);
  const cachedItems = useRef<T[]>([]);
  const wrapperRef = useRef<HTMLUListElement>(null);
  const throttle = useThrottle(300);

  const { slideOffset, isLastSlide } = useMemo(() => {
    if (isServer) return { slideOffset: 0, isLastSlide: false };

    const scrollWidth = wrapperRef.current?.scrollWidth ?? 0;
    const wrapperWidth = wrapperRef.current?.clientWidth ?? 0;
    const currentOffset = itemWidths
      .slice(0, currentIndex)
      .reduce((acc, curr) => acc + curr, 0);

    if (wrapperWidth + currentOffset > scrollWidth) {
      return {
        slideOffset: scrollWidth - wrapperWidth + 16,
        isLastSlide: true,
      };
    }

    return {
      slideOffset: currentOffset,
      isLastSlide: false,
    };
  }, [currentIndex, itemWidths]);

  const handleNext = () => {
    throttle(() => {
      if (!isLastSlide) {
        setCurrentIndex((prev) => prev + 1);
      }
    });
  };

  const handlePrev = () => {
    throttle(() => {
      if (currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      handlePrev();
    }
  };

  const { handleTouchStart, handleTouchMove, handleTouchEnd } =
    useCarouselTouch(handleNext, handlePrev);

  useEffect(() => {
    const wrapperElement = wrapperRef.current;

    if (!wrapperElement) return;
    if (cachedItems.current === items) return;

    setItemWidths(
      Array.from(wrapperElement.children).map((item) => item.clientWidth)
    );
    cachedItems.current = items;
  }, [items]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={title}
      onKeyDown={handleKeyDown}
    >
      <div className="px-6 lg:px-60 flex justify-between items-center">
        <h2 className="heading-md text-basic-500" id={titleId}>
          {title}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center rotate-180',
              currentIndex === 0
                ? 'bg-basic-100 text-basic-300'
                : 'bg-white border border-primary-lightest text-primary-base'
            )}
            onClick={handlePrev}
          >
            <ArrowIcon />
          </button>
          <button
            type="button"
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center ',
              isLastSlide
                ? 'bg-basic-100 text-basic-300'
                : 'bg-white border border-primary-lightest text-primary-base'
            )}
            onClick={handleNext}
          >
            <ArrowIcon />
          </button>
        </div>
      </div>
      <div
        className="mt-9 overflow-x-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-live="polite"
      >
        <ul
          ref={wrapperRef}
          className="flex gap-4 px-6 lg:pl-60 transition-transform duration-300"
          style={{ transform: `translateX(-${slideOffset}px)` }}
        >
          {items.map((item, index) => (
            <li key={renderKey(item)} aria-current={currentIndex === index}>
              {renderItem(item)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
