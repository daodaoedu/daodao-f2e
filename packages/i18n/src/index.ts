export {
  hasLocale,
  NextIntlClientProvider,
  useLocale,
  useMessages,
  useTranslations,
} from "next-intl";
export type { Locale } from "./routing";
export type Messages = Record<string, unknown>;
export { getMessagesFromPathname } from "./lib/get-messages";
