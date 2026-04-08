import { useState } from 'react';

import { Alert, Backdrop, CircularProgress } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

import { LoadingContext } from './context';

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
      <Backdrop
        open={loading}
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 10000 })}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Backdrop
        open={Boolean(error)}
        onClick={() => setError(null)}
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 10000 })}
      >
        <Alert icon={<CheckIcon fontSize="inherit" />} severity="error">
          {error}
        </Alert>
      </Backdrop>
      {props.children}
    </LoadingContext.Provider>
  );
}
