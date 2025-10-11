import { unstable_rootParams } from 'next/server';
import zhDictionary from './locales/zh-TW.json';
import enDictionary from './locales/en.json';

export const defaultLocale = 'zh-TW';
export const locales = [defaultLocale, 'en'] as const;
export type Locale = (typeof locales)[number];
export type Dictionary = typeof import('./locales/zh-TW.json');

const localeRegex = new RegExp(`(${locales.join('|')})`);

export const languageOptions = [
  { value: 'zh-TW', label: '中文' },
  { value: 'en', label: 'English' },
] as const;

const dictionaries: Record<Locale, Dictionary> = {
  'zh-TW': zhDictionary,
  en: enDictionary,
};

export const isLocale = (language: string): language is Locale =>
  locales.includes(language as Locale);

type ParamsType = LayoutProps<'/[language]'>['params'];

type LocaleOrParamsType =
  | string
  | ParamsType
  | ReturnType<typeof unstable_rootParams>;

export const getDictionary = async (localeOrParams: LocaleOrParamsType) => {
  const locale =
    typeof localeOrParams === 'string'
      ? localeOrParams
      : (await (localeOrParams as ParamsType))?.language;

  return isLocale(locale) ? dictionaries[locale] : dictionaries[defaultLocale];
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

  const languages = acceptLanguage.match(localeRegex);

  if (languages?.[0] && isLocale(languages[0])) {
    return languages[0];
  }

  return defaultLocale;
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

export type TranslationVariables = Record<string, string | number>;

export const getText = (
  dictionary: Dictionary,
  key: TranslationKeys,
  variables?: TranslationVariables
) => {
  let text =
    getNestedValue(dictionary, key) ||
    getNestedValue(dictionaries[defaultLocale], key) ||
    key;

  if (variables) {
    Object.entries(variables).forEach(([varKey, value]) => {
      text = text.replace(`{${varKey}}`, value.toString());
    });
  }

  return text;
};
