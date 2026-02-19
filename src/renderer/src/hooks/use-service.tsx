import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useHandleAsyncAction } from "./handle-async-action";
import { Options } from '@shared';

export type ServiceContextType = {
  enabled: boolean;
  setServiceEnabled: (input: boolean) => void;

  options: Options;
  toggleOption: (input: Partial<Options>) => Promise<void>;
}
export const ServiceContext = createContext<ServiceContextType>({
  enabled: false,
  setServiceEnabled() { },

  options: {},
  async toggleOption() { },
});

export function ServiceProvider(props: {
  children?: React.ReactNode;
}) {
  const {
    handleAsyncAction,
  } = useHandleAsyncAction();

  const [serviceEnabled, setServiceEnabled] = useState(false);

  const [options, setOptions] = useState<Options>({});
  const [loadOptionsPromise, setLoadOptionsPromise] = useState<Promise<void>>();

  useEffect(() => {
    if (loadOptionsPromise) return;
    setLoadOptionsPromise(
      window.api.loadOptions().then((loadedOptions) => {
        setOptions(loadedOptions);
      }),
    );
  }, [options]);

  const toggleOption = useCallback(async (changes: Partial<Options>) => {
    await handleAsyncAction(async () => {
      const newOptions: Options = {
        ...options,
        ...changes,
      };
      await window.api.applyOptions(newOptions);
      setOptions(newOptions);
    });
  }, [options]);

  return (
    <ServiceContext.Provider value={{
      enabled: serviceEnabled,
      setServiceEnabled(input) {
        setServiceEnabled(input);
      },

      toggleOption,
      options: options,
    }}>
      {props.children}
    </ServiceContext.Provider>
  )
}

export function useService() {
  const {
    enabled,
    setServiceEnabled,

    options,
    toggleOption,
  } = useContext(ServiceContext);

  useEffect(() => {
    const unbindListener = window.electron.ipcRenderer.on('serviceStopped', () => {
      setServiceEnabled(false);
    });
    return () => {
      unbindListener();
    };
  }, []);

  const {
    handleAsyncAction,
  } = useHandleAsyncAction();

  const enableService = useCallback(() => {
    handleAsyncAction(async () => {
      await window.api.startService();
      setServiceEnabled(true);
    });
  }, []);

  const disableService = useCallback(() => {
    handleAsyncAction(async () => {
      const result = await window.api.stopService();
      console.debug('result', result);
      setServiceEnabled(false);
    });
  }, []);

  return {
    enabled,
    enableService,
    disableService,

    toggleOption: (input: Partial<Options>) => {
      handleAsyncAction(async () => {
        await toggleOption(input);
      });
    },
    options,
  };
}
