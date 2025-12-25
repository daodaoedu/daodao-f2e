import { calculateTimeDifference } from "@daodao/shared";

/**
 * 翻譯函數類型
 */
export type TranslationFunction = (key: string, values?: Record<string, number | string>) => string;

/**
 * 使用多語系格式化時間差
 *
 * @param date 目標日期
 * @param t 翻譯函數（從 next-intl 的 useTranslations 取得）
 * @returns 格式化後的時間差字串
 *
 * @example
 * ```tsx
 * import { useTranslations } from 'next-intl';
 * import { formatTimeDuration } from '@daodao/i18n/lib/time-duration';
 *
 * const Component = () => {
 *   const t = useTranslations('common');
 *   const formatted = formatTimeDuration(new Date('2024-01-01'), t);
 *   return <span>{formatted}</span>;
 * };
 * ```
 */
export const formatTimeDuration = (date: string | Date, t: TranslationFunction): string => {
  const diff = calculateTimeDifference(date);

  switch (diff.unit) {
    case "days":
      return t("time.days_ago", { count: diff.value });
    case "hours":
      return t("time.hours_ago", { count: diff.value });
    case "minutes":
      return t("time.minutes_ago", { count: diff.value });
    case "just_now":
      return t("time.just_now");
    default:
      return t("time.just_now");
  }
};
