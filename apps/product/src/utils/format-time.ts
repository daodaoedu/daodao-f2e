/** 將 ISO 時間字串轉為相對時間描述 */
export function formatRelativeTime(isoString: string, locale = "zh-TW"): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  const isEnglish = locale.startsWith("en");
  const formatter = new Intl.RelativeTimeFormat(isEnglish ? "en" : "zh-TW", {
    numeric: "auto",
  });

  if (minutes < 1) return formatter.format(0, "second");
  if (minutes < 60) return formatter.format(-minutes, "minute");

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return formatter.format(-hours, "hour");

  const days = Math.floor(hours / 24);
  if (days < 30) return formatter.format(-days, "day");

  const months = Math.floor(days / 30);
  return formatter.format(-months, "month");
}
