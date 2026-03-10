import { useContext } from 'react';
import { TranslationContext } from './context';
import { TranslactionContextType } from './provider';

export const useTranslation = (): TranslactionContextType => useContext(TranslationContext);
