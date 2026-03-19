import { useCallback, useEffect, useState } from 'react';

import { ProxyInstanceDescription, ProxySettings } from '@shared';

export function useService(space?: string): {
  enabled: boolean;
  startService: () => Promise<ProxyInstanceDescription>;
  disableService: () => Promise<void>;
  describeInstance: () => Promise<{ port: number } | null>;
  toggleSettings: (input: Partial<ProxySettings>) => Promise<void>;
  settings: ProxySettings;
} {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [settings, setSettings] = useState<ProxySettings>({});
  const [catchedSpace, setCatchedSpace] = useState<string>();
  const [loadSettingsPromise, setLoadSettingsPromise] = useState<Promise<void>>();

  useEffect(() => {
    if (!space) return;
    if (loadSettingsPromise && catchedSpace === space) return;
    setCatchedSpace(space);
    setLoadSettingsPromise(
      Promise.all([window.api.loadOptions(space), window.api.describeProxyInstance(space)]).then(
        ([loadedOptions, proxyInstance]) => {
          setSettings(loadedOptions);
          if (proxyInstance) {
            setEnabled(true);
          } else {
            setEnabled(false);
          }
        }
      )
    );
  }, [catchedSpace, loadSettingsPromise, settings, space]);

  const toggleSettings = useCallback(
    async (settingsChanges: Partial<ProxySettings>) => {
      if (!space) return;
      const newSettings: ProxySettings = {
        ...settings,
        ...settingsChanges,
      };
      await window.api.applyOptions(space, newSettings);
      setSettings(newSettings);
      setLoadSettingsPromise(undefined);
    },
    [settings, space]
  );

  useEffect(() => {
    const unbindListener = window.electron.ipcRenderer.on('serviceStopped', () => {
      setEnabled(false);
    });
    return () => {
      unbindListener();
    };
  }, [setEnabled]);

  const startService = useCallback(async (): Promise<ProxyInstanceDescription> => {
    const result = await window.api.startProxyInstance(space!);
    setEnabled(true);
    return result;
  }, [space]);

  const disableService = useCallback(async () => {
    await window.api.stopProxyInstance(space!);
    setEnabled(false);
  }, [space]);

  return {
    enabled,
    startService,
    disableService,
    describeInstance: () => {
      return window.api.describeProxyInstance(space!);
    },

    toggleSettings,
    settings,
  };
}
