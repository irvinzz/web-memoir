import { useCallback, useContext } from 'react';

import { PromptOptions } from './interfaces';
import { GlobalDialogsContext } from './context';

export function useGlobalDialogs(): {
  confirm: () => Promise<'YES' | 'NO'>;
  prompt: <T>(
    props: PromptOptions<T>,
    initialValue?: T
  ) => Promise<{ value: T } | { cancelled: true }>;
} {
  const contextValue = useContext(GlobalDialogsContext);
  const { setPromptDialogProps, setConfirmAnswerHandler, setConfirmDialogVisible, setErrors } =
    contextValue;

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
            if (props.validate) {
              const validationResult = props.validate(value);
              if (validationResult !== true) {
                if (validationResult !== false) {
                  setErrors(validationResult);
                }
                return;
              }
            }
            resolve({ value });
            setPromptDialogProps(null);
          },
          onCancel() {
            resolve({ cancelled: true });
            setPromptDialogProps(null);
          },
        });
      });
    },
    [setErrors, setPromptDialogProps]
  );

  return {
    confirm,
    prompt,
  };
}
