import { createContext } from 'react';

import { LoadingContextType } from './interfaces';

export const LoadingContext = createContext<LoadingContextType>({
  loading: false,
  setLoading: () => {},
  error: null,
  setError: () => {},
  progress: null,
  setProgress: () => {},
});
