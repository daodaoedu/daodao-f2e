"use client";

import { useEffect, useState } from "react";
import { useDeviceSafe } from "../providers/device-provider";

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
 * 如果 Device Provider 存在，會使用 Provider 提供的初始值避免閃爍
 */
function useBreakpoints() {
  const device = useDeviceSafe();
  const initialDevice = device
    ? {
        isMobile: device.isMobile,
        isDesktop: device.isDesktop,
      }
    : null;

  const getInitialState = () => {
    if (initialDevice) {
      return {
        sm: !initialDevice.isMobile,
        md: !initialDevice.isMobile,
        lg: initialDevice.isDesktop,
        xl: initialDevice.isDesktop,
      };
    }

    return {
      sm: false,
      md: false,
      lg: false,
      xl: false,
    };
  };

  const [breakpointState, setBreakpointState] = useState(getInitialState);

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

    updateState();

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
 * 取得當前有效的 breakpoint 名稱（返回最大的匹配 breakpoint）
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
 * 判斷是否為行動裝置（< 768px）
 * 如果 Device Provider 存在，會優先使用 Provider 提供的值以避免閃爍
 */
export function useIsMobile(): boolean {
  const device = useDeviceSafe();
  const { md } = useBreakpoints();

  if (device?.isInitialized) {
    return device.isMobile;
  }

  return !md;
}

/**
 * 判斷是否為平板裝置（>= 768px 且 < 1025px）
 * 如果 Device Provider 存在，會優先使用 Provider 提供的值以避免閃爍
 */
export function useIsTablet(): boolean {
  const device = useDeviceSafe();
  const { md, lg } = useBreakpoints();

  if (device?.isInitialized) {
    return device.isTablet;
  }

  return md && !lg;
}

/**
 * 判斷是否為桌面裝置（>= 1025px）
 * 如果 Device Provider 存在，會優先使用 Provider 提供的值以避免閃爍
 */
export function useIsDesktop(): boolean {
  const device = useDeviceSafe();
  const { lg } = useBreakpoints();

  if (device?.isInitialized) {
    return device.isDesktop;
  }

  return lg;
}

/**
 * 判斷是否為小螢幕（< 640px）
 */
export function useIsXSmall(): boolean {
  const { sm } = useBreakpoints();
  return !sm;
}

/**
 * 判斷是否為中等以上螢幕（>= 768px）
 */
export function useIsMediumUp(): boolean {
  const { md } = useBreakpoints();
  return md;
}

/**
 * 判斷是否為大螢幕以上（>= 1025px）
 */
export function useIsLargeUp(): boolean {
  const { lg } = useBreakpoints();
  return lg;
}
