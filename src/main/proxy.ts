import { join } from 'node:path';
import { ChildProcess, fork } from 'node:child_process';
import { randomUUID } from 'node:crypto';

import { transformSpaceNameToDBName } from '@shared';

import { resourcesDir } from './const';
import { caCrtPath, caKeyPath, createRootCA } from './cert-ca';
import { createLogger } from './logger';
import { SpaceSettings } from '../shared/Api';
import { waitProcessPort } from './process';
import { loadSpace } from './spaces';

const logger = createLogger('proxy');

export interface ProxyStartOptions {
  space: string;
  port: number;
  address: string;
  dbUrl: string;
  onClose: (code: number | null) => void;
}

export async function startProxy(options: ProxyStartOptions): Promise<ChildProcess> {
  const { dbUrl, space, port, onClose } = options;
  await createRootCA();

  const proxyBundleFilePath = join(resourcesDir, 'proxy.bundle.js');

  let spaceSettings: SpaceSettings = {};
  try {
    spaceSettings = (await loadSpace(space)).settings || {};
  } catch (err) {
    logger.warn('Failed to load proxy options, using defaults', err);
  }

  const boolToEnv = (input?: boolean): string => (input ? '1' : '');

  const env = {
    PORT: port.toString(),
    HOST: '127.0.0.1',
    DB_URL: dbUrl,
    DB_NAME: transformSpaceNameToDBName(space),
    SELF_ADDRESS: `http://localhost:${port}`,
    RCPWD: randomUUID(),
    FETCH_TIMEOUT: '1000',
    UPSTREAM_PROXY: spaceSettings?.useUpstreamProxy
      ? spaceSettings.upstreamProxyAddress
      : undefined,
    APP_VERSION: 'wip',
    CA_KEY_PATH: caKeyPath,
    CA_CRT_PATH: caCrtPath,
    OFFLINE_MODE: boolToEnv(spaceSettings?.offline),
    ALLOW_LARGE: boolToEnv(spaceSettings?.allowLarge),
    ALLOW_MEDIA: boolToEnv(spaceSettings?.allowMedia),
  };

  const proxyChildProcess = fork(proxyBundleFilePath, {
    env,
    stdio: 'pipe',
  });

  proxyChildProcess.stdout?.on('data', (msg) => {
    logger.debug(msg.toString());
  });

  proxyChildProcess.stderr?.on('data', (msg) => {
    logger.error(msg.toString());
  });

  proxyChildProcess.on('error', (err) => {
    logger.error('Proxy process error', err);
  });

  logger.info('Proxy started');

  await waitProcessPort(proxyChildProcess, port);

  proxyChildProcess.on('close', onClose);

  return proxyChildProcess;
}
