import { Backdrop, CircularProgress } from "@mui/material";
import { createContext, useCallback, useContext, useState } from "react";

type LoadingContextType = {
  loading: boolean;
  setLoading: (newValue: boolean) => void;
}
const LoadingContext = createContext<LoadingContextType>({
  loading: false,
  setLoading: () => { },
});

export function LoadingProvider(props: {
  children?: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(false);

  return (<LoadingContext.Provider value={{
    loading,
    setLoading,
  }}>
    {props.children}
  </LoadingContext.Provider>)
}

export function useHandleAsyncAction() {
  const { loading, setLoading } = useContext(LoadingContext);
  const handleAsyncAction = useCallback(async (cb: () => Promise<void>) => {
    setLoading(true);
    try {
      await cb();
    } catch (e) {
      // ?
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  return {
    handleAsyncAction,
    loading,
  };
}

export function LoadingMask() {
  const {
    loading,
  } = useContext(LoadingContext);

  console.debug('loading2', loading);

  return (
    <Backdrop
      open={loading}
      sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  )
}
