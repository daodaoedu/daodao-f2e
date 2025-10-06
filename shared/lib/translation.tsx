'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Dictionary, getText, TranslationKeys } from '@/shared/config/i18n';

const TranslationContext = createContext<Dictionary | null>(null);

export interface TranslationProviderProps {
  children: ReactNode;
  dictionary: Dictionary;
}

export const TranslationProvider = ({
  children,
  dictionary,
}: TranslationProviderProps) => (
  <TranslationContext.Provider value={dictionary}>
    {children}
  </TranslationContext.Provider>
);

export const useTranslation = () => {
  const dictionary = useContext(TranslationContext);

  if (!dictionary) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }

  return {
    t: (key: TranslationKeys) => getText(dictionary, key),
    dictionary,
  };
};

export interface TranslationContextValue {
  dictionary: Dictionary;
  t: (key: TranslationKeys) => string;
}
