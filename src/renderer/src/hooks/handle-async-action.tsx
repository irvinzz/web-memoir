import { createContext, useCallback, useContext, useState } from 'react';

import {
  Alert,
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

import { useTranslation } from '@renderer/localization/hook';

interface PromptOptions<T> {
  title: string;
  content: (props: { value: T; onChange: (e: { value: T }) => void }) => React.JSX.Element;
}

interface PromptDialogProps<T> extends PromptOptions<T> {
  onOk: (value: T) => void;
  onCancel: () => void;
  initialValue?: T;
}

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
  promptDialogProps: PromptDialogProps<any> | null;
  setPromptDialogProps: (props: PromptDialogProps<any> | null) => void;
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
  promptDialogProps: null,
  setPromptDialogProps: () => {},
});

export function LoadingProvider(props: { children?: React.ReactNode }): React.JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [confirmAnswerHandler, setConfirmAnswerHandler] = useState<
    ((answer: 'YES' | 'NO') => void) | null
  >(null);
  const [promptDialogProps, setPromptDialogProps] = useState<PromptDialogProps<any> | null>(null);

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
        promptDialogProps,
        setPromptDialogProps,
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
  prompt: <T>(
    props: PromptOptions<T>,
    initialValue?: T
  ) => Promise<{ value: T } | { cancelled: true }>;
} {
  const {
    loading,
    setLoading,
    setError,
    setConfirmDialogVisible,
    setConfirmAnswerHandler,
    setPromptDialogProps,
  } = useContext(LoadingContext);

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

  const prompt = useCallback(
    async function <T>(props: PromptOptions<T>, initialValue?: T) {
      return new Promise<{ value: T } | { cancelled: true }>((resolve) => {
        setPromptDialogProps({
          ...props,
          initialValue,
          onOk(value: T) {
            resolve({ value });
            setPromptDialogProps(null);
          },
          onCancel() {
            resolve({ cancelled: true });
          },
        });
      });
    },
    [setPromptDialogProps]
  );

  return {
    handleAsyncAction,
    loading,
    confirm,
    prompt,
  };
}

export function UIHelpersElement(): React.JSX.Element {
  const { t } = useTranslation();

  const {
    loading,
    error,
    setError,
    confirmDialogVisible,
    confirmYes,
    confirmNo,
    promptDialogProps,
  } = useContext(LoadingContext);

  const [promptValue, setPromptValue] = useState<any>(promptDialogProps?.initialValue);

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
      <Dialog open={!!promptDialogProps}>
        <DialogTitle>{promptDialogProps?.title}</DialogTitle>
        <DialogContent>
          {promptDialogProps?.content({
            value: promptValue,
            onChange: (e) => setPromptValue(e.value),
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => promptDialogProps?.onOk(promptValue)}>{t('ok')}</Button>
          <Button onClick={promptDialogProps?.onCancel}>{t('cancel')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
