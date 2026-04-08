export type LoadingContextType = {
  loading: boolean;
  setLoading: (newValue: boolean) => void;
  error: string | null;
  setError: (newValue: string | null) => void;
  progress: number | null;
  setProgress: (newProgress: number | null) => void;
};
