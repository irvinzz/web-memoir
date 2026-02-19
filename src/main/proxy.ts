import { join } from 'node:path';
import { ChildProcess, fork } from 'node:child_process';
import { randomUUID } from 'node:crypto';

import { resourcesDir } from './const';
import { loadOptions } from './service';
import { caCrtPath, caKeyPath, createRootCA } from './cert-ca';
import { createLogger } from './logger';

const logger = createLogger('proxy');

let proxyChildProcess: ChildProcess | null = null;

export interface ProxyStartOptions {
  /**
   * Callback that is invoked when the proxy process exits.
   * The `code` is the exit code or `null` if terminated by a signal.
   */
  onClose: (code: number | null) => void;
}

/**
 * Spawns the proxy child process with environment variables derived
 * from the user options.
 */
export async function startProxy(options: ProxyStartOptions): Promise<void> {
  await createRootCA();
  if (proxyChildProcess) {
    logger.warn('Proxy already running – stopping existing instance');
    await stopProxy();
  }

  const proxyBundleFilePath = join(resourcesDir, 'test.js');

  let appOptions: any = {};
  try {
    appOptions = await loadOptions();
  } catch (err) {
    logger.warn('Failed to load proxy options, using defaults', err);
  }

  const boolToEnv = (input?: boolean): string => (input ? '1' : '');

  const env = {
    DB_URL: '',
    DB_NAME: 'sitedump',
    SELF_ADDRESS: 'http://localhost:3128',
    RCPWD: randomUUID(),
    FETCH_TIMEOUT: '1000',
    UPSTREAM_PROXY: appOptions?.useUpstreamProxy
      ? appOptions.upstreamProxyAddress
      : undefined,
    APP_VERSION: 'wip',
    CA_KEY_PATH: caKeyPath,
    CA_CRT_PATH: caCrtPath,
    OFFLINE_MODE: boolToEnv(appOptions?.offline),
    ALLOW_LARGE: boolToEnv(appOptions?.allowLarge),
    ALLOW_MEDIA: boolToEnv(appOptions?.allowMedia),
  };

  try {
    proxyChildProcess = fork(proxyBundleFilePath, {
      env,
      stdio: 'pipe',
    });
  } catch (err) {
    logger.error('Failed to fork proxy process', err);
    options.onClose(null);
    return;
  }

  proxyChildProcess.stdout?.on('data', (msg) => {
    logger.debug(msg.toString());
  });

  proxyChildProcess.stderr?.on('data', (msg) => {
    logger.error(msg.toString());
  });

  proxyChildProcess.on('error', (err) => {
    logger.error('Proxy process error', err);
    options.onClose(null);
  });

  proxyChildProcess.on('close', (code) => {
    logger.info(`Proxy exited with code ${code}`);
    proxyChildProcess = null;
    options.onClose(code);
  });

  proxyChildProcess.on('message', (msg) => {
    logger.debug('child->parent', msg);
  });

  // Example: send an initial message if the child expects one.
  proxyChildProcess.send('grgr', () => {
    /* callback can be used for confirmation */
  });

  logger.info('Proxy started');
}

/**
 * Gracefully terminates the proxy child process.
 */
export async function stopProxy(): Promise<void> {
  if (!proxyChildProcess) return;

  return new Promise<void>((resolve) => {
    proxyChildProcess!.on('close', () => {
      proxyChildProcess = null;
      logger.info('Proxy stopped');
      resolve();
    });
    proxyChildProcess!.kill('SIGTERM');
  });
}
