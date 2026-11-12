/**
 * 官網（daodao.so）的 robots.txt 與 sitemap.xml 內容。
 *
 * 只有正式站允許搜尋引擎收錄；dev.daodao.so、本機等其他環境一律 Disallow，
 * 避免測試站被 Google 收錄。環境以建置時的 NEXT_PUBLIC_WEBSITE_URL 判斷。
 * 官網路由是 next-intl `localePrefix: "as-needed"`：中文不帶前綴，英文帶 `/en`。
 */

export const PRODUCTION_WEBSITE_URL = "https://daodao.so";

const DEFAULT_LOCALE = "zh-TW";
const LOCALES = [DEFAULT_LOCALE, "en"] as const;

/** 提供給搜尋引擎的公開官網頁面；互動流程 action-maker 與內部 /dev 頁不列入。 */
export const WEBSITE_PUBLIC_PATHS = [
  "",
  "/about",
  "/quiz",
  "/learning-marathons/2025S1",
  "/terms/service",
  "/terms/privacy-policy",
  "/terms/ipr",
] as const;

type RobotsRule = { userAgent: string; allow?: string; disallow?: string | string[] };
export type WebsiteRobots = { rules: RobotsRule[]; sitemap?: string };
export type WebsiteSitemapEntry = {
  url: string;
  alternates?: { languages: Record<string, string> };
};

const normalize = (url: string | undefined) => (url ?? "").trim().replace(/\/+$/, "");

export const isProductionWebsite = (websiteUrl: string | undefined) =>
  normalize(websiteUrl) === PRODUCTION_WEBSITE_URL;

const localizedUrl = (base: string, locale: string, path: string) =>
  `${base}${locale === DEFAULT_LOCALE ? "" : `/${locale}`}${path}`;

export function buildWebsiteRobots(websiteUrl: string | undefined): WebsiteRobots {
  if (!isProductionWebsite(websiteUrl)) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dev/", "/en/dev/"] }],
    sitemap: `${PRODUCTION_WEBSITE_URL}/sitemap.xml`,
  };
}

export function buildWebsiteSitemap(websiteUrl: string | undefined): WebsiteSitemapEntry[] {
  if (!isProductionWebsite(websiteUrl)) return [];
  const base = PRODUCTION_WEBSITE_URL;
  return WEBSITE_PUBLIC_PATHS.flatMap((path) => {
    const languages: Record<string, string> = Object.fromEntries(
      LOCALES.map((locale) => [locale, localizedUrl(base, locale, path)])
    );
    languages["x-default"] = localizedUrl(base, DEFAULT_LOCALE, path);
    return LOCALES.map((locale) => ({
      url: localizedUrl(base, locale, path),
      alternates: { languages },
    }));
  });
}
