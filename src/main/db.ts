import { join } from 'node:path';
import { spawn, ChildProcess } from 'node:child_process';
import { platform as osPlatform } from 'node:os';
import { mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { kill } from 'node:process';

import { app } from 'electron';
import getPort from 'get-port';
import type mongodbType from 'mongodb';

import { transformSpaceNameToDBName } from '@shared';

import { resourcesDir } from './const';
import { createLogger } from './logger';
import { waitProcessPort } from './process';

const logger = createLogger('mongod');

let dbChildProcess: ChildProcess | null = null;
let listenPort: number | null = null;

export interface DBInstanceDescription {
  port: number;
  process: ChildProcess;
}

export function getRunningDBInstance(): DBInstanceDescription | null {
  if (dbChildProcess && listenPort) {
    return { port: listenPort, process: dbChildProcess };
  }

  return null;
}

export async function getDBInstance(): Promise<DBInstanceDescription> {
  return getRunningDBInstance() || startDBInstance();
}

async function startDBInstance(): Promise<{ port: number; process: ChildProcess }> {
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

  const dataPath = join(app.getPath('appData'), 'web-memoir', 'mongodb-data');

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

  listenPort = await getPort({ port: [27017, 40035] });
  const args = [
    `--dbpath=${dataPath}`,
    '--bind_ip',
    '127.0.0.1',
    `--port=${listenPort}`,
    // '--auth',
    `--wiredTigerCacheSizeGB=${1}`,
    '--quiet',
  ];

  const process = spawn(binPath, args, { stdio: 'ignore' });

  process.stdout?.on('data', (msg) => logger.debug(msg.toString()));
  process.stderr?.on('data', (msg) => logger.error(msg.toString()));

  await waitProcessPort(process, listenPort);

  logger.info('DB Instance started');

  process.on('close', (code) => {
    logger.info(`MongoDB exited with code ${code}`);
    dbChildProcess = null;
    listenPort = null;
  });

  process.on('error', (err) => {
    logger.error('Failed to start MongoDB process', err);
    dbChildProcess = null;
    listenPort = null;
  });

  dbChildProcess = process;

  return { port: listenPort, process: dbChildProcess };
}

export async function getSpaceDB(spaceName: string): Promise<mongodbType.Db> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mongodb = require('mongodb') as typeof mongodbType;
  const dbInstance = await getDBInstance();
  const client = new mongodb.MongoClient(`mongodb://localhost:${dbInstance.port}`);
  await client.connect();
  return client.db(transformSpaceNameToDBName(spaceName));
}
