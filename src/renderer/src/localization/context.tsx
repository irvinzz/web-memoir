import { createContext } from 'react';

import { TranslactionContextType } from './provider';

export const TranslationContext = createContext<TranslactionContextType | null>(null);
