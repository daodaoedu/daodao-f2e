import { defineRouting } from 'next-intl/routing';

const defaultLocale = 'zh-TW';

export const routing = defineRouting({
  locales: [defaultLocale, 'en'],
  defaultLocale,
  localePrefix: 'as-needed',
});
