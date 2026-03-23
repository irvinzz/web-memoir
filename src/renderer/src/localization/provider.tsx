import { useEffect, useState } from 'react';

import en from '../locales/en.json';
import de from '../locales/de.json';
import ru from '../locales/ru.json';
import { TranslationContext } from './context';

type LocalizationKeys = keyof typeof en;

const translations = {
  'en-US': en,
  'de-DE': de,
  'ru-RU': ru,
  ru,
  en,
  de,
};

type KnownLocales = keyof typeof translations;

export interface TranslactionContextType {
  t: (input: LocalizationKeys) => string;
}

export function TranslationProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [locale, setLocale] = useState<KnownLocales>();
  const t = (key: LocalizationKeys): string => translations[locale || 'en-US'][key] || key;

  useEffect(() => {
    if (locale) return;
    window.api.getLocale().then((locale) => {
      if (Object.keys(translations).includes(locale)) {
        setLocale(locale as KnownLocales);
      }
    });
  }, [locale]);

  return <TranslationContext.Provider value={{ t }}>{children}</TranslationContext.Provider>;
}
