export const defaultLocale = 'zh';
export const locales = [defaultLocale, 'en'] as const;
export type Locale = (typeof locales)[number];
export type Dictionary = typeof import('./locales/zh.json');

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  zh: () => import('./locales/zh.json'),
  en: () => import('./locales/en.json'),
};

export const isLocale = (language: string): language is Locale =>
  locales.findIndex((locale) => locale === language) > -1;

export const getDictionary = (locale: Locale) => {
  return isLocale(locale)
    ? dictionaries[locale]()
    : dictionaries[defaultLocale]();
};

/**
 * The function get language locale code from the input.
 *
 * Ensures that the selected locale code matches one of the supported locale codes in the ~/data/i18n file.
 *
 * @example
 * import { getLocale } from '@/constants/i18n';
 *
 * getLocale('zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7'); // 'zh-TW'
 * getLocale('/en/pathname'); // 'en'
 * getLocale('/pathname', 'zh-TW'); // 'zh-TW'
 */
export function getLocale(
  acceptLanguage?: string | null,
  fallbackLocale?: Locale
): Locale {
  if (typeof acceptLanguage !== 'string') return fallbackLocale || 'en';

  // match accept language
  // e.g. zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7 => [ 'zh-TW', 'zh', 'en-US', 'en' ]
  const languageRegex = /([\w]{2,3}-?[\w]{0,3})/gm;
  const languages = acceptLanguage.match(languageRegex);
  const selectedLocale = languages?.find(isLocale);

  return selectedLocale || fallbackLocale || 'en';
}
