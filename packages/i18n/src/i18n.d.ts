import type { Locale } from "./routing";
import messages from "./locales/zh-TW";

type Messages = typeof messages;

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}
