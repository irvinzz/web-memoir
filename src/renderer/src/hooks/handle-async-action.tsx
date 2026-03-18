import { createContext, useCallback, useContext, useState } from 'react';

import {
  Alert,
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

type LoadingContextType = {
  loading: boolean;
  setLoading: (newValue: boolean) => void;
  error: string | null;
  setError: (newValue: string | null) => void;
  progress: number | null;
  setProgress: (newProgress: number | null) => void;
  confirmDialogVisible: boolean;
  setConfirmDialogVisible: (visible: boolean) => void;
  confirmYes: () => void;
  confirmNo: () => void;
  setConfirmAnswerHandler: (handler: (answer: 'YES' | 'NO') => void) => void;
};
const LoadingContext = createContext<LoadingContextType>({
  loading: false,
  setLoading: () => {},
  error: null,
  setError: () => {},
  progress: null,
  setProgress: () => {},
  confirmDialogVisible: false,
  setConfirmDialogVisible: () => {},
  confirmYes: () => {},
  confirmNo: () => {},
  setConfirmAnswerHandler: () => {},
});

export function LoadingProvider(props: { children?: React.ReactNode }): React.JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [confirmAnswerHandler, setConfirmAnswerHandler] = useState<
    ((answer: 'YES' | 'NO') => void) | null
  >(null);

  return (
    <LoadingContext.Provider
      value={{
        loading,
        setLoading,
        error,
        setError,
        progress,
        setProgress,
        confirmDialogVisible,
        setConfirmDialogVisible,
        confirmYes() {
          confirmAnswerHandler?.('YES');
          setConfirmDialogVisible(false);
        },
        confirmNo() {
          confirmAnswerHandler?.('NO');
          setConfirmDialogVisible(false);
        },
        setConfirmAnswerHandler,
      }}
    >
      {props.children}
    </LoadingContext.Provider>
  );
}

export function useHandleAsyncAction(): {
  handleAsyncAction(cb: () => Promise<void>): void;
  loading: boolean;
  confirm: () => Promise<'YES' | 'NO'>;
} {
  const { loading, setLoading, setError, setConfirmDialogVisible, setConfirmAnswerHandler } = useContext(LoadingContext);

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

  const confirm = useCallback(async () => {
    setConfirmDialogVisible(true);
    return new Promise<'YES' | 'NO'>((resolve) => {
      setConfirmAnswerHandler(() => (answer) => {
        resolve(answer);
      });
    });
  }, [setConfirmAnswerHandler, setConfirmDialogVisible]);

  return {
    handleAsyncAction,
    loading,
    confirm,
  };
}

export function LoadingMask(): React.JSX.Element {
  const { loading, error, setError, confirmDialogVisible, confirmYes, confirmNo } = useContext(LoadingContext);

  return (
    <>
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
      <Dialog open={confirmDialogVisible} sx={(theme) => ({ zIndex: theme.zIndex.drawer + 10100 })}>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogActions>
          <Button onClick={() => confirmYes()}>Yes</Button>
          <Button onClick={() => confirmNo()}>No</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
