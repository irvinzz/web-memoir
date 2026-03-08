import { useCallback, useEffect, useState } from 'react';

import { ProxyOptions } from '@shared';

import { useHandleAsyncAction } from './handle-async-action';

export function useService(space: string): {
  enabled: boolean;
  enableService: () => void;
  disableService: () => void;
  describeInstance: () => Promise<{ port: number } | null>;
  toggleOption: (input: Partial<ProxyOptions>) => void;
  options: ProxyOptions;
} {
  const { handleAsyncAction } = useHandleAsyncAction();

  const [enabled, setEnabled] = useState<boolean>(false);
  const [options, setOptions] = useState<ProxyOptions>({});
  const [loadOptionsPromise, setLoadOptionsPromise] = useState<Promise<void>>();

  useEffect(() => {
    if (loadOptionsPromise) return;
    setLoadOptionsPromise(
      Promise.all([window.api.loadOptions(space), window.api.describeProxyInstance(space)]).then(
        ([loadedOptions, proxyInstance]) => {
          setOptions(loadedOptions);
          if (proxyInstance) {
            setEnabled(true);
          }
        }
      )
    );
  }, [loadOptionsPromise, options, space]);

  const toggleOption = useCallback(
    async (changes: Partial<ProxyOptions>) => {
      await handleAsyncAction(async () => {
        const newOptions: ProxyOptions = {
          ...options,
          ...changes,
        };
        await window.api.applyOptions(space, newOptions);
        setOptions(newOptions);
        setLoadOptionsPromise(undefined);
      });
    },
    [handleAsyncAction, options, space]
  );

  useEffect(() => {
    const unbindListener = window.electron.ipcRenderer.on('serviceStopped', () => {
      setEnabled(false);
    });
    return () => {
      unbindListener();
    };
  }, [setEnabled]);

  const enableService = useCallback(() => {
    handleAsyncAction(async () => {
      await window.api.startProxyInstance(space);
      setEnabled(true);
    });
  }, [handleAsyncAction, space]);

  const disableService = useCallback(() => {
    handleAsyncAction(async () => {
      await window.api.stopProxyInstance(space);
      setEnabled(false);
    });
  }, [handleAsyncAction, space]);

  return {
    enabled,
    enableService,
    disableService,
    describeInstance: () => {
      return window.api.describeProxyInstance(space);
    },

    toggleOption: (input) => {
      handleAsyncAction(async () => {
        await toggleOption(input);
      });
    },
    options,
  };
}
