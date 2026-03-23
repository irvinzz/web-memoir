import { useEffect, useState } from 'react';

import en from '../locales/en.json';
import de from '../locales/de.json';
import ru from '../locales/ru.json';
import fr from '../locales/fr.json';
import ch from '../locales/ch.json';
import { TranslationContext } from './context';

const translations = {
  'en-US': en,
  'de-DE': de,
  'ru-RU': ru,
  'fr-FR': fr,
  'zh-CN': ch,
  en,
  de,
  ru,
  fr,
  ch,
};

type KnownLocales = keyof typeof translations;

export interface TranslactionContextType {
  t: (input: keyof typeof en) => string;
  locale: string;
}

export function TranslationProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [locale, setLocale] = useState<KnownLocales>('en-US');
  const t = (key: string): string => translations[locale][key] || key;

  useEffect(() => {
    window.api.getLocale().then((detectedLocale) => {
      if (Object.keys(translations).includes(detectedLocale)) {
        setLocale(detectedLocale as KnownLocales);
      } else {
        // Fallback to English if detected locale is not supported
        setLocale('en-US');
      }
    });
  }, []);

  return (
    <TranslationContext.Provider value={{ t, locale }}>{children}</TranslationContext.Provider>
  );
}
