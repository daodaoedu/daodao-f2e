import { useEffect, useMemo, useRef, useState } from 'react';
import useThrottle from '@/hooks/useThrottle';
import ArrowIcon from '@/public/assets/icons/arrow.svg';
import { isServer } from '@/utils/helper';
import { cn } from '@/utils/cn';

type PointerEventType =
  | React.TouchEvent<HTMLDivElement>
  | React.MouseEvent<HTMLDivElement>;

const useCarouselPointer = (onNext: () => void, onPrev: () => void) => {
  const [startX, setStartX] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const handlePointStart = (e: PointerEventType) => {
    if ('touches' in e) {
      setStartX(e.touches[0].clientX);
    } else {
      setStartX(e.clientX);
    }
  };

  const handlePointMove = (e: PointerEventType) => {
    if (!startX) return;

    let currentX: number;
    if ('touches' in e) {
      currentX = e.touches[0].clientX;
    } else {
      currentX = e.clientX;
    }

    const deltaX = currentX - startX;

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX < 0) {
        onNext();
      } else {
        onPrev();
      }
      setStartX(null); // 避免多次觸發
    }
  };

  const handlePointEnd = () => {
    setStartX(null);
  };

  return { handlePointStart, handlePointMove, handlePointEnd };
};

interface CarouselProps<T> {
  title: string;
  titleId?: string;
  items: T[];
  titleClassName?: string;
  headerClassName?: string;
  wrapperClassName?: string;
  renderKey: (item: T) => React.Key;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export default function Carousel<T>({
  title,
  titleId,
  items,
  titleClassName,
  headerClassName,
  wrapperClassName,
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

  const { handlePointStart, handlePointMove, handlePointEnd } =
    useCarouselPointer(handleNext, handlePrev);

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
    <div>
      <div className={cn('flex justify-between items-center', headerClassName)}>
        <h2
          className={cn('heading-md text-basic-500', titleClassName)}
          id={titleId}
        >
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
        role="region"
        aria-roledescription="carousel"
        aria-label={title}
        className="mt-9 overflow-x-hidden select-none"
        onKeyDown={handleKeyDown}
        onMouseDown={handlePointStart}
        onMouseMove={handlePointMove}
        onMouseUp={handlePointEnd}
        onTouchStart={handlePointStart}
        onTouchMove={handlePointMove}
        onTouchEnd={handlePointEnd}
        aria-live="polite"
      >
        <ul
          ref={wrapperRef}
          className={cn(
            'flex gap-4 transition-transform duration-300',
            wrapperClassName
          )}
          style={{ transform: `translateX(-${slideOffset}px)` }}
        >
          {items.map((item, index) => (
            <li key={renderKey(item)} aria-current={currentIndex === index}>
              {renderItem(item, index)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
