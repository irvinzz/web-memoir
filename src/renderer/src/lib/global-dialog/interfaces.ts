export interface PromptOptions<T> {
  title: string;
  validate?: (input: T) => true | false | PromptErrors<T>;
  content: (props: {
    value: T;
    onChange: (e: { value: T }) => void;
    errors: PromptErrors<T>;
  }) => React.JSX.Element;
}

export interface PromptDialogProps<T> extends PromptOptions<T> {
  onOk: (value: T) => void;
  onCancel: () => void;
  initialValue?: T;
}

export type PromptErrors<T> = Partial<Record<keyof T, string>>;

export interface GlobalDialogsContextType<T> {
  confirmDialogVisible: boolean;
  setConfirmDialogVisible: (visible: boolean) => void;
  setConfirmAnswerHandler: (handler: (answer: 'YES' | 'NO') => void) => void;
  promptDialogProps: PromptDialogProps<T> | null;
  setPromptDialogProps: (props: PromptDialogProps<T> | null) => void;
  errors: PromptErrors<T>;
  setErrors: (newErrors: PromptErrors<T>) => void;
}
