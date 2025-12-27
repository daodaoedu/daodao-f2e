import type { Locale } from "./routing";

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: Record<string, unknown>;
  }
}
