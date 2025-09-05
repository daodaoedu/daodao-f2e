'use client';

import Image from 'next/image';
import { useEffect, useRef, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { SectionHeader } from '@/app/[language]/(BaseLayout)/SectionHeader';
import { FunctionCard } from './FunctionCard';
import './Functions.css';

interface FunctionCarouselProps {
  className?: string;
}

export function FunctionCarousel({ className }: FunctionCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const getStep = useCallback(() => {
    if (!trackRef.current) return 0;
    const first = trackRef.current.querySelector('.functions-cards-item');
    if (!first) return 0;
    const rectW = first.getBoundingClientRect().width;
    const styles = getComputedStyle(trackRef.current);
    const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
    return rectW + gap;
  }, []);

  const maxIndex = useCallback(() => {
    if (!trackRef.current) return 0;
    const step = getStep();
    if (!step) return 0;
    const totalScrollable = trackRef.current.scrollWidth - trackRef.current.clientWidth;
    return Math.max(0, Math.floor(totalScrollable / step));
  }, [getStep]);

  const enableNoSnap = useCallback(() => {
    if (trackRef.current) {
      trackRef.current.style.scrollSnapType = 'none';
    }
  }, []);

  const disableNoSnap = useCallback(() => {
    if (trackRef.current) {
      trackRef.current.style.scrollSnapType = '';
    }
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    if (!trackRef.current) return;
    const step = getStep();
    const maxIdx = maxIndex();
    const targetIndex = Math.max(0, Math.min(maxIdx, index));
    const targetLeft = targetIndex * step;
    
    // 確保不會滾動超出實際範圍
    const maxScrollLeft = trackRef.current.scrollWidth - trackRef.current.clientWidth;
    const finalLeft = Math.min(targetLeft, maxScrollLeft);
    
    trackRef.current.scrollTo({ left: finalLeft, behavior: 'smooth' });
  }, [getStep, maxIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    // 避免圖片被原生拖走或選取
    const images = track.querySelectorAll('img');
    images.forEach((img) => {
      const imgElement = img as HTMLImageElement;
      imgElement.draggable = false;
      imgElement.style.userSelect = 'none';
      (imgElement.style as unknown as Record<string, string>).webkitUserDrag = 'none';
    });

    let dragging = false;
    let startX = 0;
    let startLeft = 0;
    let pointerId: number | null = null;
    let movedPx = 0;

    const onPointerDown = (e: PointerEvent) => {
      // 只處理左鍵或觸控/手寫筆
      if (e.pointerType === 'mouse' && (e as MouseEvent).button !== 0) return;
      if (pointerId !== null) return;

      pointerId = e.pointerId;
      track.setPointerCapture(pointerId);

      dragging = true;
      movedPx = 0;
      startX = e.clientX;
      startLeft = track.scrollLeft;

      // 計算起始索引（用於後續計算）
      getStep();

      enableNoSnap();
      track.classList.add('dragging');
      document.body.style.userSelect = 'none';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return;
      const dx = e.clientX - startX;
      const currentMovedPx = Math.abs(dx);

      if (currentMovedPx > 5) {
        track.scrollLeft = startLeft - dx;
        movedPx = currentMovedPx;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      track.releasePointerCapture(e.pointerId);

      if (!dragging) return;
      dragging = false;

      const step = getStep();
      if (step && movedPx > 5) {
        const currentLeft = track.scrollLeft;
        const currentIndex = Math.round(currentLeft / step);
        scrollToIndex(currentIndex);
      }

      disableNoSnap();
      track.classList.remove('dragging');
      document.body.style.userSelect = '';
    };

    const onPointerCancel = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      track.releasePointerCapture(e.pointerId);

      dragging = false;
      disableNoSnap();
      track.classList.remove('dragging');
      document.body.style.userSelect = '';
    };

    const onLostCapture = () => {
      pointerId = null;
      dragging = false;
      disableNoSnap();
      track.classList.remove('dragging');
      document.body.style.userSelect = '';
    };

    const swallowClickIfDragged = (e: Event) => {
      if (movedPx > 5) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    track.addEventListener('pointerdown', onPointerDown);
    track.addEventListener('pointermove', onPointerMove);
    track.addEventListener('pointerup', onPointerUp);
    track.addEventListener('pointercancel', onPointerCancel);
    track.addEventListener('lostpointercapture', onLostCapture);
    track.addEventListener('click', swallowClickIfDragged, true);

    return () => {
      track.removeEventListener('pointerdown', onPointerDown);
      track.removeEventListener('pointermove', onPointerMove);
      track.removeEventListener('pointerup', onPointerUp);
      track.removeEventListener('pointercancel', onPointerCancel);
      track.removeEventListener('lostpointercapture', onLostCapture);
      track.removeEventListener('click', swallowClickIfDragged, true);
    };
  }, [getStep, maxIndex, enableNoSnap, disableNoSnap, scrollToIndex]);

  const functions = [
    {
      tag: '想法',
      title: '分享學習洞察',
      description: '捕捉並分享受到啟發的時刻。在這裡，每個想法都可能點亮別人的學習之路。',
      imageUrl: 'https://picsum.photos/200/300?grayscale',
      action: '馬上開始',
    },
    {
      tag: '主題實踐',
      title: '輕鬆開始學習探索',
      description: '用 7-30 天的時間嘗試新主題，發現你的興趣。定時打卡，紀錄軌跡和心得！',
      imageUrl: 'https://picsum.photos/200/300?grayscale',
      action: '馬上開始',
    },
    {
      tag: '學習計劃',
      title: '打造你的學習基地',
      description: '為重要目標建立完整的學習計劃。設定目標、追蹤進度、累積成長！',
      imageUrl: 'https://picsum.photos/200/300?grayscale',
      action: '馬上開始',
    },
    {
      tag: '資源',
      title: '發現與分享學習資源',
      description: '探索社群推薦的優質學習資源，分享你用過的好內容，並留下真實使用心得。',
      imageUrl: 'https://picsum.photos/200/300?grayscale',
      action: '馬上開始',
    },
  ];

  return (
    <section className={cn('relative pb-15 overflow-x-clip flex flex-col items-center justify-center bg-cyan-50', className)} id="functions">
      <div className="text-teal-800 py-15 px-6 pb-10">
        <SectionHeader
          title="學習群島上的功能生態"
          variant="dark"
          size="md"
          alignment="center"
          showSubtitle={false}
          className="text-teal-800"
        />
      </div>
      
      <div className="max-w-full pl-6">
        <div 
          ref={trackRef}
          className="grid grid-flow-col auto-cols-70 gap-4 overflow-x-auto p-2 scroll-smooth scroll-snap-type-x-mandatory touch-pan-x scrollbar-hide"
        >
          {functions.map((func) => (
            <FunctionCard
              key={func.title}
              tag={func.tag}
              title={func.title}
              description={func.description}
              imageUrl={func.imageUrl}
              action={func.action}
            />
          ))}
        </div>
      </div>
      
      {/* 底部裝飾圖片 */}
      <picture className="w-full">
        <source media="(max-width: 767.98px)" srcSet="/assets/landing-page/ribbon-mobile.svg" />
        <Image 
          src="/assets/landing-page/ribbon-desktop.svg" 
          alt="功能生態裝飾" 
          width={1200}
          height={200}
          className="w-full" 
          priority={false}
        />
      </picture>
    </section>
  );
}
