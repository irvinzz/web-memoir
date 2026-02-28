import { ChildProcess } from 'node:child_process';

import { app } from 'electron';
import getPort from 'get-port';

import { ProxyOptions } from '../shared/Api';
import { getDBInstance, getRunningDBInstance } from './db';
import { startProxy } from './proxy';
import { createLogger } from './logger';
import { writeOptions } from './options';

const logger = createLogger('service');

export interface ProxyInstance {
  process: ChildProcess;
  port: number;
}

const proxyInstances: Map<string, ProxyInstance> = new Map();

export function getProxyInstance(space: string) {
  return proxyInstances.get(space);
}

function onDBStopped(code: number | null) {
  // 
}

export async function startProxyInstance(options: {
  space: string;
}): Promise<void> {
  const { space } = options;
  const dbInstance = await getDBInstance({ onClose: onDBStopped });
  const proxyPort = await getPort({ port: 3128 });
  const proxyInstance = await startProxy({
    dbUrl: `mongodb://localhost:${dbInstance.port}`,
    space: space,
    port: proxyPort,
    onClose(code) {
      //
    },
  });
  proxyInstances.set(options.space, {
    process: proxyInstance,
    port: proxyPort,
  });
  logger.info('Service started successfully');
}

export async function stopProxyInstances(
  options: { space: string } | { allSpaces: true },
): Promise<void> {
  const spacesToStop = proxyInstances.keys().filter(
    space => {
      if ('allSpaces' in options) {
        return true;
      } else if ('space' in options) {
        return options.space === space;
      }
      return false;
    }
  )
  for (const space of spacesToStop) {
    await stopProxyInstance(space);
  }
  if (proxyInstances.size === 0) {
    logger.info('Stopping db instance');
    const dbInstance = getRunningDBInstance();
    if (dbInstance) {
      await stopProcess(dbInstance.process);
    }
  }
}

async function stopProxyInstance(space: string) {
  const proxyProcess = getProxyInstance(space)?.process
  if (proxyProcess) {
    await stopProcess(proxyProcess);
  }
  proxyInstances.delete(space);
}

export async function applyOptions(
  options: { space: string },
  newProxyOptions: ProxyOptions,
): Promise<void> {
  const { space } = options;
  await writeOptions({ space }, newProxyOptions);
  if (getProxyInstance(space)) {
    await stopProxyInstance(space);
    await startProxyInstance({ space });
  }
}

export async function stopProcess(
  childProcess: ChildProcess
): Promise<void> {
  return new Promise<void>((resolve) => {
    childProcess!.on('close', () => {
      resolve();
    });
    childProcess!.kill('SIGTERM');
  });
}

app.on('before-quit', async () => {
  await stopProxyInstances({ allSpaces: true });
});
