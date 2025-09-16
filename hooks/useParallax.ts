'use client';

import { useEffect, useRef, useState } from 'react';

interface UseParallaxOptions {
  speed?: number;
  direction?: 'up' | 'down';
  offset?: number;
}

interface UseParallaxPresetOptions {
  preset?: 'slow';
}

// 預設配置 
const PARALLAX_PRESETS = {
  'slow': {
    speed: 0.08,  // 慢速 - 適合背景元素、裝飾圖片
    direction: 'up' as const,
    offset: 0,
  },
};

export function useParallax<T extends HTMLElement = HTMLElement>(
  options: UseParallaxOptions & UseParallaxPresetOptions = {}
) {
  const { preset, ...customOptions } = options;
  
  // 如果有預設配置，使用預設配置並覆蓋自定義選項
  const presetConfig = preset ? PARALLAX_PRESETS[preset] : {};
  const finalOptions = { ...presetConfig, ...customOptions };
  
  const { speed = 0.15, direction = 'up', offset = 0 } = finalOptions;
  const elementRef = useRef<T>(null);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (!elementRef.current) {
            ticking = false;
            return;
          }

          const rect = elementRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const elementTop = rect.top;
          const elementHeight = rect.height;

          // 計算元素在視窗中的可見程度
          const elementCenter = elementTop + elementHeight / 2;
          const windowCenter = windowHeight / 2;
          
          // 當元素進入視窗時開始計算視差
          if (elementTop < windowHeight && elementTop + elementHeight > 0) {
            const distanceFromCenter = elementCenter - windowCenter;
            const parallaxDistance = distanceFromCenter * speed;
            
            // 根據方向調整移動方向
            const finalTranslateY = direction === 'up' 
              ? parallaxDistance + offset
              : -parallaxDistance + offset;
            
            setTranslateY(finalTranslateY);
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    // 初始計算
    handleScroll();

    // 添加滾動監聽器
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [speed, direction, offset]);

  return {
    ref: elementRef,
    style: {
      transform: `translateY(${translateY}px)`,
    },
  };
}

/**
 * 創建多個視差效果的便利函數
 * 特別用於需要多個視差元素的場景
 */
export function useMultipleParallax<T extends HTMLElement = HTMLElement>(
  configs: Array<UseParallaxOptions & UseParallaxPresetOptions>
) {
  return configs.map(config => useParallax<T>(config));
}
