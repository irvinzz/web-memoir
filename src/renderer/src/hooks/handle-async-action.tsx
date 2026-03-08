import { createContext, useCallback, useContext, useState } from 'react';

import { Alert, Backdrop, CircularProgress } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

type LoadingContextType = {
  loading: boolean;
  setLoading: (newValue: boolean) => void;
  error: string | null;
  setError: (newValue: string | null) => void;
  progress: number | null;
  setProgress: (newProgress: number | null) => void;
};
const LoadingContext = createContext<LoadingContextType>({
  loading: false,
  setLoading: () => {},
  error: null,
  setError: () => {},
  progress: null,
  setProgress: () => {},
});

export function LoadingProvider(props: { children?: React.ReactNode }): React.JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  return (
    <LoadingContext.Provider
      value={{
        loading,
        setLoading,
        error,
        setError,
        progress,
        setProgress,
      }}
    >
      {props.children}
    </LoadingContext.Provider>
  );
}

export function useHandleAsyncAction(): {
  handleAsyncAction(cb: () => Promise<void>): void;
  loading: boolean;
} {
  const { loading, setLoading, setError } = useContext(LoadingContext);

  const handleAsyncAction = useCallback(
    async (cb: () => Promise<void>) => {
      setLoading(true);
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
        setLoading(false);
      }
    },
    [setError, setLoading]
  );

  return {
    handleAsyncAction,
    loading,
  };
}

export function LoadingMask(): React.JSX.Element {
  const { loading, error, setError } = useContext(LoadingContext);

  return (
    <>
      <Backdrop open={loading} sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Backdrop
        open={Boolean(error)}
        onClick={() => setError(null)}
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
      >
        <Alert icon={<CheckIcon fontSize="inherit" />} severity="error">
          {error}
        </Alert>
      </Backdrop>
    </>
  );
}
