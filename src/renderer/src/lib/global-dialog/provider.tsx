import { useCallback, useEffect, useState } from 'react';

import { useTranslation } from '@renderer/localization/hook';

import { PromptDialogProps, PromptErrors } from './interfaces';
import { GlobalDialogsContext } from './context';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

export function GlobalDialogsProvider(props: { children?: React.ReactNode }): React.JSX.Element {
  const { t } = useTranslation();

  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [confirmAnswerHandler, setConfirmAnswerHandler] = useState<
    ((answer: 'YES' | 'NO') => void) | null
  >(null);

  const confirmYes = useCallback(() => {
    confirmAnswerHandler?.('YES');
    setConfirmDialogVisible(false);
  }, [confirmAnswerHandler]);

  const confirmNo = useCallback(() => {
    confirmAnswerHandler?.('NO');
    setConfirmDialogVisible(false);
  }, [confirmAnswerHandler]);

  const [promptDialogProps, setPromptDialogProps] = useState<PromptDialogProps<any> | null>(null);
  const [promptValue, setPromptValue] = useState<any>(promptDialogProps?.initialValue);
  const [errors, setErrors] = useState<PromptErrors<any>>({});

  useEffect(() => {
    setPromptValue(promptDialogProps?.initialValue);
    setErrors({});
  }, [promptDialogProps?.initialValue]);

  return (
    <GlobalDialogsContext.Provider
      value={{
        confirmDialogVisible,
        setConfirmDialogVisible,
        setConfirmAnswerHandler,

        promptDialogProps,
        setPromptDialogProps,
        errors,
        setErrors,
      }}
    >
      <Dialog open={confirmDialogVisible} sx={(theme) => ({ zIndex: theme.zIndex.drawer + 10100 })}>
        <DialogTitle>{t('areYouSure')}</DialogTitle>
        <DialogActions>
          <Button onClick={() => confirmYes()}>{t('yes')}</Button>
          <Button onClick={() => confirmNo()}>{t('no')}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!promptDialogProps}>
        <DialogTitle>{promptDialogProps?.title}</DialogTitle>
        <DialogContent>
          {promptDialogProps?.content({
            value: promptValue,
            onChange: (e) => setPromptValue(e.value),
            errors,
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => promptDialogProps?.onOk(promptValue)}>{t('ok')}</Button>
          <Button onClick={promptDialogProps?.onCancel}>{t('cancel')}</Button>
        </DialogActions>
      </Dialog>
      {props.children}
    </GlobalDialogsContext.Provider>
  );
}
