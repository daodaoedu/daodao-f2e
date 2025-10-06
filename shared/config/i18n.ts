import fallbackDictionary from './locales/zh-TW.json';

export const defaultLocale = 'zh-TW';
export const locales = [defaultLocale, 'en'] as const;
export type Locale = (typeof locales)[number];
export type Dictionary = typeof import('./locales/zh-TW.json');

export const languageOptions = [
  { value: 'zh-TW', label: '中文' },
  { value: 'en', label: 'English' },
] as const;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  'zh-TW': () =>
    import('./locales/zh-TW.json').then((module) => module.default),
  en: () => import('./locales/en.json').then((module) => module.default),
};

export const isLocale = (language: string): language is Locale =>
  locales.findIndex((locale) => locale === language) > -1;

type LocaleOrParamsType = string | LayoutProps<'/[language]'>['params'];

export const getDictionary = async (localeOrParams: LocaleOrParamsType) => {
  const locale =
    typeof localeOrParams === 'string'
      ? localeOrParams
      : (await localeOrParams).language;

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
 * getLocale('/pathname'); // 'zh-TW'
 */
export function getLocale(acceptLanguage?: string | null): Locale {
  if (typeof acceptLanguage !== 'string') return defaultLocale;

  // match accept language
  // e.g. zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7 => [ 'zh-TW', 'zh', 'en-US', 'en' ]
  const languageRegex = /([\w]{2,3}-?[\w]{0,3})/gm;
  const languages = acceptLanguage.match(languageRegex);
  const selectedLocale = languages?.find(isLocale);

  return selectedLocale || defaultLocale;
}

// 遞歸生成所有末端節點的路徑
type LeafPaths<T, P extends string = ''> = {
  [K in keyof T]: T[K] extends object
    ? LeafPaths<T[K], P extends '' ? `${string & K}` : `${P}.${string & K}`>
    : P extends ''
      ? `${string & K}`
      : `${P}.${string & K}`;
}[keyof T];

export type TranslationKeys = LeafPaths<Dictionary>;

const getNestedValue = (dictionary: Dictionary, key: string) => {
  try {
    const value = key.split('.').reduce<unknown>((data, part) => {
      if (data && typeof data === 'object') {
        return data[part as keyof typeof data];
      }
      throw new Error(`Invalid path: ${key}`);
    }, dictionary);
    return typeof value === 'string' ? value : '';
  } catch {
    return '';
  }
};

export const getText = (dictionary: Dictionary, key: TranslationKeys) => {
  return (
    getNestedValue(dictionary, key) ||
    getNestedValue(fallbackDictionary, key) ||
    key
  );
};
