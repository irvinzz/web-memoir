import { ChildProcess } from 'node:child_process';

import { app } from 'electron';

import {
  IPCResponse,
  ProxyInstanceDescription,
  SpaceSettings,
  START_SERVICE_CODES,
} from '../shared/Api';
import { DBInstanceDescription, getDBInstance, getRunningDBInstance } from './db';
import { startProxy } from './proxy';
import { createLogger } from './logger';
import { writeSpaceSettings } from './spaces';
import { stopBrowserInstance } from './browser';
import { stopProcess } from './process';

const logger = createLogger('service');

export interface ProxyInstance {
  process: ChildProcess;
  port: number;
  address: string;
}

const proxyInstances: Map<string, ProxyInstance> = new Map();

export function getProxyInstance(space: string): ProxyInstance | undefined {
  return proxyInstances.get(space);
}

function onDBStopped(): void {
  stopProxyInstances({ allSpaces: true });
}

export async function startProxyInstance(options: {
  spaceName: string;
  portOverride?: number;
}): Promise<IPCResponse<START_SERVICE_CODES, ProxyInstanceDescription>> {
  const { spaceName, portOverride } = options;
  if (proxyInstances.has(spaceName)) {
    throw new Error(`Proxy [${spaceName}] already started`);
  }
  let dbInstance: DBInstanceDescription;
  try {
    dbInstance = await getDBInstance();
  } catch (e) {
    if (typeof e === 'object' && e !== null && 'exitCode' in e && e.exitCode === 3221225781) {
      return {
        code: 'MSVC_RUNTIME_MISSING',
      };
    } else {
      throw e;
    }
  }
  dbInstance.process.on('close', onDBStopped);

  const proxyInstance = await startProxy({
    dbUrl: `mongodb://localhost:${dbInstance.port}`,
    spaceName,
    portOverride,
    onClose(code) {
      proxyInstances.delete(options.spaceName);
    },
  });

  proxyInstances.set(options.spaceName, proxyInstance);

  logger.info('Service started successfully');

  return {
    code: 'OK',
    data: {
      ip: proxyInstance.address,
      port: proxyInstance.port,
    },
  };
}

export async function stopProxyInstances(
  options: { spaceName: string } | { allSpaces: true }
): Promise<void> {
  const spacesToStop = proxyInstances.keys().filter((space) => {
    if ('allSpaces' in options) {
      return true;
    } else if ('spaceName' in options) {
      return options.spaceName === space;
    }
    return false;
  });
  for (const spaceName of spacesToStop) {
    await stopBrowserInstance(spaceName);
    await stopProxyInstance(spaceName);
    proxyInstances.delete(spaceName);
  }
  if (proxyInstances.size === 0) {
    logger.info('Stopping db instance');
    const dbInstance = getRunningDBInstance();
    if (dbInstance) {
      await stopProcess(dbInstance.process);
    }
  }
}

async function stopProxyInstance(space: string): Promise<void> {
  const proxyProcess = getProxyInstance(space)?.process;
  if (proxyProcess) {
    await stopProcess(proxyProcess);
  }
  proxyInstances.delete(space);
}

export async function applySpaceSettings(
  options: { spaceName: string },
  newProxyOptions: SpaceSettings
): Promise<void> {
  const { spaceName } = options;
  await writeSpaceSettings(spaceName, newProxyOptions);
  const proxyInstance = getProxyInstance(spaceName);
  if (proxyInstance) {
    await stopProxyInstance(spaceName);
    await startProxyInstance({ spaceName, portOverride: proxyInstance.port });
  }
}

app.on('before-quit', async () => {
  await stopProxyInstances({ allSpaces: true });
});
