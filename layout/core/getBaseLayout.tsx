import React, { useRef, useEffect } from 'react';
import Header from '@/layout/components/Header';
import Footer from '@/layout/components/Footer';
import { PromotionProvider, usePromotion } from '@/contexts/Promotion';

function BaseLayout({ children }: React.PropsWithChildren) {
  const headerRef = useRef<HTMLDivElement>(null);
  const { isShowPromotionBar, height, setHeight } = usePromotion();
  const prevShowPromotionBar = useRef<boolean | null>(null);

  useEffect(() => {
    const handleScrollPaddingTop = () => {
      requestAnimationFrame(() => {
        if (!headerRef.current) return;
        const headerOffset = headerRef.current.offsetHeight;
        const root = document.querySelector(':root');

        setHeight(Math.floor(headerOffset));
        if (root instanceof HTMLElement) {
          root.style.setProperty(
            'scroll-padding-top',
            `${headerOffset + 80}px`
          );
        }
      });
    };

    if (prevShowPromotionBar.current !== isShowPromotionBar) {
      handleScrollPaddingTop();
      prevShowPromotionBar.current = isShowPromotionBar;
    }

    window.addEventListener('resize', handleScrollPaddingTop);
    return () => {
      window.removeEventListener('resize', handleScrollPaddingTop);
    };
  }, [headerRef.current, isShowPromotionBar]);

  return (
    <>
      <Header />
      <main className="bg-white" style={{ paddingTop: height }}>
        {children}
      </main>
      <Footer />
    </>
  );
}

/**
 * 預設的基礎佈局，包含 Header 、 PromotionBar 和 Footer
 */
export default function getBaseLayout(page: React.ReactElement) {
  return (
    <PromotionProvider>
      <BaseLayout>{page}</BaseLayout>
    </PromotionProvider>
  );
}
