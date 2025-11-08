import zhDictionary from './locales/zh-TW.json';
import enDictionary from './locales/en.json';

const defaultLocale = 'zh-TW';
const locales = [defaultLocale, 'en'] as const;
export type Locale = (typeof locales)[number];
export type Dictionary = typeof import('./locales/zh-TW.json');
export const localeRegex = new RegExp(`(${locales.join('|')})`);
export const localePathnameRegex = new RegExp(
  `^/(${locales.join('|')})((?:/|$))`
);

export const languageOptions = [
  { value: 'zh-TW', label: '中文' },
  { value: 'en', label: 'English' },
] as const;

export const isLocale = (
  language: string | undefined | null
): language is Locale => locales.includes(language as Locale);

export const getDictionary = (locale: string) => {
  const dictionaries: Record<Locale, Dictionary> = {
    'zh-TW': zhDictionary,
    en: enDictionary,
  };

  return isLocale(locale) ? dictionaries[locale] : dictionaries[defaultLocale];
};

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

export const getTranslation =
  (dictionary: Dictionary) =>
  (key: TranslationKeys, variables?: TranslationVariables) => {
    let text =
      getNestedValue(dictionary, key) ||
      getNestedValue(zhDictionary, key) ||
      key;

    if (variables) {
      Object.entries(variables).forEach(([varKey, value]) => {
        text = text.replace(`{${varKey}}`, value.toString());
      });
    }

    return text;
  };
