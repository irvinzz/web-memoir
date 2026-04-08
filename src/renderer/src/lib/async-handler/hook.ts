import { useCallback, useContext } from 'react';

import { LoadingContext } from './context';

export function useHandleAsyncAction(): {
  handleAsyncAction(cb: () => Promise<void>, masked?: boolean): void;
  loading: boolean;
} {
  const { loading, setLoading, setError } = useContext(LoadingContext);

  const handleAsyncAction = useCallback(
    async (cb: () => Promise<void>, masked = true) => {
      if (masked) setLoading(true);
      try {
        await cb();
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
