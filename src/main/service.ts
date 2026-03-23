import { ChildProcess } from 'node:child_process';

import { app } from 'electron';
import getPort from 'get-port';

import { ProxyInstanceDescription, SpaceSettings } from '../shared/Api';
import { getDBInstance, getRunningDBInstance } from './db';
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
}): Promise<ProxyInstanceDescription> {
  const { spaceName } = options;
  if (proxyInstances.has(spaceName)) {
    throw new Error(`Proxy [${spaceName}] already started`);
  }
  const dbInstance = await getDBInstance();
  dbInstance.process.on('close', onDBStopped);

  const ipAddress = '127.0.0.1';
  const proxyPort = await getPort({ port: 3128, host: ipAddress });
  const proxyInstance = await startProxy({
    dbUrl: `mongodb://localhost:${dbInstance.port}`,
    spaceName,
    port: proxyPort,
    address: ipAddress,
    onClose(code) {
      proxyInstances.delete(options.spaceName);
    },
  });
  proxyInstances.set(options.spaceName, {
    process: proxyInstance,
    port: proxyPort,
    address: ipAddress,
  });

  logger.info('Service started successfully');

  return {
    ip: ipAddress,
    port: proxyPort,
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
  if (getProxyInstance(spaceName)) {
    await stopProxyInstance(spaceName);
    await startProxyInstance({ spaceName });
  }
}

app.on('before-quit', async () => {
  await stopProxyInstances({ allSpaces: true });
});
