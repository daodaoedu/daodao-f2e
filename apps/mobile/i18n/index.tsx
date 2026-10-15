import { createContext, type ReactNode, useContext, useMemo, useState } from "react";
import enMessages from "../../../packages/i18n/src/locales/en";
import zhTWMessages from "../../../packages/i18n/src/locales/zh-TW";

export type MobileLocale = "zh-TW" | "en";

type TranslationValues = Record<string, string | number>;
type MessageTree = Record<string, unknown>;

type MobileI18nContextValue = {
  locale: MobileLocale;
  setLocale: (locale: MobileLocale) => void;
  t: (key: string, values?: TranslationValues) => string;
};

const messagesByLocale: Record<MobileLocale, MessageTree> = {
  "zh-TW": zhTWMessages,
  en: enMessages,
};

const MobileI18nContext = createContext<MobileI18nContextValue | null>(null);

function getInitialLocale(): MobileLocale {
  const resolvedLocale = Intl.DateTimeFormat().resolvedOptions().locale;
  return resolvedLocale.toLowerCase().startsWith("en") ? "en" : "zh-TW";
}

function readMessage(messages: MessageTree, key: string): string | undefined {
  const value = key.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object" && part in current) {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, messages);

  return typeof value === "string" ? value : undefined;
}

function interpolate(message: string, values?: TranslationValues): string {
  if (!values) return message;

  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    message
  );
}

export function MobileI18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<MobileLocale>(getInitialLocale);

  const value = useMemo<MobileI18nContextValue>(() => {
    const messages = messagesByLocale[locale];
    const fallbackMessages = messagesByLocale["zh-TW"];

    return {
      locale,
      setLocale,
      t: (key, values) => {
        const message = readMessage(messages, key) ?? readMessage(fallbackMessages, key) ?? key;
        return interpolate(message, values);
      },
    };
  }, [locale]);

  return <MobileI18nContext.Provider value={value}>{children}</MobileI18nContext.Provider>;
}

export function useMobileI18n() {
  const context = useContext(MobileI18nContext);

  if (!context) {
    throw new Error("useMobileI18n must be used within MobileI18nProvider");
  }

  return context;
}

export function useMobileTranslation(namespace?: string) {
  const { t } = useMobileI18n();

  return (key: string, values?: TranslationValues) => {
    const namespacedKey = namespace ? `${namespace}.${key}` : key;
    return t(namespacedKey, values);
  };
}
