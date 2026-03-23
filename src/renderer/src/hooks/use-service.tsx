import { useCallback, useEffect, useState } from 'react';

import { IPCResponse, ProxyInstanceDescription, START_SERVICE_CODES } from '@shared';

export function useService(space?: string): {
  enabled: boolean;
  startService: () => Promise<IPCResponse<START_SERVICE_CODES, ProxyInstanceDescription>>;
  disableService: () => Promise<void>;
  describeInstance: () => Promise<{ port: number } | null>;
} {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [catchedSpace, setCatchedSpace] = useState<string>();
  const [loadSettingsPromise, setLoadSettingsPromise] = useState<Promise<void>>();

  useEffect(() => {
    if (!space) return;
    if (loadSettingsPromise && catchedSpace === space) return;
    setCatchedSpace(space);
    setLoadSettingsPromise(
      Promise.all([window.api.describeProxyInstance(space)]).then(([proxyInstance]) => {
        if (proxyInstance) {
          setEnabled(true);
        } else {
          setEnabled(false);
        }
      })
    );
  }, [catchedSpace, loadSettingsPromise, space]);

  useEffect(() => {
    const unbindListener = window.electron.ipcRenderer.on('serviceStopped', () => {
      setEnabled(false);
    });
    return () => {
      unbindListener();
    };
  }, [setEnabled]);

  const startService = useCallback(async (): Promise<IPCResponse<START_SERVICE_CODES, ProxyInstanceDescription>> => {
    const result = await window.api.startProxyInstance(space!);
    if (result.code === 'OK') {
      setEnabled(true);
    }
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
  };
}
