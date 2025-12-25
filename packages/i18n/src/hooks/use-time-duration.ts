"use client";

import { useTranslations } from "next-intl";
import { formatTimeDuration } from "../lib/time-duration";

/**
 * Hook 版本：在 React 組件中使用
 *
 * @param date 目標日期
 * @returns 格式化後的時間差字串
 *
 * @example
 * ```tsx
 * import { useTimeDuration } from '@daodao/i18n/hooks/use-time-duration';
 *
 * const TimeAgo = ({ date }: { date: Date }) => {
 *   const formatted = useTimeDuration(date);
 *   return <span>{formatted}</span>;
 * };
 * ```
 */
export const useTimeDuration = (date: string | Date): string => {
  const t = useTranslations("common");
  return formatTimeDuration(date, t);
};
