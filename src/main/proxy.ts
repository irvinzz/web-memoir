import { join } from 'node:path';
import { ChildProcess, fork } from 'node:child_process';
import { randomUUID } from 'node:crypto';

import { DBNamePrefix } from '@shared';

import { resourcesDir } from './const';
import { caCrtPath, caKeyPath, createRootCA } from './cert-ca';
import { createLogger } from './logger';
import { ProxySettings } from '../shared/Api';
import { loadProxySettings } from './settings';

const logger = createLogger('proxy');

export interface ProxyStartOptions {
  space: string;
  port: number;
  dbUrl: string;
  onClose: (code: number | null) => void;
}

export async function startProxy(options: ProxyStartOptions): Promise<ChildProcess> {
  const { dbUrl, space, port, onClose } = options;
  await createRootCA();

  const proxyBundleFilePath = join(resourcesDir, 'proxy.bundle.js');

  let proxyOptions: ProxySettings = {};
  try {
    proxyOptions = await loadProxySettings(space);
  } catch (err) {
    logger.warn('Failed to load proxy options, using defaults', err);
  }

  const boolToEnv = (input?: boolean): string => (input ? '1' : '');

  const env = {
    DB_URL: dbUrl,
    DB_NAME: `${DBNamePrefix}${space}`,
    SELF_ADDRESS: `http://localhost:${port}`,
    RCPWD: randomUUID(),
    FETCH_TIMEOUT: '1000',
    UPSTREAM_PROXY: proxyOptions?.useUpstreamProxy ? proxyOptions.upstreamProxyAddress : undefined,
    APP_VERSION: 'wip',
    CA_KEY_PATH: caKeyPath,
    CA_CRT_PATH: caCrtPath,
    OFFLINE_MODE: boolToEnv(proxyOptions?.offline),
    ALLOW_LARGE: boolToEnv(proxyOptions?.allowLarge),
    ALLOW_MEDIA: boolToEnv(proxyOptions?.allowMedia),
  };

  const proxyChildProcess = fork(proxyBundleFilePath, {
    env,
    stdio: 'ignore',
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

  proxyChildProcess.on('close', (code) => {
    logger.info(`Proxy exited with code ${code}`);
    onClose(code);
  });

  proxyChildProcess.on('message', (msg) => {
    logger.debug('child->parent', msg);
  });

  logger.info('Proxy started');

  return proxyChildProcess;
}
