import { join } from 'node:path';
import { ChildProcess, fork } from 'node:child_process';
import { randomUUID } from 'node:crypto';

import getPort from 'get-port';

import { transformSpaceNameToDBName } from '@shared';

import { resourcesDir } from './const';
import { caCrtPath, caKeyPath, createRootCA } from './cert-ca';
import { createLogger } from './logger';
import { SpaceSettings } from '../shared/Api';
import { waitProcessPort } from './process';
import { loadSpace } from './spaces';

const logger = createLogger('proxy');

export interface ProxyStartOptions {
  spaceName: string;
  previousInstancePort?: number;
  dbUrl: string;
  onClose: (code: number | null) => void;
}

export async function startProxy(options: ProxyStartOptions): Promise<{
  address: string;
  port: number;
  process: ChildProcess;
}> {
  const { dbUrl, spaceName, previousInstancePort, onClose } = options;
  await createRootCA();

  const proxyBundleFilePath = join(resourcesDir, 'proxy.bundle.js');

  let spaceSettings: SpaceSettings = {};
  try {
    spaceSettings = (await loadSpace(spaceName)).settings || {};
  } catch (err) {
    logger.warn('Failed to load proxy options, using defaults', err);
  }

  const ipAddress = spaceSettings.allowIncomingConnections ? '0.0.0.0' : '127.0.0.1';
  const proxyPort =
    spaceSettings.fixedPort ||
    previousInstancePort ||
    (await getPort({ port: 3128, host: ipAddress }));

  const boolToEnv = (input?: boolean): string => (input ? '1' : '');

  const env = {
    PORT: proxyPort.toString(),
    HOST: ipAddress,
    DB_URL: dbUrl,
    DB_NAME: transformSpaceNameToDBName(spaceName),
    SELF_ADDRESS: `http://localhost:${proxyPort}`,
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

  await waitProcessPort(proxyChildProcess, proxyPort);

  proxyChildProcess.on('close', onClose);

  return {
    process: proxyChildProcess,
    address: ipAddress,
    port: proxyPort,
  };
}
