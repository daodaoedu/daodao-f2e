import { useEffect } from 'react';
import { useRouter } from 'next/router';

// 用於重置頁面滾動位置的 Hook
export function useScrollToTop() {
  const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior,
    });
  };

  return { scrollToTop };
}

// 在路由變更時自動滾動到頂部的 Hook
export function useScrollOnRouteChange() {
  const router = useRouter();
  const { scrollToTop } = useScrollToTop();

  useEffect(() => {
    const handleRouteChange = () => {
      setTimeout(() => {
        scrollToTop('auto');
      }, 0);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, scrollToTop]);
}

// 在組件掛載時滾動到頂部的 Hook
export function useScrollToTopOnMount() {
  const { scrollToTop } = useScrollToTop();

  useEffect(() => {
    scrollToTop('auto');
  }, [scrollToTop]);
}

// 帶有條件的滾動到頂部 Hook
export function useConditionalScrollToTop(condition: boolean, deps: unknown[] = []) {
  const { scrollToTop } = useScrollToTop();

  useEffect(() => {
    if (condition) {
      scrollToTop();
    }
  }, [condition, scrollToTop, ...deps]);
}
