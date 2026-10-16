import { hasLocale } from "next-intl";
import type { Messages } from "../index";
import enMessages from "../locales/en";
import zhTWMessages from "../locales/zh-TW";
import type { Locale } from "../routing";
import { routing } from "../routing";

const messagesMap = {
  "zh-TW": zhTWMessages,
  en: enMessages,
};

/**
 * 特殊情境才使用，非必要勿使用，從 pathname 提取 locale 並獲取對應的 messages
 * @param pathname - 路徑名稱
 * @returns 包含 locale 和 messages 的物件
 */
export function getMessagesFromPathname(pathname: string): {
  locale: Locale;
  messages: Messages;
} {
  const pathnameParts = pathname.split("/");
  const locale = hasLocale(routing.locales, pathnameParts[1])
    ? pathnameParts[1]
    : routing.defaultLocale;

  const messages = messagesMap[locale];

  return { locale, messages };
}
