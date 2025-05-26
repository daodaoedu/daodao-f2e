import React, { useEffect, useRef, useState } from 'react';
import { usePromotion } from '@/contexts/Promotion';

export default function useShadowToggleOnScroll() {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isShowShadow, setIsShowShadow] = useState(false);
  const { height, setIsShowShadow: setIsShowHeaderShadow } = usePromotion();

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return;

      const top = elementRef.current.getBoundingClientRect().top ?? 0;
      const shouldShowShadow = top - height < 0;

      if (shouldShowShadow) {
        setIsShowShadow(true);
        setIsShowHeaderShadow(false);
      } else {
        setIsShowShadow(false);
        setIsShowHeaderShadow(true);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [height, setIsShowHeaderShadow]);

  const TriggerElement = () => <div ref={elementRef} />;

  return {
    height,
    isShowShadow,
    TriggerElement,
  };
}
