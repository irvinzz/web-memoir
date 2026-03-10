import { useContext } from 'react';
import { TranslationContext } from './context';
import { TranslactionContextType } from './provider';

export const useTranslation = (): TranslactionContextType => {
  const context = useContext(TranslationContext);
  if (!context) throw new Error('TranslationContext missing');

  return context;
};
