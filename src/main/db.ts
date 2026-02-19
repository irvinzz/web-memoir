import { join } from 'node:path';
import { spawn, ChildProcess } from 'node:child_process';
import { platform as osPlatform } from 'node:os';
import { app } from 'electron';
import { mkdir, readFile } from 'node:fs/promises';
import { resourcesDir } from './const';
import { createLogger } from './logger';

interface StartDBOptions {
  onClose: (code: number | null) => void;
  port?: number;          // default 3129
  cacheSizeGB?: number;   // default 1
}

let dbChildProcess: ChildProcess | null = null;

/**
 * Starts a MongoDB instance bundled with the application.
 *
 * @param options  Configuration for the MongoDB process.
 */
export async function startDB({
  onClose,
  port = 3129,
  cacheSizeGB = 1,
}: StartDBOptions) {
  const mongodLogger = createLogger('mongod');

  if (dbChildProcess) {
    mongodLogger.warn('MongoDB already running – ignoring startDB call');
    return;
  }

  const mongoDir = join(resourcesDir, 'mongodb');
  const instancePath = join(mongoDir, 'instance.json');

  let manifest: any;
  try {
    const json = await readFile(instancePath, 'utf-8');
    manifest = JSON.parse(json);
  } catch (err) {
    mongodLogger.error('Could not read MongoDB instance.json', err);
    throw err;
  }

  const binName = osPlatform() === 'win32' ? 'mongod.exe' : 'mongod';
  const binPath = join(mongoDir, manifest.binDir, binName);

  const dataPath = join(
    app.getPath('appData'),
    'offline-internet',
    'mongodb-data'
  );

  try {
    await mkdir(dataPath, { recursive: true });
  } catch (err) {
    mongodLogger.error('Could not create MongoDB data dir', err);
    throw err;
  }

  const args = [
    `--dbpath=${dataPath}`,
    '--bind_ip',
    '127.0.0.1',
    `--port=${port}`,
    '--auth',
    `--wiredTigerCacheSizeGB=${cacheSizeGB}`,
    '--quiet',
  ];

  const proc = spawn(binPath, args, { stdio: 'ignore' });

  proc.stdout?.on('data', (msg) => mongodLogger.debug(msg.toString()));
  proc.stderr?.on('data', (msg) => mongodLogger.error(msg.toString()));

  proc.on('close', (code) => {
    mongodLogger.info(`MongoDB exited with code ${code}`);
    dbChildProcess = null;
    onClose(code);
  });

  proc.on('error', (err) => {
    mongodLogger.error('Failed to start MongoDB process', err);
    dbChildProcess = null;
    onClose(null);
  });

  dbChildProcess = proc;
}

/**
 * Gracefully stops the running MongoDB instance.
 */
export async function stopDB(): Promise<void> {
  if (!dbChildProcess) return Promise.resolve();

  return new Promise<void>((resolve) => {
    dbChildProcess!.on('close', () => {
      dbChildProcess = null;
      resolve();
    });
    dbChildProcess!.kill('SIGTERM');
  });
}
