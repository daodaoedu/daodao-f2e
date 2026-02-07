import type { Locale } from "./routing";
import type en from "./locales/en.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof en;
  }
}
