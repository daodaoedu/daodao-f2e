import { defineRouting } from "next-intl/routing";

const defaultLocale = "zh-TW";

export const routing = defineRouting({
  locales: [defaultLocale, "en"],
  defaultLocale,
  // Keep the default locale explicit in local development. The middleware's
  // as-needed rewrite currently loops between `/` and `/zh-TW` in dev.
  localePrefix: process.env.NODE_ENV === "development" ? "always" : "as-needed",
});

export type Locale = (typeof routing.locales)[number];

export const languageOptions: {
  value: Locale;
  label: string;
}[] = [
  { value: "zh-TW", label: "中文" },
  { value: "en", label: "English" },
];
