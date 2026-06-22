import { useCallback, useContext } from 'react';
import { asyncTimeout } from '@shared';

import { LoadingContext } from './context';

export function useHandleAsyncAction(): {
  handleAsyncAction(cb: () => Promise<void>, masked?: boolean, timeout?: number): void;
  loading: boolean;
} {
  const { loading, setLoading, setError } = useContext(LoadingContext);

  const handleAsyncAction = useCallback(
    async (cb: () => Promise<void>, masked = true, timeout = 30000) => {
      if (masked) setLoading(true);
      try {
        await Promise.race([
          cb(),
          asyncTimeout(timeout).then(() => Promise.reject({ message: `Timeout [${timeout}]` })),
        ]);
      } catch (e) {
        if (
          typeof e === 'object' &&
          e !== null &&
          'message' in e &&
          typeof e.message === 'string'
        ) {
          setError(e.message);
        }
      } finally {
        if (masked) setLoading(false);
      }
    },
    [setError, setLoading]
  );

  return {
    handleAsyncAction,
    loading,
  };
}
