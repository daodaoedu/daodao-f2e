import React, { useRef, useEffect } from "react";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer_v2";
import {
  PromotionBar,
  PromotionProvider,
  usePromotion,
} from "@/contexts/Promotion";

function DefaultLayoutContent({ children }: React.PropsWithChildren) {
  const headerRef = useRef<HTMLDivElement>(null);
  const { height, showPromotionBar, setHeight } = usePromotion();
  const prevShowPromotionBar = useRef<boolean | null>(null);

  useEffect(() => {
    const handleScrollPaddingTop = () => {
      if (!headerRef.current) return;
      const headerOffset = headerRef.current.offsetHeight;
      const root = document.querySelector(":root");

      setHeight(headerOffset);
      if (root instanceof HTMLElement) {
        root.style.scrollPaddingTop = `${headerOffset + 80}px`;
      }
    };

    if (prevShowPromotionBar.current !== showPromotionBar) {
      handleScrollPaddingTop();
      prevShowPromotionBar.current = showPromotionBar;
    }

    window.addEventListener("resize", handleScrollPaddingTop);
    return () => {
      window.removeEventListener("resize", handleScrollPaddingTop);
    };
  }, [headerRef.current, showPromotionBar]);

  return (
    <>
      <Header ref={headerRef}>
        <PromotionBar />
      </Header>
      <main className="min-h-screen" style={{ paddingTop: `${height}px` }}>
        {children}
      </main>
    </>
  );
}

function DefaultLayout({ children }: React.PropsWithChildren) {
  return (
    <>
      <PromotionProvider>
        <DefaultLayoutContent>{children}</DefaultLayoutContent>
      </PromotionProvider>
      <Footer />
    </>
  );
}

export default DefaultLayout;
