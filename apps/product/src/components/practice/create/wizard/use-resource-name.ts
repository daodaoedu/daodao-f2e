/**
 * 資源名稱推導鏈（design.md D5）：
 * 已知網域對照表 → og:title（8s 逾時視為無）→ deriveResourceName 路徑／網域回退 → host。
 *
 * `resolveResourceNameWith` 為純排序邏輯（可注入 fetcher 測試），
 * `resolveResourceName` 綁定 @daodao/api 的 `extractOgImage`。
 */
import { extractOgImage } from "@daodao/api";
import { deriveResourceName, KNOWN_DOMAIN_NAMES } from "@/lib/practice-create";
import { RESOURCE_NAME_MAX_LENGTH } from "./schema";

export const OG_TITLE_TIMEOUT_MS = 8000;

/** 回傳頁面標題；抓不到回 null。呼叫端不應拋錯（拋錯亦視為 null）。 */
export type TitleFetcher = (url: string) => Promise<string | null>;

const stripWww = (host: string) => host.replace(/^www\./, "");

/** 已知網域對照名稱；非已知網域或 URL 無法 parse 回 null */
export const knownDomainName = (url: string): string | null => {
  try {
    const host = stripWww(new URL(url.trim()).hostname.toLowerCase());
    return KNOWN_DOMAIN_NAMES[host] ?? null;
  } catch {
    return null;
  }
};

const hostOf = (url: string): string | null => {
  try {
    const host = stripWww(new URL(url.trim()).hostname.toLowerCase());
    return host || null;
  } catch {
    return null;
  }
};

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });

/**
 * 純排序邏輯：已知網域 → og:title（fetcher）→ deriveResourceName → host。
 * URL 無法 parse（deriveResourceName 回 null）時回傳 null，由呼叫端切手動模式。
 */
export const resolveResourceNameWith = async (
  url: string,
  fetchTitle: TitleFetcher,
  timeoutMs = OG_TITLE_TIMEOUT_MS
): Promise<string | null> => {
  const known = knownDomainName(url);
  if (known) return known;

  // 先確認 URL 可 parse，否則不必發請求
  const derived = deriveResourceName(url);
  if (derived === null) return null;

  try {
    const title = await withTimeout(fetchTitle(url), timeoutMs);
    const trimmed = title?.trim().slice(0, RESOURCE_NAME_MAX_LENGTH) ?? "";
    if (trimmed) return trimmed;
  } catch {
    // 逾時或擷取失敗 → 走推導鏈
  }

  return derived || hostOf(url);
};

/** 以 /api/og-image 擷取 og:title 的 fetcher */
export const fetchOgTitle: TitleFetcher = async (url) => {
  const result = await extractOgImage({ url });
  if (result.success && result.data.title) return result.data.title;
  return null;
};

/** 解析可 parse URL 的資源名稱；無法 parse 回 null */
export const resolveResourceName = (url: string): Promise<string | null> =>
  resolveResourceNameWith(url, fetchOgTitle);
