export type TermsType = "service" | "privacy-policy" | "ipr";

const DEFAULT_LOCALE = "zh-TW";

/**
 * 官網條款頁網址，依語系帶前綴（daodao#348）。
 * 官網路由是 next-intl `localePrefix: "as-needed"`：預設中文不帶前綴，其他語系帶 `/<locale>`，
 * 與官網 footer 的連結一致。
 */
export function getTermsUrl(
  websiteUrl: string | undefined,
  locale: string,
  type: TermsType
): string {
  const base = (websiteUrl ?? "").replace(/\/+$/, "");
  const localePrefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  return `${base}${localePrefix}/terms/${type}`;
}
