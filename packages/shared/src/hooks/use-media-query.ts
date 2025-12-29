"use client";

import { useEffect, useState } from "react";

/**
 * Breakpoint 定義
 * 使用 Tailwind 風格的命名：sm, md, lg, xl
 */
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1025,
  xl: 1280,
} as const;

type BreakpointKey = keyof typeof breakpoints;

/**
 * 將 breakpoint 轉換為 media query string
 */
const getMediaQuery = (breakpoint: BreakpointKey): string => {
  return `(min-width: ${breakpoints[breakpoint]}px)`;
};

/**
 * 基礎的 media query hook，可接受 breakpoint 名稱或自訂 media query string
 *
 * @param query - breakpoint 名稱（'sm' | 'md' | 'lg' | 'xl'）或自訂 media query string
 * @returns 是否符合 media query
 *
 * @example
 * ```tsx
 * const isMd = useMediaQuery('md');
 * const isCustom = useMediaQuery('(min-width: 900px)');
 * ```
 */
export function useMediaQuery(query: BreakpointKey | string): boolean {
  const [isMatch, setIsMatch] = useState(false);

  useEffect(() => {
    const mediaQueryString = query in breakpoints ? getMediaQuery(query as BreakpointKey) : query;
    const mediaQuery = window.matchMedia(mediaQueryString);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsMatch(event.matches);
    };

    setIsMatch(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return isMatch;
}

/**
 * 統一的 breakpoint 狀態管理 hook
 * 避免在多個 hook 中重複監聽相同的 media query
 *
 * @returns 包含所有 breakpoint 狀態的物件
 */
function useBreakpoints() {
  const [breakpointState, setBreakpointState] = useState({
    sm: false,
    md: false,
    lg: false,
    xl: false,
  });

  useEffect(() => {
    const queries = {
      sm: window.matchMedia(getMediaQuery("sm")),
      md: window.matchMedia(getMediaQuery("md")),
      lg: window.matchMedia(getMediaQuery("lg")),
      xl: window.matchMedia(getMediaQuery("xl")),
    };

    const updateState = () => {
      setBreakpointState({
        sm: queries.sm.matches,
        md: queries.md.matches,
        lg: queries.lg.matches,
        xl: queries.xl.matches,
      });
    };

    // 初始化狀態
    updateState();

    // 監聽所有 breakpoint 變化
    Object.values(queries).forEach((query) => {
      query.addEventListener("change", updateState);
    });

    return () => {
      Object.values(queries).forEach((query) => {
        query.removeEventListener("change", updateState);
      });
    };
  }, []);

  return breakpointState;
}

/**
 * 取得當前有效的 breakpoint 名稱
 * 返回最大的匹配 breakpoint
 *
 * @returns 當前 breakpoint 名稱或 null
 *
 * @example
 * ```tsx
 * const breakpoint = useBreakpoint();
 * // 'sm' | 'md' | 'lg' | 'xl' | null
 * ```
 */
export function useBreakpoint(): BreakpointKey | null {
  const { sm, md, lg, xl } = useBreakpoints();

  if (xl) return "xl";
  if (lg) return "lg";
  if (md) return "md";
  if (sm) return "sm";
  return null;
}

/**
 * 判斷是否為行動裝置（小於 md breakpoint，即 < 768px）
 *
 * @example
 * ```tsx
 * const isMobile = useIsMobile();
 * ```
 */
export function useIsMobile(): boolean {
  const { md } = useBreakpoints();
  return !md;
}

/**
 * 判斷是否為平板裝置（md breakpoint 以上但小於 lg，即 >= 768px 且 < 1024px）
 *
 * @example
 * ```tsx
 * const isTablet = useIsTablet();
 * ```
 */
export function useIsTablet(): boolean {
  const { md, lg } = useBreakpoints();
  return md && !lg;
}

/**
 * 判斷是否為桌面裝置（lg breakpoint 以上，即 >= 1024px）
 *
 * @example
 * ```tsx
 * const isDesktop = useIsDesktop();
 * ```
 */
export function useIsDesktop(): boolean {
  const { lg } = useBreakpoints();
  return lg;
}

/**
 * 判斷是否為小螢幕（小於 sm breakpoint，即 < 640px）
 *
 * @example
 * ```tsx
 * const isXSmall = useIsXSmall();
 * ```
 */
export function useIsXSmall(): boolean {
  const { sm } = useBreakpoints();
  return !sm;
}

/**
 * 判斷是否為中等以上螢幕（md breakpoint 以上，即 >= 768px）
 *
 * @example
 * ```tsx
 * const isMediumUp = useIsMediumUp();
 * ```
 */
export function useIsMediumUp(): boolean {
  const { md } = useBreakpoints();
  return md;
}

/**
 * 判斷是否為大螢幕以上（lg breakpoint 以上，即 >= 1024px）
 *
 * @example
 * ```tsx
 * const isLargeUp = useIsLargeUp();
 * ```
 */
export function useIsLargeUp(): boolean {
  const { lg } = useBreakpoints();
  return lg;
}
