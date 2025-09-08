import React, { ReactNode } from 'react';
import { useKV } from '@github/spark/hooks';
import { TranslationContext } from '@/hooks/useTranslation';
import { translations, TranslationKey, Language } from '@/data/translations';

interface TranslationProviderProps {
  children: ReactNode;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [language, setLanguage] = useKV('selected-language', 'en' as Language);

  const t = (key: TranslationKey, fallback?: string): string => {
    const translation = translations[language]?.[key] || translations.en[key] || fallback || key;
    return translation;
  };

  // Helper function for translations with interpolation
  const interpolate = (template: string, values: Record<string, string | number>): string => {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return values[key]?.toString() || match;
    });
  };

  const contextValue = {
    language,
    setLanguage,
    t,
    interpolate
  };

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
}
