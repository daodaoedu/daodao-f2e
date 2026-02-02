import { defineRouting } from "next-intl/routing";

const defaultLocale = "zh-TW";

export const routing = defineRouting({
  locales: [defaultLocale, "en"],
  defaultLocale,
  localePrefix: "as-needed",
});

type Locale = (typeof routing.locales)[number];

export const languageOptions: {
  value: Locale;
  label: string;
}[] = [
  { value: "zh-TW", label: "中文" },
  { value: "en", label: "English" },
];
