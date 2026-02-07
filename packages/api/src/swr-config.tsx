"use client";

import { SWRConfig, type SWRConfiguration } from "swr";

/**
 * SWR 預設配置
 * 這些設定會套用到所有使用 @daodao/api hooks 的組件
 */
export const defaultSwrConfig: SWRConfiguration = {
  // 重新驗證設定
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  revalidateIfStale: true,
  // 錯誤重試設定
  shouldRetryOnError: false,
  errorRetryCount: 1,
  errorRetryInterval: 5000,
  // 快取設定
  dedupingInterval: 2000,
  // 其他設定
  keepPreviousData: true,
};

/**
 * SWRConfig Provider 組件
 * 用於在應用程式中提供 SWR 的全域配置
 *
 * @example
 * ```tsx
 * import { SwrConfigProvider } from "@daodao/api";
 *
 * function App() {
 *   return (
 *     <SwrConfigProvider>
 *       <YourApp />
 *     </SwrConfigProvider>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // 自訂配置
 * import { SwrConfigProvider, defaultSwrConfig } from "@daodao/api";
 *
 * function App() {
 *   return (
 *     <SwrConfigProvider
 *       value={{
 *         ...defaultSwrConfig,
 *         revalidateOnFocus: false, // 覆蓋預設值
 *       }}
 *     >
 *       <YourApp />
 *     </SwrConfigProvider>
 *   );
 * }
 * ```
 */
export interface SwrConfigProviderProps {
  /**
   * SWR 配置選項
   * 如果未提供，會使用 defaultSwrConfig
   */
  value?: SWRConfiguration;
  children: React.ReactNode;
}

export const SwrConfigProvider = ({ value, children }: SwrConfigProviderProps) => {
  return <SWRConfig value={value ?? defaultSwrConfig}>{children}</SWRConfig>;
};
