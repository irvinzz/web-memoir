import { useState } from 'react';

import en from '../locales/en.json';
import de from '../locales/de.json';
import ru from '../locales/ru.json';
import { TranslationContext } from './context';

const translations = {
  en,
  de,
  ru,
};

export interface TranslactionContextType {
  t: (input: string) => string;
}

export function TranslationProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [locale, setLocale] = useState('en');
  const t = (key: string): string => translations[locale][key];

  return <TranslationContext.Provider value={{ t }}>{children}</TranslationContext.Provider>;
}
