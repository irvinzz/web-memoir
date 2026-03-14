import { join } from 'node:path';
import { spawn, ChildProcess } from 'node:child_process';
import { platform as osPlatform } from 'node:os';
import { mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { kill } from 'node:process';

import { app } from 'electron';
import getPort from 'get-port';
import waitPort from 'wait-port';

import { resourcesDir } from './const';
import { createLogger } from './logger';
import { waitProcessPort } from './process';

const logger = createLogger('mongod');
interface StartDBOptions {
  cacheSizeGB?: number;
  onClose(code: number | null): void;
}

let dbChildProcess: ChildProcess | null = null;
let listenPort: number | null = null;

interface DBInstance {
  port: number;
  process: ChildProcess;
}

export function getRunningDBInstance(): DBInstance | null {
  if (dbChildProcess && listenPort) {
    return { port: listenPort, process: dbChildProcess };
  }

  return null;
}

export async function getDBInstance(options: StartDBOptions): Promise<DBInstance> {
  return getRunningDBInstance() || startDBInstance(options);
}

async function startDBInstance({
  cacheSizeGB = 1,
  onClose,
}: StartDBOptions): Promise<{ port: number; process: ChildProcess }> {
  const mongoDir = join(resourcesDir, 'mongodb');
  const instancePath = join(mongoDir, 'instance.json');

  let manifest: { binDir: string } | null = null;
  try {
    const json = await readFile(instancePath, 'utf-8');
    manifest = JSON.parse(json);
  } catch (err) {
    logger.error('Could not read MongoDB instance.json', err);
    throw err;
  }

  const binName = osPlatform() === 'win32' ? 'mongod.exe' : 'mongod';
  const binPath = join(mongoDir, manifest!.binDir, binName);

  const dataPath = join(app.getPath('appData'), 'offline-internet', 'mongodb-data');

  await mkdir(dataPath, { recursive: true });

  const lockFilePath = join(dataPath, 'mongod.lock');
  if (existsSync(lockFilePath)) {
    const pidCode = await readFile(lockFilePath, 'utf-8');
    if (pidCode) {
      const pidNumber = Number.parseInt(pidCode, 10);
      if (!Number.isNaN(pidNumber)) {
        try {
          kill(pidNumber, 'SIGTERM');
        } catch (e) {}
      }
    }
  }

  listenPort = await getPort({ port: 27017 });
  const args = [
    `--dbpath=${dataPath}`,
    '--bind_ip',
    '127.0.0.1',
    `--port=${listenPort}`,
    // '--auth',
    `--wiredTigerCacheSizeGB=${cacheSizeGB}`,
    '--quiet',
  ];

  const process = spawn(binPath, args, { stdio: 'ignore' });

  logger.info('DB Instance started');

  process.stdout?.on('data', (msg) => logger.debug(msg.toString()));
  process.stderr?.on('data', (msg) => logger.error(msg.toString()));

  await waitProcessPort(process, listenPort);

  process.on('close', (code) => {
    logger.info(`MongoDB exited with code ${code}`);
    dbChildProcess = null;
    listenPort = null;
    onClose(code);
  });

  process.on('error', (err) => {
    logger.error('Failed to start MongoDB process', err);
    dbChildProcess = null;
    listenPort = null;
  });

  dbChildProcess = process;

  await waitPort({
    port: listenPort,
    timeout: 30000,
    output: 'silent',
  });

  return { port: listenPort, process: dbChildProcess };
}
