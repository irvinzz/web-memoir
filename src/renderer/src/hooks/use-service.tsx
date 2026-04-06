import { useCallback, useEffect, useState } from 'react';

import { IPCResponse, ProxyInstanceDescription, START_SERVICE_CODES } from '@shared';

export function useService(spaceName?: string): {
  enabled: boolean;
  startService: () => Promise<IPCResponse<START_SERVICE_CODES, ProxyInstanceDescription>>;
  disableService: () => Promise<void>;
  describeInstance: () => Promise<{ port: number } | null>;
} {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [catchedSpaceName, setCatchedSpaceName] = useState<string>();
  const [loadSettingsPromise, setLoadSettingsPromise] = useState<Promise<void>>();

  useEffect(() => {
    if (!spaceName) return;
    if (loadSettingsPromise && catchedSpaceName === spaceName) return;
    setCatchedSpaceName(spaceName);
    setLoadSettingsPromise(
      Promise.all([window.api.describeProxyInstance(spaceName)]).then(([proxyInstance]) => {
        if (proxyInstance) {
          setEnabled(true);
        } else {
          setEnabled(false);
        }
      })
    );
  }, [catchedSpaceName, loadSettingsPromise, spaceName]);

  useEffect(() => {
    const unbindProxyStoppedListener = window.electron.ipcRenderer.on(
      'proxy.stopped',
      (_event, _data) => {
        const data = _data as { spaceName: string };
        if (data.spaceName === spaceName) {
          setEnabled(false);
        }
      }
    );
    const unbindProxyStartedListener = window.electron.ipcRenderer.on(
      'proxy.started',
      (_event, _data) => {
        const data = _data as { spaceName: string; data: ProxyInstanceDescription };
        if (data.spaceName === spaceName) {
          setEnabled(true);
        }
      }
    );

    return () => {
      unbindProxyStoppedListener();
      unbindProxyStartedListener();
    };
  }, [setEnabled, spaceName]);

  const startService = useCallback(async (): Promise<
    IPCResponse<START_SERVICE_CODES, ProxyInstanceDescription>
  > => {
    const result = await window.api.startProxyInstance(spaceName!);
    if (result.code === 'OK') {
      setEnabled(true);
    }
    return result;
  }, [spaceName]);

  const disableService = useCallback(async () => {
    await window.api.stopProxyInstance(spaceName!);
    setEnabled(false);
  }, [spaceName]);

  return {
    enabled,
    startService,
    disableService,
    describeInstance: () => {
      return window.api.describeProxyInstance(spaceName!);
    },
  };
}
