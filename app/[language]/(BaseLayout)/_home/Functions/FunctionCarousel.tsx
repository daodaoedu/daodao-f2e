'use client';

import Image from 'next/image';
import { useEffect, useRef, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { SectionHeader } from '@/app/[language]/(BaseLayout)/SectionHeader';
import { FunctionCard } from './FunctionCard';

interface FunctionCarouselProps {
  className?: string;
}

export function FunctionCarousel({ className }: FunctionCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const getStep = useCallback(() => {
    if (!trackRef.current) return 0;
    // 使用更通用的選擇器來找到卡片元素
    const first = trackRef.current.querySelector('[data-function-card]') || trackRef.current.firstElementChild;
    if (!first) return 0;
    const rectW = first.getBoundingClientRect().width;
    const styles = getComputedStyle(trackRef.current);
    const gap = parseFloat(styles.gap || '0') || 16; // 預設 gap 為 16px (gap-4)
    return rectW + gap;
  }, []);

  const maxIndex = useCallback(() => {
    if (!trackRef.current) return 0;
    const step = getStep();
    if (!step) return 0;
    // 計算總卡片數量（減去1因為索引從0開始）
    const totalCards = trackRef.current.children.length;
    return Math.max(0, totalCards - 1);
  }, []);

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
    
    // 計算讓卡片居中所需的滾動位置
    const containerWidth = trackRef.current.clientWidth;
    const cardWidth = step; // step 包含卡片寬度 + gap
    
    // 計算理想的置中位置
    const idealLeft = targetIndex * step - (containerWidth - cardWidth) / 2;
    
    // 計算實際可滾動的最大範圍
    const maxScrollLeft = trackRef.current.scrollWidth - trackRef.current.clientWidth;
    const minScrollLeft = 0;
    
    // 對於最後一張卡片，允許滾動到理想位置（即使超出正常範圍）
    // 對於其他卡片，限制在正常滾動範圍內
    let finalLeft;
    if (targetIndex === maxIdx) {
      // 最後一張卡片：使用理想位置，但至少不能小於0
      finalLeft = Math.max(minScrollLeft, idealLeft);
    } else {
      // 其他卡片：限制在正常滾動範圍內
      finalLeft = Math.max(minScrollLeft, Math.min(idealLeft, maxScrollLeft));
    }
    
    trackRef.current.scrollTo({ left: finalLeft, behavior: 'smooth' });
  }, [getStep, maxIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

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
      // 使用 Tailwind 類別替代 CSS 類別
      track.classList.add('cursor-grabbing', 'select-none');
      document.body.classList.add('select-none');
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
        // 計算拖曳方向（基於最終滾動位置與起始位置的比較）
        const currentLeft = track.scrollLeft;
        const dragDirection = currentLeft > startLeft ? 'right' : 'left';
        const containerWidth = track.clientWidth;
        const screenCenter = currentLeft + containerWidth / 2;
        
        // 找到當前最接近畫面中央的卡片索引
        let currentIndex = 0;
        let minDistance = Infinity;
        
        for (let i = 0; i <= maxIndex(); i += 1) {
          const cardLeft = i * step;
          const cardCenter = cardLeft + step / 2;
          const distance = Math.abs(cardCenter - screenCenter);
          
          if (distance < minDistance) {
            minDistance = distance;
            currentIndex = i;
          }
        }
        
        // 根據拖曳方向決定下一張卡片
        let targetIndex = currentIndex;
        
        if (dragDirection === 'left' && currentIndex > 0) {
          // 向左拖曳：顯示左邊的卡片
          targetIndex = currentIndex - 1;
        } else if (dragDirection === 'right' && currentIndex < maxIndex()) {
          // 向右拖曳：顯示右邊的卡片
          targetIndex = currentIndex + 1;
        }
        
        // 確保目標索引在有效範圍內
        targetIndex = Math.max(0, Math.min(maxIndex(), targetIndex));
        
        scrollToIndex(targetIndex);
      }

      disableNoSnap();
      // 移除 Tailwind 類別
      track.classList.remove('cursor-grabbing', 'select-none');
      document.body.classList.remove('select-none');
    };

    const onPointerCancel = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      track.releasePointerCapture(e.pointerId);

      dragging = false;
      disableNoSnap();
      track.classList.remove('cursor-grabbing', 'select-none');
      document.body.classList.remove('select-none');
    };

    const onLostCapture = () => {
      pointerId = null;
      dragging = false;
      disableNoSnap();
      track.classList.remove('cursor-grabbing', 'select-none');
      document.body.classList.remove('select-none');
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
    <section className={cn('relative pt-16 overflow-x-clip flex flex-col items-center justify-center bg-cyan-50', className)} id="functions">
      <div className="text-teal-800 py-15 px-6">
        <SectionHeader
          title="學習群島上的功能生態"
          variant="dark"
          size="md"
          alignment="center"
          showSubtitle={false}
          className="text-teal-800"
        />
      </div>
      
      <div className="w-full pl-6">
        <div 
          ref={trackRef}
          className={cn(
            'flex gap-4 overflow-x-auto p-2 scroll-smooth touch-pan-x',
            'scrollbar-hide',
            // 拖拽狀態樣式 - 移除 transition 避免與拖曳衝突
            'transition-none'
          )}
          style={{
            // 確保在拖拽時有適當的游標樣式
            cursor: 'grab',
            // 覆蓋全域的 transition 樣式
            transition: 'none',
            // 覆蓋全域的 scroll-behavior
            scrollBehavior: 'auto',
            // 為卡片末端添加 padding
            paddingRight: '24px',
          }}
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
