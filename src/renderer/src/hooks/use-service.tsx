import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { ProxyOptions } from '@shared';

import { useHandleAsyncAction } from "./handle-async-action";

export type ServiceContextType = {
  enabled: boolean;
  setServiceEnabled: (input: boolean) => void;

  options: ProxyOptions;
  toggleOption: (input: Partial<ProxyOptions>) => Promise<void>;
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

  const [options, setOptions] = useState<ProxyOptions>({});
  const [loadOptionsPromise, setLoadOptionsPromise] = useState<Promise<void>>();

  useEffect(() => {
    if (loadOptionsPromise) return;
    setLoadOptionsPromise(
      window.api.loadOptions('default').then((loadedOptions) => {
        setOptions(loadedOptions);
      }),
    );
  }, [options]);

  const toggleOption = useCallback(async (changes: Partial<ProxyOptions>) => {
    await handleAsyncAction(async () => {
      const newOptions: ProxyOptions = {
        ...options,
        ...changes,
      };
      await window.api.applyOptions('default', newOptions);
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

  const enableService = useCallback((space: string) => {
    handleAsyncAction(async () => {
      await window.api.startProxyInstance(space);
      setServiceEnabled(true);
    });
  }, []);

  const disableService = useCallback((space: string) => {
    handleAsyncAction(async () => {
      await window.api.stopProxyInstance(space);
      setServiceEnabled(false);
    });
  }, []);

  return {
    enabled,
    enableService,
    disableService,
    describeInstance: (space: string) => {
      return window.api.describeProxyInstance(space);
    },

    toggleOption: (input: Partial<ProxyOptions>) => {
      handleAsyncAction(async () => {
        await toggleOption(input);
      });
    },
    options,
  };
}
