import { createContext } from 'react';

import { GlobalDialogsContextType } from './interfaces';

export const GlobalDialogsContext = createContext<GlobalDialogsContextType<any>>({
  confirmDialogVisible: false,
  setConfirmDialogVisible: () => {},
  setConfirmAnswerHandler: () => {},

  promptDialogProps: null,
  setPromptDialogProps: () => {},

  errors: {},
  setErrors: () => {},
});
