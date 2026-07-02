import type { Messages } from "../index";
import type { Locale } from "../routing";

/**
 * 依 locale 動態載入該語系的完整 messages（各 namespace 檔案由 locales/{locale}/index.ts 彙整）
 * @param locale - 語系
 * @returns 該語系的完整 messages
 */
export async function loadMessages(locale: Locale): Promise<Messages> {
  if (locale === "en") {
    return (await import("../locales/en")).default;
  }
  return (await import("../locales/zh-TW")).default;
}
